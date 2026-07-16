const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', integrationController.getIntegrations);
router.post('/', integrationController.saveIntegrationSettings);

module.exports = router;
