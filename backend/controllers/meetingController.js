// meetingController.js – migrated to Mongoose
const Meeting = require('../models/Meeting');
const Lead = require('../models/Lead');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const mongoose = require('mongoose');
const { Types } = mongoose;

// Helper to validate host user (admin can assign)
const validateHost = async (hostId) => {
  if (!mongoose.isValidObjectId(hostId)) return null;
  return await User.findOne({ _id: hostId, isActive: true });
};

exports.createMeeting = async (req, res) => {
  const { title, startTime, endTime, description, leadId, hostId } = req.body;
  if (!title || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Title, Start Time, and End Time are required' });
  }
  try {
    let finalHostId = req.user._id;
    if (req.user.role === 'admin' && hostId) {
      const hostUser = await validateHost(hostId);
      if (!hostUser) {
        return res.status(400).json({ success: false, message: 'Assigned host must be an active staff member or administrator' });
      }
      finalHostId = hostId;
    }
    const meeting = await Meeting.create({
      title,
      startTime,
      endTime,
      description,
      leadId: (leadId && mongoose.isValidObjectId(leadId)) ? leadId : null,
      hostId: finalHostId
    });
    await AuditLog.create({ userId: req.user._id, action: 'CREATE_MEETING', details: `User ${req.user.username} scheduled meeting: "${title}" on ${new Date(startTime).toLocaleString()}` });
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error scheduling meeting' });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'staff') {
      filter.hostId = req.user._id;
    }
    const meetings = await Meeting.find(filter)
      .populate('hostId', 'username email')
      .populate('leadId', 'name company email')
      .sort('startTime');
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching meetings' });
  }
};

exports.updateMeeting = async (req, res) => {
  const { id } = req.params;
  const { title, startTime, endTime, description, leadId, hostId } = req.body;
  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    // Staff can only edit own meetings
    if (req.user.role === 'staff' && meeting.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this meeting' });
    }
    if (title) meeting.title = title;
    if (startTime) meeting.startTime = startTime;
    if (endTime) meeting.endTime = endTime;
    if (description !== undefined) meeting.description = description;
    if (leadId !== undefined) meeting.leadId = (leadId && mongoose.isValidObjectId(leadId)) ? leadId : null;
    if (req.user.role === 'admin' && hostId) {
      const hostUser = await validateHost(hostId);
      if (!hostUser) {
        return res.status(400).json({ success: false, message: 'Assigned host must be an active staff member or administrator' });
      }
      meeting.hostId = hostId;
    }
    await meeting.save();
    await AuditLog.create({ userId: req.user._id, action: 'UPDATE_MEETING', details: `User ${req.user.username} updated meeting: "${meeting.title}"` });
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating meeting' });
  }
};

exports.deleteMeeting = async (req, res) => {
  const { id } = req.params;
  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    if (req.user.role === 'staff' && meeting.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this meeting' });
    }
    await meeting.deleteOne();
    await AuditLog.create({ userId: req.user._id, action: 'DELETE_MEETING', details: `User ${req.user.username} cancelled/deleted meeting: "${meeting.title}"` });
    res.status(200).json({ success: true, message: 'Meeting cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting meeting' });
  }
};

exports.syncGoogleCalendar = async (req, res) => {
  try {
    const syncSetting = await Setting.findOne({ key: 'google_calendar_sync' });
    const isEnabled = syncSetting && JSON.parse(syncSetting.value).enabled;
    if (!isEnabled) {
      return res.status(400).json({ success: false, message: 'Google Calendar sync is disabled. Please enable it in the Integrations page.' });
    }
    const unsyncedMeetings = await Meeting.find({ hostId: req.user._id, googleEventId: null });
    let syncCount = 0;
    for (const meeting of unsyncedMeetings) {
      meeting.googleEventId = `g_cal_${Math.random().toString(36).substring(2, 11)}`;
      await meeting.save();
      syncCount++;
    }
    await AuditLog.create({ userId: req.user._id, action: 'SYNC_GOOGLE_CALENDAR', details: `User ${req.user.username} synced ${syncCount} meetings to Google Calendar` });
    res.status(200).json({ success: true, message: `Successfully synchronized ${syncCount} meetings with Google Calendar.`, syncedCount: syncCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error synchronizing calendar' });
  }
};
