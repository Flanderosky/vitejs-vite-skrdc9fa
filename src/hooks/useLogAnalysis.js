// src/hooks/useLogAnalysis.js
import { useState, useMemo, useEffect } from 'react';
import { parseMatrixCSV, calculateCashAmount } from '../utils/parsers';

export function useLogAnalysis() {
  // --- Estados ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matrixData, setMatrixData] = useState([]);
  const [processedLogs, setProcessedLogs] = useState([]);
  const [unverifiedLogs, setUnverifiedLogs] = useState([]);
  const [collectLogs, setCollectLogs] = useState([]);
  const [depositLogs, setDepositLogs] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ totalFiles: 0, totalErrors: 0 });

  // --- Handlers ---

  // Carga de Matriz
  const processMatrixFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = parseMatrixCSV(event.target.result);
        if (parsedData.length === 0) {
          alert('El archivo parece vacío o sin códigos válidos.');
        } else {
          setMatrixData(parsedData);
          alert(`✅ Matriz cargada: ${parsedData.length} códigos importados.`);
        }
      } catch (err) {
        alert('Error al procesar el archivo CSV.');
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
  };

  // Carga de Logs (La lógica pesada)
  const processLogFiles = async (files) => {
    if (files.length === 0) return;
    if (matrixData.length === 0) {
      alert('Primero carga la Matriz de Errores en Configuración.');
      setActiveTab('config');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Reset temporal
    let logResults = [];
    let unverifiedResults = [];
    let collectResults = [];
    let depositResults = [];
    let errorCount = 0;

    const CHUNK_SIZE = 50;
    const errorMap = new Map();
    matrixData.forEach((item) => errorMap.set(item['CODIGO DE ERROR'], item));
    const errorRegex = /\bE[A-F0-9]{5}\b/g;

    // Procesamiento por lotes
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      const chunkPromises = chunk.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const content = ev.target.result;
            const fileNameUpper = file.name.toUpperCase();

            // Lógica financiera
            if (
              fileNameUpper.includes('COLLECT') ||
              fileNameUpper.includes('DEPOSIT') ||
              fileNameUpper.includes('UNVERIFIED')
            ) {
              const lines = content
                .split('\n')
                .filter((l) => l.trim().length > 0);
              const lastLine = lines[lines.length - 1];
              const parts = lastLine.split(',');

              let date = parts.length > 5 ? parts[4] : 'Desconocida';
              let amount = parts.length > 5 ? calculateCashAmount(parts) : 0;

              const resultObj = {
                fileName: file.name,
                timestamp: date,
                amount: amount,
                rawContent: lastLine,
              };

              if (fileNameUpper.includes('COLLECT'))
                resolve({ ...resultObj, type: 'collect' });
              else if (fileNameUpper.includes('DEPOSIT'))
                resolve({ ...resultObj, type: 'deposit' });
              else resolve({ ...resultObj, type: 'unverified' });
              return;
            }

            // Lógica de Errores
            const foundCodes = content.match(errorRegex) || [];
            const fileErrors = foundCodes.map((code) => {
              const details = errorMap.get(code);
              return {
                code: code,
                description: details
                  ? details['DESCRIPCION DEL CODIGO']
                  : 'Código no encontrado',
                category: details ? details['CATEGORIA'] : 'Desconocido',
                subCategory: details ? details['SUB CATEGORIA'] : 'Desconocido',
                solution: details ? details['TIPO DE SOLUCIÓN'] : 'N/A',
                timeRecovery: details
                  ? parseFloat(details['TIEMPO DE RECUPERACION (MIN)']) || 0
                  : 0,
              };
            });

            if (fileErrors.length > 0) {
              resolve({
                type: 'error_log',
                fileName: file.name,
                timestamp: file.lastModified,
                errors: fileErrors,
                errorCount: fileErrors.length,
              });
            } else {
              resolve(null);
            }
          };
          reader.readAsText(file);
        });
      });

      const chunkResults = await Promise.all(chunkPromises);

      chunkResults.forEach((res) => {
        if (!res) return;
        if (res.type === 'collect') collectResults.push(res);
        else if (res.type === 'deposit') depositResults.push(res);
        else if (res.type === 'unverified') unverifiedResults.push(res);
        else if (res.type === 'error_log') {
          logResults.push(res);
          errorCount += res.errorCount;
        }
      });

      setProgress(Math.round(((i + chunk.length) / files.length) * 100));
      await new Promise((r) => setTimeout(r, 10)); // Yield al thread principal
    }

    // Actualizar Estado Global
    setProcessedLogs(logResults);
    setUnverifiedLogs(unverifiedResults);
    setCollectLogs(
      collectResults.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )
    );
    setDepositLogs(
      depositResults.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )
    );
    setStats({
      totalFiles: files.length,
      filesWithErrors: logResults.length,
      totalErrors: errorCount,
    });
    setIsProcessing(false);
    setActiveTab('dashboard');
  };

  // --- Datos Derivados (Memos) ---

  const topErrorsData = useMemo(() => {
    const counts = {};
    processedLogs.forEach((file) => {
      file.errors.forEach(
        (err) => (counts[err.code] = (counts[err.code] || 0) + 1)
      );
    });
    return Object.entries(counts)
      .map(([code, count]) => {
        const info = matrixData.find((m) => m['CODIGO DE ERROR'] === code);
        return {
          name: code,
          count: count,
          desc: info ? info['DESCRIPCION DEL CODIGO'] : 'Sin descripción',
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [processedLogs, matrixData]);

  const errorTrendData = useMemo(() => {
    const dataByDate = {};
    processedLogs.forEach((file) => {
      if (file.errorCount > 0) {
        const dateObj = new Date(file.timestamp);
        if (!isNaN(dateObj)) {
          const dateKey = dateObj.toLocaleDateString();
          dataByDate[dateKey] = (dataByDate[dateKey] || 0) + file.errorCount;
        }
      }
    });
    return Object.entries(dataByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [processedLogs]);

  const categoryData = useMemo(() => {
    const counts = {};
    processedLogs.forEach((f) =>
      f.errors.forEach((e) => {
        const cat = e.category || 'Sin Categoría';
        counts[cat] = (counts[cat] || 0) + 1;
      })
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [processedLogs]);

  const amounts = useMemo(
    () => ({
      unverified: unverifiedLogs.reduce((acc, curr) => acc + curr.amount, 0),
      collected: collectLogs.reduce((acc, curr) => acc + curr.amount, 0),
      deposited: depositLogs.reduce((acc, curr) => acc + curr.amount, 0),
    }),
    [unverifiedLogs, collectLogs, depositLogs]
  );

  const successRateData = useMemo(() => {
    const totalOps = depositLogs.length + unverifiedLogs.length;
    if (totalOps === 0) return [];
    return [
      { name: 'Depósitos Exitosos', value: depositLogs.length },
      { name: 'No Verificados / Fallidos', value: unverifiedLogs.length },
    ];
  }, [depositLogs, unverifiedLogs]);

  const successPercentage = useMemo(() => {
    const total = depositLogs.length + unverifiedLogs.length;
    return total > 0 ? ((depositLogs.length / total) * 100).toFixed(1) : 0;
  }, [depositLogs, unverifiedLogs]);

  return {
    // State
    activeTab,
    setActiveTab,
    matrixData,
    processedLogs,
    unverifiedLogs,
    collectLogs,
    depositLogs,
    isProcessing,
    progress,
    stats,

    // Computed
    topErrorsData,
    errorTrendData,
    categoryData,
    amounts,
    successRateData,
    successPercentage,

    // Actions
    processMatrixFile,
    processLogFiles,
  };
}
