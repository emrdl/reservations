class PushNotificationHelper {
    constructor() {
        this.publicKey = null;
        this.serviceWorkerRegistration = null;
    }

    // Service worker'ı kaydet
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker başarıyla kaydedildi');
                return true;
            } catch (error) {
                console.error('Service Worker kaydedilemedi:', error);
                return false;
            }
        }
        return false;
    }

    // Push notification izni iste
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Bildirim izni alınamadı:', error);
            return false;
        }
    }

    // VAPID public key'i al
    async getPublicKey() {
        try {
            const response = await fetch('/api/push/public-key', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            this.publicKey = data.publicKey;
            return this.publicKey;
        } catch (error) {
            console.error('Public key alınamadı:', error);
            return null;
        }
    }

    // Push subscription oluştur
    async subscribe() {
        try {
            if (!this.serviceWorkerRegistration) {
                await this.registerServiceWorker();
            }

            if (!this.publicKey) {
                await this.getPublicKey();
            }

            const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
            });

            // Subscription'ı sunucuya kaydet
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ subscription })
            });

            return true;
        } catch (error) {
            console.error('Push subscription oluşturulamadı:', error);
            return false;
        }
    }

    // Push subscription'ı iptal et
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Önce sunucudan sil
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });

                // Sonra tarayıcıdan sil
                await subscription.unsubscribe();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Push subscription iptal edilemedi:', error);
            return false;
        }
    }

    // Test bildirimi gönder
    async sendTestNotification() {
        try {
            await fetch('/api/push/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return true;
        } catch (error) {
            console.error('Test bildirimi gönderilemedi:', error);
            return false;
        }
    }

    // Base64 string'i Uint8Array'e dönüştür
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

export default new PushNotificationHelper(); 