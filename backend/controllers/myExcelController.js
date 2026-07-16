const Excel = require('exceljs');
const stringSimilarity = require('string-similarity');
const ExcelTemplate = require('../models/ExcelTemplate');
const { processAccounting, processAnalytics } = require('../utils/excelUtils');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


/**
 * Detect headers from uploaded file and return an array of column names.
 * Also performs fuzzy matching suggestions against required fields for the operation.
 */
exports.detectHeaders = async (req, res) => {
  try {
    const { operation } = req.body; // expected values: accounting, hygiene, analytics
    if (!operation) return res.status(400).json({ success: false, message: 'Operation is required' });

    const buffer = req.file.buffer;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const columns = headerRow.values.slice(1).map(col => col.toString().trim()); // remove first empty element

    // Define required fields per operation (simplified example)
    const requiredFieldsMap = {
      accounting: ['Revenue', 'Expense', 'Date', 'Account'],
      hygiene: ['Name', 'Email', 'Phone'],
      analytics: ['Metric', 'Value', 'Category']
    };
    const required = requiredFieldsMap[operation] || [];

    // Generate suggestions using string-similarity
    const suggestions = columns.map(col => {
      const matches = stringSimilarity.findBestMatch(col, required);
      return { column: col, bestMatch: matches.bestMatch.target, rating: matches.bestMatch.rating };
    });

    // Return columns and suggestions to frontend
    return res.json({ success: true, columns: suggestions });
  } catch (err) {
    console.error('detectHeaders error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Process uploaded file based on selected operation and user mapping.
 * Expected body: operation, mapping (JSON string), optional saveTemplate flag.
 */
exports.processData = async (req, res) => {
  try {
    const { operation, mapping, saveTemplate } = req.body;
    if (!operation || !mapping) return res.status(400).json({ success: false, message: 'Missing parameters' });
    const userId = req.user.id; // auth middleware attaches user
    const finalMapping = JSON.parse(mapping); // { systemField: userColumn }

    const buffer = req.file.buffer;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    // Save template if requested
    if (saveTemplate === 'true') {
      await ExcelTemplate.findOneAndUpdate(
        { userId, operation },
        { mapping: finalMapping },
        { upsert: true, new: true }
      );
    }

    if (operation === 'accounting' || operation === 'hygiene') {
      const outBuffer = await processAccounting(worksheet, finalMapping);
      const base64 = outBuffer.toString('base64');
      const downloadUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      return res.json({ success: true, downloadUrl });
    } else if (operation === 'analytics') {
      const { summary, charts } = await processAnalytics(worksheet, finalMapping);
      return res.json({ success: true, summary, charts });
    } else {
      return res.status(400).json({ success: false, message: 'Unknown operation' });
    }
  } catch (err) {
    console.error('processData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Analyze uploaded Excel data using Google Generative AI.
 * Returns a natural-language summary and chart configuration data.
 */
exports.analyzeData = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { operation } = req.body; // optional, can guide prompt
    const buffer = req.file.buffer;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    // Extract header and rows as plain JSON
    const header = worksheet.getRow(1).values.slice(1).map(v => v.toString());
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, idx) => {
      if (idx === 1) return; // skip header
      const values = row.values.slice(1);
      const obj = {};
      header.forEach((h, i) => { obj[h] = values[i]; });
      rows.push(obj);
    });

    // Build prompt for Gemini
    const dataSample = JSON.stringify(rows.slice(0, 10)); // sample first 10 rows
    const prompt = `You are an assistant that analyses spreadsheet data.
Operation: ${operation || 'general'}
Data sample (first 10 rows): ${dataSample}
Provide a concise summary of insights and suggest up to three chart types (with minimal config) that would best visualise the data.`;

    // Call Gemini model
    let summary = '';
    let charts = [];
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const [summaryPart, ...chartParts] = text.split('---');
      summary = summaryPart.trim();
      try {
        charts = chartParts.map(p => JSON.parse(p.trim()));
      } catch (e) {
        charts = chartParts.map(p => ({ description: p.trim() }));
      }
    } catch (geminiErr) {
      console.error('Gemini error:', geminiErr);
      // Fallback placeholder response
      summary = 'Placeholder summary: data appears consistent. No obvious anomalies detected.';
      charts = [{ type: 'bar', data: [{ name: 'Sample', value: 10 }, { name: 'Example', value: 20 }] }];
    }

    return res.json({ success: true, summary, charts });
  } catch (err) {
    console.error('analyzeData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { detectHeaders: exports.detectHeaders, processData: exports.processData, analyzeData: exports.analyzeData };
