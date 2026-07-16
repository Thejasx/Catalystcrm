const express = require('express');
const router = express.Router();

// Import individual route modules
router.use('/auth', require('./auth'));
router.use('/leads', require('./leads'));
router.use('/meetings', require('./meetings'));
router.use('/reports', require('./reports'));
router.use('/integrations', require('./integrations'));
router.use('/admin', require('./admin'));
router.use('/myExcel', require('./myExcel'));
router.use('/ping', require('./ping'));

module.exports = router;
