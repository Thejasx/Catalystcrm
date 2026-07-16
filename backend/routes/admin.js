const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All admin routes are protected and restricted to administrators
router.use(protect);
router.use(restrictTo('admin'));

router.post('/staff', adminController.createStaff);
router.get('/staff', adminController.getStaff);
router.put('/staff/:id', adminController.updateStaff);
router.patch('/staff/:id/status', adminController.toggleStaffStatus);
router.get('/logs', adminController.getAuditLogs);

module.exports = router;
