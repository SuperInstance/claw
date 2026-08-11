/**
 * Spreadsheet Moment - Durable Objects for Real-time Collaboration
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 *
 * Collaboration Durable Object
 * Manages real-time collaboration on spreadsheets with presence awareness
 */
import { DurableObject, } from 'cloudflare:workers';
/**
 * Collaboration Durable Object
 * Manages real-time collaboration for a single spreadsheet
 */
export class CollaborationObject extends DurableObject {
    constructor(state, env) {
        super(state, env);
        this.sessions = new Set();
        this.presence = new Map();
        this.cellUpdates = [];
        this.maxCellUpdates = 1000;
        this.env = env;
        // Set up alarm for cleanup
        this.ctx.setAlarm(Date.now() + 60000).catch(() => {
            // Ignore alarm errors
        });
    }
    /**
     * Handle WebSocket connections
     */
    async fetch(request) {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        if (!userId) {
            return new Response('Missing userId', { status: 400 });
        }
        // Upgrade to WebSocket
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        // Accept the WebSocket
        server.accept();
        // Add to sessions
        this.sessions.add(server);
        // Handle incoming messages
        server.addEventListener('message', async (event) => {
            try {
                const message = JSON.parse(event.data);
                await this.handleMessage(server, userId, message);
            }
            catch (error) {
                console.error('Error handling message:', error);
            }
        });
        // Handle disconnection
        server.addEventListener('close', async () => {
            await this.handleDisconnect(server, userId);
        });
        // Handle errors
        server.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }
    /**
     * Handle incoming messages from clients
     */
    async handleMessage(socket, userId, message) {
        switch (message.type) {
            case 'cell_update':
                await this.handleCellUpdate(userId, message.data);
                break;
            case 'presence':
                await this.handlePresence(userId, message.data);
                break;
            case 'cursor':
                await this.handleCursor(userId, message.data);
                break;
            case 'selection':
                await this.handleSelection(userId, message.data);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    /**
     * Handle cell update
     */
    async handleCellUpdate(userId, data) {
        // Store update
        this.cellUpdates.push(data);
        if (this.cellUpdates.length > this.maxCellUpdates) {
            this.cellUpdates.shift();
        }
        // Persist to storage
        await this.storage.put({
            type: 'cell_update',
            data,
            timestamp: Date.now(),
        });
        // Broadcast to all other clients
        this.broadcast({
            type: 'cell_update',
            data,
            userId,
            timestamp: Date.now(),
        }, userId);
    }
    /**
     * Handle user presence
     */
    async handlePresence(userId, data) {
        const presence = {
            userId,
            name: data.name || '',
            avatar: data.avatar || '',
            color: this.getUserColor(userId),
            lastSeen: Date.now(),
            ...data,
        };
        this.presence.set(userId, presence);
        // Broadcast to all other clients
        this.broadcast({
            type: 'presence',
            data: presence,
            userId,
            timestamp: Date.now(),
        }, userId);
        // Send current presence to new user
        this.sendToUser(userId, {
            type: 'user_joined',
            data: Array.from(this.presence.values()),
            timestamp: Date.now(),
        });
    }
    /**
     * Handle cursor movement
     */
    async handleCursor(userId, data) {
        const presence = this.presence.get(userId);
        if (presence) {
            presence.cursor = data;
            presence.lastSeen = Date.now();
            this.broadcast({
                type: 'cursor',
                data: { userId, ...data },
                userId,
                timestamp: Date.now(),
            }, userId);
        }
    }
    /**
     * Handle selection change
     */
    async handleSelection(userId, data) {
        const presence = this.presence.get(userId);
        if (presence) {
            presence.selection = data;
            presence.lastSeen = Date.now();
            this.broadcast({
                type: 'selection',
                data: { userId, ...data },
                userId,
                timestamp: Date.now(),
            }, userId);
        }
    }
    /**
     * Handle disconnection
     */
    async handleDisconnect(socket, userId) {
        // Remove session
        this.sessions.delete(socket);
        // Remove presence
        this.presence.delete(userId);
        // Broadcast to remaining users
        this.broadcast({
            type: 'user_left',
            data: { userId },
            timestamp: Date.now(),
        });
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message, excludeUserId) {
        const serialized = JSON.stringify(message);
        for (const socket of this.sessions) {
            try {
                socket.send(serialized);
            }
            catch (error) {
                console.error('Error broadcasting:', error);
                this.sessions.delete(socket);
            }
        }
    }
    /**
     * Send message to specific user
     */
    sendToUser(userId, message) {
        const serialized = JSON.stringify(message);
        const presence = this.presence.get(userId);
        if (presence) {
            // Find the socket for this user
            for (const socket of this.sessions) {
                try {
                    socket.send(serialized);
                    break;
                }
                catch (error) {
                    this.sessions.delete(socket);
                }
            }
        }
    }
    /**
     * Get consistent color for user
     */
    getUserColor(userId) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        const hash = userId.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }
    /**
     * Handle alarm for cleanup
     */
    async alarm() {
        const now = Date.now();
        const timeout = 300000; // 5 minutes
        // Clean up inactive presence
        for (const [userId, presence] of this.presence.entries()) {
            if (now - presence.lastSeen > timeout) {
                this.presence.delete(userId);
                this.broadcast({
                    type: 'user_left',
                    data: { userId },
                    timestamp: now,
                });
            }
        }
        // Set next alarm
        this.ctx.setAlarm(Date.now() + 60000).catch(() => {
            // Ignore alarm errors
        });
    }
}
/**
 * Export the Durable Object class
 */
export default {
    CollaborationObject,
};
//# sourceMappingURL=collaboration.js.map