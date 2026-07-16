const Lead = require('../models/Lead');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

// Helper for role-based access
const isAdmin = (user) => user.role === 'admin';

exports.createLead = async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    status,
    notes,
    assignedToId,
    dealRate,
    expectedCloseDate,
    dealOutcome,
    hotLead,
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Lead name is required' });
  }

  try {
    const parsedAssignedToId = assignedToId && mongoose.isValidObjectId(assignedToId)
      ? assignedToId
      : req.user.id;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: status || 'New',
      notes,
      assignedToId: parsedAssignedToId,
      dealRate: dealRate !== undefined && dealRate !== '' ? parseFloat(dealRate) : 0,
      expectedCloseDate: expectedCloseDate || null,
      dealOutcome: dealOutcome || 'pending',
      hotLead: Boolean(hotLead),
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE_LEAD',
      details: `User ${req.user.username} created lead: ${lead.name} (${lead.company || 'No Company'})`
    });

    res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating lead' });
  }
};

exports.getLeads = async (req, res) => {
  const { search, status, assignedToMe } = req.query;

  try {
    const filter = {};

    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
      ];
    }

    if (!isAdmin(req.user)) {
      filter.assignedToId = req.user.id;
    } else if (assignedToMe === 'true') {
      filter.assignedToId = req.user.id;
    }

    const leadDocs = await Lead.find(filter)
      .populate('assignedToId', 'username email')
      .sort({ createdAt: -1 })
      .lean();
    const leads = leadDocs.map(l => ({ ...l, id: l._id }));
    res.status(200).json({ success: true, leads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching leads' });
  }
};

exports.updateLead = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    company,
    status,
    notes,
    assignedToId,
    dealRate,
    expectedCloseDate,
    dealOutcome,
    hotLead,
  } = req.body;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Permission check for staff
    if (!isAdmin(req.user) && String(lead.assignedToId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot edit lead not assigned to you' });
    }

    const previousStatus = lead.status;

    // Apply updates
    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (status !== undefined) lead.status = status;
    if (notes !== undefined) lead.notes = notes;
    if (dealRate !== undefined) lead.dealRate = dealRate;
    if (expectedCloseDate !== undefined) lead.expectedCloseDate = expectedCloseDate;
    if (dealOutcome !== undefined) lead.dealOutcome = dealOutcome;
    if (hotLead !== undefined) lead.hotLead = Boolean(hotLead);
    if (assignedToId !== undefined) {
      lead.assignedToId = (assignedToId && mongoose.isValidObjectId(assignedToId)) ? assignedToId : null;
    }

    await lead.save();

    let details = `User ${req.user.username} updated lead ${lead.name}.`;
    if (previousStatus !== lead.status) {
      details += ` Status changed from "${previousStatus}" to "${lead.status}".`;
    }

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE_LEAD',
      details,
    });

    res.status(200).json({ success: true, lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating lead' });
  }
};

exports.deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Permission check for staff
    if (!isAdmin(req.user) && String(lead.assignedToId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot delete lead not assigned to you' });
    }

    await lead.deleteOne();

    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE_LEAD',
      details: `User ${req.user.username} deleted lead: ${lead.name}`
    });

    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting lead' });
  }
};

exports.exportLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedToId', 'username');
    const data = leads.map(lead => ({
      ID: lead._id,
      Name: lead.name,
      Email: lead.email || '',
      Phone: lead.phone || '',
      Company: lead.company || '',
      Status: lead.status,
      Notes: lead.notes || '',
      AssignedTo: lead.assignedToId ? lead.assignedToId.username : 'Unassigned',
      CreatedAt: lead.createdAt,
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error exporting leads' });
  }
};

exports.importLeads = async (req, res) => {
  const { fileBase64 } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ success: false, message: 'No file data provided' });
  }

  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(400).json({ success: false, message: 'Excel file appears to be empty or has no sheets.' });
    }

    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const nonEmptyRows = rawRows.filter(row => row.some(cell => String(cell).trim() !== ''));
    if (nonEmptyRows.length < 2) {
      return res.status(400).json({ success: false, message: 'Excel file must have at least one header row and one data row.' });
    }

    let headerRowIndex = -1;
    let headerRow = [];
    for (let i = 0; i < nonEmptyRows.length; i++) {
      const lowered = nonEmptyRows[i].map(c => String(c).trim().toLowerCase());
      if (lowered.includes('name')) {
        headerRowIndex = i;
        headerRow = lowered;
        break;
      }
    }
    if (headerRowIndex === -1) {
      return res.status(400).json({ success: false, message: 'Could not detect headers. Ensure a \"Name\" column exists.' });
    }

    const col = label => headerRow.indexOf(label.toLowerCase());
    const nameIdx = col('name');
    const emailIdx = col('email');
    const phoneIdx = col('phone');
    const companyIdx = col('company');
    const statusIdx = col('status');
    const notesIdx = col('notes');
    const validStatuses = ['New', 'Follow-up', 'Qualified', 'Won', 'Lost'];

    const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
    let importCount = 0;
    let skippedCount = 0;

    for (const row of dataRows) {
      const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
      if (!name) { skippedCount++; continue; }
      const email = emailIdx >= 0 ? String(row[emailIdx] || '').trim() : '';
      const phone = phoneIdx >= 0 ? String(row[phoneIdx] || '').trim() : '';
      const company = companyIdx >= 0 ? String(row[companyIdx] || '').trim() : '';
      const notes = notesIdx >= 0 ? String(row[notesIdx] || '').trim() : '';
      const rawStatus = statusIdx >= 0 ? String(row[statusIdx] || '').trim() : '';
      const finalStatus = validStatuses.find(s => s.toLowerCase() === rawStatus.toLowerCase()) || 'New';

      await Lead.create({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        status: finalStatus,
        notes: notes || null,
        assignedToId: req.user.id,
      });
      importCount++;
    }

    await AuditLog.create({
      userId: req.user.id,
      action: 'IMPORT_LEADS',
      details: `User ${req.user.username} imported ${importCount} leads from Excel file (${skippedCount} rows skipped)`
    });

    const msg = skippedCount > 0
      ? `Successfully imported ${importCount} leads (${skippedCount} rows skipped – missing Name)`
      : `Successfully imported ${importCount} leads`;
    res.status(200).json({ success: true, message: msg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error importing leads.' });
  }
};
