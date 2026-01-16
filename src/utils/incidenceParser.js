import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js'; // IMPORTANTE: Librería OCR

// Configuración del Worker de PDF para Vite (Local)
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

const MONTH_MAP = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

/**
 * Función auxiliar: Convierte una página PDF a imagen y aplica OCR
 */
const performOCR = async (pdf, pageNum) => {
  try {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // Escala x2 para mejorar nitidez
    
    // Crear canvas en memoria
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Renderizar PDF en el canvas
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Ejecutar Tesseract sobre el canvas
    const { data: { text } } = await Tesseract.recognize(
      canvas,
      'spa', // Idioma español
      { logger: m => console.log(`OCR Progreso P${pageNum}:`, m) }
    );
    
    return text;
  } catch (err) {
    console.error(`Error OCR en página ${pageNum}:`, err);
    return "";
  }
};

export const parseIncidencePDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    let usedOCR = false;

    // 1. INTENTO RÁPIDO: Extracción de texto normal
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += ` ${pageText} `;
    }

    // 2. VERIFICACIÓN: ¿Es una imagen escaneada?
    // Si hay menos de 50 caracteres (probablemente vacío), activamos OCR
    if (fullText.trim().length < 50) {
      console.warn("Texto insuficiente detectado. Activando OCR (Tesseract)...");
      usedOCR = true;
      fullText = ""; // Reiniciamos para llenar con OCR
      
      // Procesamos solo las primeras 2 páginas para no tardar mucho
      const pagesToScan = Math.min(pdf.numPages, 2);
      for (let i = 1; i <= pagesToScan; i++) {
        const ocrText = await performOCR(pdf, i);
        fullText += ` ${ocrText} `;
      }
    }

    // --- PROCESAMIENTO DE TEXTO (Igual que antes) ---
    // Limpieza agresiva de caracteres basura del OCR
    const cleanText = fullText
      .replace(/\s+/g, ' ') // Espacios dobles
      .replace(/[|«»_—]/g, '') // Caracteres comunes de error OCR
      .trim();

    console.log("--- TEXTO FINAL (OCR: " + usedOCR + ") ---", cleanText.substring(0, 500));

    // BÚSQUEDA DE FOLIO
    const folioMatch = cleanText.match(/Folio.*?(\d{4,})/i);
    const folio = folioMatch ? folioMatch[1] : 'S/N (OCR)';

    const timestampsFound = [];

    // Patrón 1: Log Técnico Incrustado (Op DE-100)
    const opDe100Regex = /Op\s*DE[-_]?100\s*[:\.]?\s*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/gi;
    let match;
    while ((match = opDe100Regex.exec(cleanText)) !== null) {
        // Intentamos buscar hora HH:MM:SS después de la fecha
        const afterContext = cleanText.substring(match.index, match.index + 50);
        const timeMatch = afterContext.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        let h=12, m=0, s=0;
        if(timeMatch) { h=timeMatch[1]; m=timeMatch[2]; s=timeMatch[3]; }

        const d = new Date(match[3], match[2] - 1, match[1], h, m, s);
        timestampsFound.push({ dateObj: d, source: "Log Op DE-100 (OCR)", type: 'exact_log' });
    }

    // Patrón 2: Fecha Verbal (Actas GSI)
    const verbalRegex = /d[ií]a\s+(\d{1,2})\s+del?\s+mes\s+de\s+([a-z]+)/gi;
    while ((match = verbalRegex.exec(cleanText)) !== null) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        // Buscamos año cercano
        const context = cleanText.substring(match.index, match.index + 100);
        const yearMatch = context.match(/20\d{2}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

        if (MONTH_MAP.hasOwnProperty(monthName)) {
            const d = new Date(year, MONTH_MAP[monthName], day);
            timestampsFound.push({ dateObj: d, source: "Fecha Verbal (OCR)", type: 'verbose_date' });
        }
    }

    // Patrón 3: Fechas Simples (Respaldo)
    if (timestampsFound.length === 0) {
       const simpleDateRegex = /(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{4})/g;
       while ((match = simpleDateRegex.exec(cleanText)) !== null) {
          if (parseInt(match[3]) > 2020) { // Filtro de año
             const d = new Date(match[3], match[2] - 1, match[1]);
             timestampsFound.push({ dateObj: d, source: match[0], type: 'simple_date' });
          }
       }
    }

    return {
      fileName: file.name,
      folio,
      debugText: cleanText, // Texto completo para depuración
      targetTimestamps: timestampsFound,
      usedOCR // Flag para avisar al usuario
    };

  } catch (error) {
    console.error("Error parser PDF:", error);
    throw new Error("Fallo en lectura/OCR: " + error.message);
  }
};

export const analyzeDiscrepancy = (pdfData, depositLogs, errorLogs) => {
  if (!pdfData || !pdfData.debugText || pdfData.debugText.length < 20) {
      return {
          isMatchFound: false,
          folio: 'S/N',
          technicalConclusion: "FALLO DE OCR: No se pudo reconocer texto legible en la imagen.",
          debugText: "OCR vacío."
      };
  }

  if (pdfData.targetTimestamps.length === 0) {
      return {
          isMatchFound: false,
          folio: pdfData.folio,
          technicalConclusion: `OCR COMPLETADO PERO SIN FECHAS: Se leyó el texto (ver debug) pero no se detectaron fechas válidas.`,
          debugText: pdfData.debugText
      };
  }

  const analysis = {
    isMatchFound: false,
    matchedLog: null,
    folio: pdfData.folio,
    technicalConclusion: '',
    debugText: pdfData.debugText
  };

  for (const ts of pdfData.targetTimestamps) {
      const targetDate = ts.dateObj;
      const matchingError = errorLogs.find(log => {
          const logDate = new Date(log.timestamp);
          return logDate.getDate() === targetDate.getDate() &&
                 logDate.getMonth() === targetDate.getMonth() &&
                 logDate.getFullYear() === targetDate.getFullYear();
      });

      if (matchingError) {
          analysis.isMatchFound = true;
          analysis.matchedLog = matchingError;
          analysis.technicalConclusion = `COINCIDENCIA CONFIRMADA (Vía OCR): El acta escaneada fecha el incidente el ${targetDate.toLocaleDateString()}. Se encontró el error "${matchingError.name}" registrado ese día.`;
          return analysis;
      }
  }

  const refDate = pdfData.targetTimestamps[0].dateObj;
  analysis.technicalConclusion = `SIN COINCIDENCIA TÉCNICA: El OCR detectó la fecha ${refDate.toLocaleDateString()}, pero no hay errores en los logs ese día.`;
  return analysis;
};