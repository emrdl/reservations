const PushNotificationService = require('../services/pushNotificationService');

class PushNotificationController {
    constructor() {
        this.pushService = new PushNotificationService();
    }

    // Push subscription'ı kaydet
    subscribe = async (req, res) => {
        try {
            const { subscription } = req.body;
            const userId = req.user.UserID;

            await this.pushService.saveSubscription(userId, subscription);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Push subscription'ı sil
    unsubscribe = async (req, res) => {
        try {
            const { endpoint } = req.body;
            await this.pushService.deleteSubscription(endpoint);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // VAPID public key'i getir
    getPublicKey = async (req, res) => {
        res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
    };

    // Test bildirimi gönder
    sendTestNotification = async (req, res) => {
        try {
            const userId = req.user.UserID;
            const subscriptions = await this.pushService.getUserSubscriptions(userId);

            if (subscriptions.length === 0) {
                return res.status(404).json({ error: 'Push subscription bulunamadı' });
            }

            const payload = {
                title: 'Test Bildirimi',
                body: 'Bu bir test bildirimidir.',
                type: 'TEST',
                timestamp: new Date().toISOString()
            };

            for (const subscription of subscriptions) {
                await this.pushService.sendNotification(subscription, payload);
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Tüm kullanıcılara bildirim gönder (sadece admin)
    broadcastNotification = async (req, res) => {
        try {
            const { title, message, type = 'BROADCAST' } = req.body;

            const payload = {
                title,
                body: message,
                type,
                timestamp: new Date().toISOString()
            };

            await this.pushService.broadcastNotification(payload);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = PushNotificationController; 