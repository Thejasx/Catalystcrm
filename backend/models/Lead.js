const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['New', 'Follow-up', 'Qualified', 'Won', 'Lost'], default: 'New' },
  notes: { type: String },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
  dealRate: { type: Number, default: 0, min: 0 },
  expectedCloseDate: { type: Date },
  hotLead: { type: Boolean, default: false },
  dealOutcome: { type: String, enum: ['pending', 'won', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
