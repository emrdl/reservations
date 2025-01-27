const ReportService = require('../services/reportService');

class ReportController {
    constructor() {
        this.reportService = new ReportService();
    }

    // Satış raporu
    getSalesReport = async (req, res) => {
        try {
            const { startDate, endDate, format } = req.query;
            const data = await this.reportService.generateSalesReport(
                new Date(startDate),
                new Date(endDate)
            );

            if (format === 'excel') {
                const workbook = await this.reportService.generateExcelReport(data, 'sales');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
                await workbook.xlsx.write(res);
            } else {
                res.json(data);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Stok raporu
    getInventoryReport = async (req, res) => {
        try {
            const { format } = req.query;
            const data = await this.reportService.generateInventoryReport();

            if (format === 'excel') {
                const workbook = await this.reportService.generateExcelReport(data, 'inventory');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');
                await workbook.xlsx.write(res);
            } else {
                res.json(data);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Özet rapor
    getSummaryReport = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.reportService.generateSummaryReport(
                new Date(startDate),
                new Date(endDate)
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = ReportController; 