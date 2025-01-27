import { useState, useEffect } from 'react';
import pushNotificationHelper from '../utils/pushNotificationHelper';

export default function NotificationSettings() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    async function checkNotificationStatus() {
        setIsLoading(true);
        try {
            // Push API desteğini kontrol et
            const supported = 'Notification' in window && 'serviceWorker' in navigator;
            setIsSupported(supported);

            if (supported) {
                // Mevcut subscription'ı kontrol et
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            }
        } catch (error) {
            console.error('Bildirim durumu kontrol edilemedi:', error);
        }
        setIsLoading(false);
    }

    async function handleSubscriptionToggle() {
        if (isSubscribed) {
            const success = await pushNotificationHelper.unsubscribe();
            if (success) {
                setIsSubscribed(false);
            }
        } else {
            const hasPermission = await pushNotificationHelper.requestPermission();
            if (hasPermission) {
                const success = await pushNotificationHelper.subscribe();
                if (success) {
                    setIsSubscribed(true);
                }
            }
        }
    }

    async function handleTestNotification() {
        await pushNotificationHelper.sendTestNotification();
    }

    if (isLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
                Tarayıcınız push bildirimleri desteklemiyor.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Push Bildirimleri</h3>
                    <p className="text-gray-500">
                        {isSubscribed
                            ? 'Push bildirimleri aktif'
                            : 'Push bildirimleri devre dışı'}
                    </p>
                </div>
                <button
                    onClick={handleSubscriptionToggle}
                    className={`px-4 py-2 rounded ${
                        isSubscribed
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                >
                    {isSubscribed ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                </button>
            </div>

            {isSubscribed && (
                <button
                    onClick={handleTestNotification}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                    Test Bildirimi Gönder
                </button>
            )}
        </div>
    );
} 