const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const logger = require('../utils/logger');

// Prometheus metrics endpoint'i
router.get('/metrics', auth, adminAuth, async (req, res) => {
    try {
        const metrics = await metricsService.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);

        logger.info('Metrics requested', {
            userId: req.user.UserID
        });
    } catch (error) {
        logger.error('Error serving metrics', error);
        res.status(500).send('Error collecting metrics');
    }
});

module.exports = router; 