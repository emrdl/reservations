const WebSocket = require('ws');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // client -> user mapping

        this.wss.on('connection', (ws) => {
            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.on('close', () => this.handleClose(ws));
        });
    }

    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'auth') {
                this.clients.set(ws, { userId: data.userId, role: data.role });
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    }

    handleClose(ws) {
        this.clients.delete(ws);
    }

    // Belirli bir kullanıcıya mesaj gönder
    sendToUser(userId, message) {
        this.wss.clients.forEach((client) => {
            const userData = this.clients.get(client);
            if (userData && userData.userId === userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    // Belirli bir role sahip tüm kullanıcılara mesaj gönder
    sendToRole(role, message) {
        this.wss.clients.forEach((client) => {
            const userData = this.clients.get(client);
            if (userData && userData.role === role && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    // Tüm bağlı kullanıcılara mesaj gönder
    broadcast(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

module.exports = WebSocketService; 