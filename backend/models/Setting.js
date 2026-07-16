const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
