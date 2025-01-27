self.addEventListener('push', function(event) {
    if (!event.data) {
        console.log('Push olayı alındı ama veri yok');
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            vibrate: [100, 50, 100],
            data: {
                type: data.type,
                timestamp: data.timestamp,
                url: self.registration.scope
            },
            actions: [
                {
                    action: 'open',
                    title: 'Aç'
                },
                {
                    action: 'close',
                    title: 'Kapat'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Push notification işlenirken hata:', error);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Bildirime tıklandığında uygulamayı aç
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(function(clientList) {
                // Uygulama zaten açıksa onu öne getir
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Uygulama kapalıysa yeni pencerede aç
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
}); 