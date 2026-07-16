const Excel = require('exceljs');

/**
 * Process accounting or data‑hygiene worksheets.
 * This example simply copies the original worksheet to a new workbook
 * and returns the workbook buffer. Real logic would perform transformations
 * based on the user‑provided mapping.
 */
async function processAccounting(worksheet, mapping) {
  const outWorkbook = new Excel.Workbook();
  const outSheet = outWorkbook.addWorksheet('Processed');

  // Copy header row applying mapping (if mapping provided)
  const headerRow = worksheet.getRow(1);
  const newHeaders = headerRow.values.slice(1).map(col => {
    // Find the system field that maps to this column
    const entry = Object.entries(mapping).find(([, userCol]) => userCol === col);
    return entry ? entry[0] : col;
  });
  outSheet.addRow(newHeaders);

  // Copy data rows
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip original header
    const values = row.values.slice(1);
    outSheet.addRow(values);
  });

  // Generate buffer
  return await outWorkbook.xlsx.writeBuffer();
}

/**
 * Process analytics worksheet and return a simple summary and chart data.
 * For demonstration we calculate total rows and produce dummy chart datasets.
 */
async function processAnalytics(worksheet, mapping) {
  const totalRows = worksheet.rowCount - 1; // exclude header
  const summary = { totalRows };

  // Dummy chart data based on first numeric column (if any)
  const firstNumericColIndex = worksheet.getRow(1).values.findIndex(v => typeof v === 'string' && v.toLowerCase().includes('value'));
  const data = [];
  if (firstNumericColIndex > 0) {
    worksheet.eachRow({ includeEmpty: false }, (row, idx) => {
      if (idx === 1) return;
      const val = row.getCell(firstNumericColIndex).value;
      if (typeof val === 'number') {
        data.push({ name: `R${idx - 1}`, value: val });
      }
    });
  }

  const charts = [
    { type: 'bar', data },
    { type: 'line', data },
    { type: 'pie', data }
  ];

  return { summary, charts };
}

module.exports = { processAccounting, processAnalytics };
