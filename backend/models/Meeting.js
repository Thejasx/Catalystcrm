const mongoose = require('mongoose');
const { Schema } = mongoose;

const meetingSchema = new Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: { type: String },
  googleEventId: { type: String },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
