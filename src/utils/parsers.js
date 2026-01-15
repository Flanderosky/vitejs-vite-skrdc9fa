// src/utils/parsers.js

/**
 * Parsea el CSV de la Matriz de Errores
 */
export const parseMatrixCSV = (text) => {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  let headerIndex = -1;
  let headers = [];

  // Buscar encabezado dinámicamente
  for (let i = 0; i < lines.length; i++) {
    const lineUpper = lines[i].toUpperCase();
    if (
      lineUpper.includes('CODIGO DE ERROR') ||
      lineUpper.includes('CÓDIGO DE ERROR')
    ) {
      headerIndex = i;
      headers = lines[i]
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((h) => h.trim().replace(/^"|"$/g, '').toUpperCase());
      break;
    }
  }

  if (headerIndex === -1) {
    headerIndex = 0;
    headers = lines[0]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((h) => h.trim().replace(/^"|"$/g, '').toUpperCase());
  }

  const data = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (row && row.length > 0) {
      const entry = {};
      headers.forEach((header, index) => {
        let val = row[index] ? row[index].trim().replace(/^"|"$/g, '') : '';
        entry[header] = val;
      });

      const code = entry['CODIGO DE ERROR'] || entry['CÓDIGO DE ERROR'];
      if (code && code.length > 2) {
        data.push({
          'CODIGO DE ERROR': code,
          'DESCRIPCION DEL CODIGO':
            entry['DESCRIPCION DEL CODIGO'] || 'Sin descripción',
          CATEGORIA: entry['CATEGORIA'] || 'General',
          'SUB CATEGORIA': entry['SUB CATEGORIA'] || '',
          'TIPO DE SOLUCIÓN': entry['TIPO DE SOLUCIÓN'] || '',
          'TIEMPO DE RECUPERACION (MIN)':
            entry['TIEMPO DE RECUPERACION (MIN)'] || '0',
        });
      }
    }
  }
  return data;
};

/**
 * Calcula el monto total en efectivo basado en el array de partes del log
 */
export const calculateCashAmount = (parts) => {
  let total = 0;
  try {
    // El formato asume: [..., denominacion, "MXN", cantidad, ...]
    for (let i = 6; i < parts.length; i += 3) {
      if (i + 2 >= parts.length) break;
      const denomination = parseFloat(parts[i]);
      const count = parseFloat(parts[i + 2]);

      if (!isNaN(denomination) && !isNaN(count)) {
        total += denomination * count;
      }
    }
  } catch (e) {
    console.error('Error calculando monto', e);
  }
  return total;
};
