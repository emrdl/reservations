const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {
    constructor() {
        this.analyticsService = new AnalyticsService();
    }

    // Saatlik satış analizi
    getHourlySales = async (req, res) => {
        try {
            const { date } = req.query;
            const data = await this.analyticsService.getHourlySales(new Date(date));
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Kategori bazlı satış analizi
    getCategorySales = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.analyticsService.getCategorySales(
                new Date(startDate),
                new Date(endDate)
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Masa performans analizi
    getTablePerformance = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.analyticsService.getTablePerformance(
                new Date(startDate),
                new Date(endDate)
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Personel performans analizi
    getStaffPerformance = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.analyticsService.getStaffPerformance(
                new Date(startDate),
                new Date(endDate)
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Trend analizi
    getTrends = async (req, res) => {
        try {
            const { days = 30 } = req.query;
            const data = await this.analyticsService.getTrends(parseInt(days));
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = AnalyticsController; 