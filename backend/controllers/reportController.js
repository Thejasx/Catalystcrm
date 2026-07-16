// reportController.js – migrated to Mongoose
const Lead = require('../models/Lead');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const mongoose = require('mongoose');
const { Types } = mongoose;

exports.getDashboardStats = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const isAdmin = role === 'admin';

    // Lead filter based on role
    const leadFilter = isAdmin ? {} : { assignedToId: _id };

    // Core lead counters
    const totalLeads = await Lead.countDocuments(leadFilter);
    const wonLeads = await Lead.countDocuments({ ...leadFilter, status: 'Won' });
    const lostLeads = await Lead.countDocuments({ ...leadFilter, status: 'Lost' });
    const qualifiedLeads = await Lead.countDocuments({ ...leadFilter, status: 'Qualified' });
    const followUpLeads = await Lead.countDocuments({ ...leadFilter, status: 'Follow-up' });
    const newLeads = await Lead.countDocuments({ ...leadFilter, status: 'New' });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    // Upcoming meetings
    const meetingFilter = isAdmin
      ? { startTime: { $gte: new Date() } }
      : { hostId: _id, startTime: { $gte: new Date() } };
    const upcomingMeetings = await Meeting.countDocuments(meetingFilter);

    // Financial metrics (sum of dealRate on Won leads only)
    const totalProfitAgg = await Lead.aggregate([
      { $match: { ...leadFilter, status: 'Won' } },
      { $group: { _id: null, total: { $sum: '$dealRate' } } }
    ]);
    const totalProfitValue = totalProfitAgg[0] ? totalProfitAgg[0].total : 0;
    const monthlyProfitValue = totalProfitValue * 0.45;
    const targetIncomeValue = totalProfitValue;
    const monthlyIncomeValue = monthlyProfitValue;

    const baseProjectValue = 5200;
    const totalSalesValue = wonLeads * baseProjectValue;

    // Sales Overview donut chart data
    const salesOverview = {
      labels: ['New', 'Follow-up', 'Qualified', 'Won', 'Lost'],
      data: [newLeads, followUpLeads, qualifiedLeads, wonLeads, lostLeads]
    };

    // Revenue Updates bar chart (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth(); // 0‑based
    const startIdx = Math.max(0, currentMonthIdx - 5);
    const revenueCategories = months.slice(startIdx, currentMonthIdx + 1);

    const monthlyDataAgg = await Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    const revenueData = revenueCategories.map((_, i) => {
      const monthNumber = (startIdx + i + 1);
      const match = monthlyDataAgg.find(d => d._id === monthNumber);
      return match ? match.count * baseProjectValue : 0;
    });
    const revenueUpdates = { categories: revenueCategories, data: revenueData };

    // Yearly Sales spline chart (scaled by won leads)
    const scaleFactor = Math.max(1, wonLeads);
    const yearlySales = {
      years: ['2025', '2026'],
      categories: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      currentYear: [15, 25, 30, 45, 60, 80].map(v => v * scaleFactor * 50),
      lastYear: [10, 20, 25, 35, 45, 65].map(v => v * scaleFactor * 50)
    };

    // Staff performance table
    const staffFilter = isAdmin ? { role: 'staff', isActive: true } : { role: 'staff', _id };
    const staffMembers = await User.find(staffFilter).select('username');
    const staffPerformance = [];
    for (const staff of staffMembers) {
      const managed = await Lead.countDocuments({ assignedToId: staff._id });
      const converted = await Lead.countDocuments({ assignedToId: staff._id, status: 'Won' });
      staffPerformance.push({ name: staff.username, managed, converted, efficiency: managed > 0 ? Math.round((converted / managed) * 100) : 0 });
    }

    // Staff notifications (recent leads + upcoming meetings)
    let recentAssignedLeads = [];
    let upcomingStaffMeetings = [];
    if (!isAdmin) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      recentAssignedLeads = await Lead.find({ assignedToId: _id, createdAt: { $gte: since } })
        .select('name company createdAt')
        .sort({ createdAt: -1 });
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      upcomingStaffMeetings = await Meeting.find({ hostId: _id, startTime: { $gte: new Date(), $lte: nextWeek } })
        .select('title startTime leadId')
        .sort({ startTime: 1 });
    }

    // Helper for currency formatting
    const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // Deal outcome counters
    const wonDeals = await Lead.countDocuments({ ...leadFilter, dealOutcome: 'won' });
    const failedDeals = await Lead.countDocuments({ ...leadFilter, dealOutcome: 'failed' });
    const pendingDeals = await Lead.countDocuments({ ...leadFilter, dealOutcome: 'pending' });

    res.status(200).json({
      success: true,
      summary: {
        totalLeads,
        wonLeads,
        lostLeads,
        conversionRate,
        upcomingMeetings,
        totalSales: fmt(totalSalesValue),
        targetIncome: fmt(targetIncomeValue),
        monthlyIncome: fmt(monthlyIncomeValue),
        totalProfit: fmt(totalProfitValue),
        monthlyProfit: fmt(monthlyProfitValue),
        leadPaymentsDone: fmt(totalProfitValue)
      },
      charts: {
        salesOverview,
        revenueUpdates,
        yearlySales,
        staffPerformance,
        dealOutcome: { labels: ['Won', 'Failed', 'Pending'], data: [wonDeals, failedDeals, pendingDeals] }
      },
      notifications: isAdmin ? [] : {
        recentLeads: recentAssignedLeads.map(l => ({ id: l._id, name: l.name, company: l.company, assignedAt: l.createdAt })),
        upcomingMeetings: upcomingStaffMeetings.map(m => ({ id: m._id, title: m.title, startTime: m.startTime, leadId: m.leadId }))
      },
      adminStats: isAdmin ? { totalUsers: await User.countDocuments(), totalLeadsAssignedByAdmin: await Lead.countDocuments() } : {}
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error generating dashboard statistics' });
  }
};
