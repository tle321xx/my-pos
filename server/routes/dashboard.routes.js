const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const checkAuth = require('../middlewares/auth.middleware');

router.get('/stats', checkAuth, dashboardController.getStats);
router.get('/charts', checkAuth, dashboardController.getChartData);

module.exports = router;