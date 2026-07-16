const mongoose = require('mongoose');

const ExcelTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operation: { type: String, enum: ['accounting', 'hygiene', 'analytics'], required: true },
  mapping: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ExcelTemplate', ExcelTemplateSchema);

