// adminController.js – migrated to Mongoose
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to find user by username or email (case-insensitive)
const findExistingUser = async (username, email) => {
  return await User.findOne({
    $or: [
      { username: username.toLowerCase().trim() },
      { email: email.toLowerCase().trim() }
    ]
  });
};

exports.createStaff = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const existingUser = await findExistingUser(username, email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    const newStaff = await User.create({ username, email, password, role: 'staff' });
    await AuditLog.create({ userId: req.user._id, action: 'CREATE_STAFF', details: `Admin ${req.user.username} created staff account for ${newStaff.username}` });
    res.status(201).json({
      success: true,
      user: {
        id: newStaff._id,
        username: newStaff.username,
        email: newStaff.email,
        role: newStaff.role,
        isActive: newStaff.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating staff account' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staffDocs = await User.find({ role: 'staff' })
      .select('username email isActive createdAt _id')
      .lean();
    const staff = staffDocs.map(s => ({ ...s, id: s._id }));
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

exports.toggleStaffStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff user not found' });
    staff.isActive = !staff.isActive;
    await staff.save();
    await AuditLog.create({ userId: req.user._id, action: 'TOGGLE_STAFF_STATUS', details: `Admin ${req.user.username} toggled status of ${staff.username} to ${staff.isActive ? 'Active' : 'Inactive'}` });
    res.status(200).json({ success: true, user: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};

exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  try {
    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff user not found' });
    
    if (username && username.toLowerCase().trim() !== staff.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      staff.username = username.toLowerCase().trim();
    }
    
    if (email && email.toLowerCase().trim() !== staff.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      staff.email = email.toLowerCase().trim();
    }

    if (password) staff.password = password; // pre-save hook hashes password
    await staff.save();
    await AuditLog.create({ userId: req.user._id, action: 'UPDATE_STAFF', details: `Admin ${req.user.username} updated details for staff ${staff.username}` });
    res.status(200).json({ success: true, user: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating staff' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logsDocs = await AuditLog.find()
      .populate('userId', 'username role')
      .sort({ createdAt: -1 })
      .lean();
    const logs = logsDocs.map(l => ({ ...l, id: l._id, user: l.userId }));
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};
