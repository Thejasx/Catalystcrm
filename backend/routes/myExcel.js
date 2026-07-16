const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const myExcelController = require('../controllers/myExcelController');

// Multer config for handling file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protect all routes
// router.use(protect); // disabled for open Excel analysis

// Detect headers endpoint
router.post('/detect', upload.single('file'), myExcelController.detectHeaders);

// Process data endpoint
router.post('/process', upload.single('file'), myExcelController.processData);

router.post('/analyze', upload.single('file'), myExcelController.analyzeData);

module.exports = router;
