import { useState, useMemo } from 'react';
import { parseMatrixCSV } from '../utils/parsers';

const calculateLineAmount = (parts) => {
  let total = 0;
  for (let i = 6; i < parts.length; i += 3) {
    const value = parseFloat(parts[i]);
    const count = parseInt(parts[i + 2]);
    if (!isNaN(value) && !isNaN(count)) total += value * count;
  }
  return total;
};

export function useLogAnalysis() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matrixData, setMatrixData] = useState([]);
  
  const [processedLogs, setProcessedLogs] = useState([]);
  const [unverifiedLogs, setUnverifiedLogs] = useState([]);
  const [collectLogs, setCollectLogs] = useState([]);
  const [depositLogs, setDepositLogs] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ totalFiles: 0, totalErrors: 0 });

  const processMatrixFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = parseMatrixCSV(event.target.result);
        setMatrixData(parsedData.length > 0 ? parsedData : []);
        if (parsedData.length > 0) alert(`✅ Matriz cargada: ${parsedData.length} códigos.`);
      } catch (err) { alert('Error al procesar CSV.'); }
    };
    reader.readAsText(file, 'ISO-8859-1');
  };

  const processLogFiles = async (files) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    let logResults = [];
    let unverifiedResults = [];
    let collectResults = [];
    let depositResults = [];
    let errorCount = 0;

    const CHUNK_SIZE = 100;
    const errorMap = new Map();
    if (matrixData.length > 0) {
      matrixData.forEach((item) => errorMap.set(item['CODIGO DE ERROR'], item));
    }
    const errorCodeRegex = /E[A-F0-9]{5,6}/;

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      const chunkPromises = chunk.map((file) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const content = ev.target.result;
            const fileName = file.name;
            const fileNameUpper = fileName.toUpperCase();
            
            const lines = content.split('\n').filter(l => l.trim().length > 10);
            const lastLine = lines[lines.length - 1];

            if (!lastLine) { resolve(null); return; }

            const parts = lastLine.split(',');
            let timestamp = parts[4] || file.lastModified; 
            const amount = calculateLineAmount(parts);

            let logData = {
              fileName,
              timestamp,
              amount,
              rawContent: lastLine,
              description: 'Evento del Sistema',
              status: 'Info', // Default
              type: 'unknown'
            };

            // --- LÓGICA CORREGIDA AQUÍ ---
            if (fileNameUpper.includes('COLLECT')) {
              logData.type = 'collect';
              logData.status = 'Recolección'; // <--- CAMBIO CLAVE: Texto explícito
              logData.description = 'Recolección de Valores (CIT)';
              resolve(logData);
              return;

            } else if (fileNameUpper.includes('DEPOSIT')) {
              logData.type = 'deposit';
              logData.status = 'Depósito'; // También lo ponemos en español
              logData.description = 'Depósito Bancario Exitoso';
              resolve(logData);
              return;

            } else if (fileNameUpper.includes('UNVERIFIED')) {
              logData.type = 'unverified';
              logData.status = 'No Verificado';
              logData.description = 'Billetes No Verificados / Rechazo';
              resolve(logData);
              return;
            }

            // --- ERRORES ---
            let errorCodeRaw = parts[5] || '';
            let match = errorCodeRaw.match(errorCodeRegex);
            let code = match ? match[0] : null;

            if (!code) {
              const globalMatch = lastLine.match(errorCodeRegex);
              if (globalMatch) code = globalMatch[0];
            }

            if (code) {
              const errorDetails = errorMap.get(code);
              const errorDesc = errorDetails ? errorDetails['DESCRIPCION DEL CODIGO'] : 'Código Desconocido';
              
              logData.status = 'Error';
              logData.description = `${code}: ${errorDesc}`;
              
              if (fileNameUpper.includes('STORINGERROR')) {
                logData.description = `Error Almacenamiento ($${amount}) - ${code}`;
              }
              if (fileNameUpper.includes('RECOVERY')) {
                 logData.status = 'Recuperado'; // Estado positivo
                 logData.description = `Recuperación Sistema - ${code}`;
              }
              if (fileNameUpper.includes('EVENTCLEAR')) {
                 logData.status = 'Limpieza';
                 logData.description = `Limpieza Evento - ${code}`;
              }

              const errorObj = {
                code: code,
                description: errorDesc,
                category: errorDetails ? errorDetails['CATEGORIA'] : 'Evento Sistema',
                subCategory: errorDetails ? errorDetails['SUB CATEGORIA'] : 'General',
                solution: errorDetails ? errorDetails['TIPO DE SOLUCIÓN'] : 'N/A',
              };

              resolve({
                ...logData,
                type: 'error_log',
                errors: [errorObj],
                errorCount: 1
              });
              return;
            }
            resolve(null);
          };
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
      }));

      const results = await Promise.all(chunkPromises);

      for (const res of results) {
        if (!res) continue;
        switch (res.type) {
          case 'collect': collectResults.push(res); break;
          case 'deposit': depositResults.push(res); break;
          case 'unverified': unverifiedResults.push(res); break;
          case 'error_log': logResults.push(res); errorCount += res.errorCount; break;
        }
      }
      setProgress(Math.round(((i + chunk.length) / files.length) * 100));
      await new Promise(r => setTimeout(r, 0));
    }

    setProcessedLogs(logResults);
    setUnverifiedLogs(unverifiedResults);
    
    const dateSorter = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
    setCollectLogs(collectResults.sort(dateSorter));
    setDepositLogs(depositResults.sort(dateSorter));
    
    setStats({
      totalFiles: files.length,
      filesWithErrors: logResults.length,
      totalErrors: errorCount,
    });
    
    setIsProcessing(false);
    setActiveTab('dashboard');
  };

  const topErrorsData = useMemo(() => {
    const counts = {};
    processedLogs.forEach((file) => {
      file.errors.forEach((err) => (counts[err.code] = (counts[err.code] || 0) + 1));
    });
    return Object.entries(counts)
      .map(([code, count]) => {
        const info = matrixData.find((m) => m['CODIGO DE ERROR'] === code);
        return { name: code, count: count, desc: info ? info['DESCRIPCION DEL CODIGO'] : 'Sin descripción' };
      })
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }, [processedLogs, matrixData]);

  const errorTrendData = useMemo(() => {
    const dataByDate = {};
    processedLogs.forEach((file) => {
      const dateObj = new Date(file.timestamp);
      if (!isNaN(dateObj)) {
        const dateKey = dateObj.toLocaleDateString();
        dataByDate[dateKey] = (dataByDate[dateKey] || 0) + 1;
      }
    });
    return Object.entries(dataByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [processedLogs]);

  const categoryData = useMemo(() => {
    const counts = {};
    processedLogs.forEach((f) => f.errors.forEach((e) => {
        const cat = e.category || 'Sin Categoría';
        counts[cat] = (counts[cat] || 0) + 1;
    }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [processedLogs]);

  const amounts = useMemo(() => ({
      unverified: unverifiedLogs.reduce((acc, curr) => acc + curr.amount, 0),
      collected: collectLogs.reduce((acc, curr) => acc + curr.amount, 0),
      deposited: depositLogs.reduce((acc, curr) => acc + curr.amount, 0),
  }), [unverifiedLogs, collectLogs, depositLogs]);

  const successRateData = useMemo(() => {
    const totalOps = depositLogs.length + unverifiedLogs.length;
    if (totalOps === 0) return [];
    return [
      { name: 'Depósitos Exitosos', value: depositLogs.length },
      { name: 'Fallidos / No Verif.', value: unverifiedLogs.length },
    ];
  }, [depositLogs, unverifiedLogs]);

  const successPercentage = useMemo(() => {
    const total = depositLogs.length + unverifiedLogs.length;
    return total > 0 ? ((depositLogs.length / total) * 100).toFixed(1) : 0;
  }, [depositLogs, unverifiedLogs]);

  return {
    activeTab, setActiveTab, matrixData, processedLogs, unverifiedLogs, collectLogs, depositLogs,
    isProcessing, progress, stats, topErrorsData, errorTrendData, categoryData, amounts, successRateData, successPercentage,
    processMatrixFile, processLogFiles,
  };
}