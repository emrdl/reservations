const DiscountService = require('../services/discountService');

class DiscountController {
    constructor() {
        this.discountService = new DiscountService();
    }

    // Yeni indirim kodu oluştur
    createDiscount = async (req, res) => {
        try {
            const discount = await this.discountService.createDiscount(req.body);
            res.status(201).json(discount);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // İndirim kodunu güncelle
    updateDiscount = async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await this.discountService.updateDiscount(id, req.body);
            res.json(discount);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // İndirim kodunu doğrula
    validateDiscount = async (req, res) => {
        try {
            const { code, orderAmount } = req.body;
            const result = await this.discountService.validateDiscount(code, orderAmount);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // İndirim kullanım istatistiklerini getir
    getDiscountStats = async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await this.discountService.getDiscountStats(id);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

module.exports = DiscountController; 