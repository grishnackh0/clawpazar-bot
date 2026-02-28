// ClawPazar – WebSocket Client
// Auto-reconnecting WebSocket for auction rooms and real-time updates

type WsMessage = {
    type: string;
    [key: string]: unknown;
};

type WsHandler = (message: WsMessage) => void;

export class ClawSocket {
    private ws: WebSocket | null = null;
    private url: string;
    private handlers: Map<string, Set<WsHandler>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private isDestroyed = false;

    constructor(baseUrl?: string) {
        const wsBase = baseUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
        this.url = `${wsBase}/ws`;
    }

    // ----------------------------------------------------------
    // CONNECTION
    // ----------------------------------------------------------

    connect(params?: Record<string, string>): void {
        if (this.isDestroyed) return;

        const qs = params
            ? '?' + new URLSearchParams(params).toString()
            : '';

        this.ws = new WebSocket(`${this.url}${qs}`);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.emit('connected', { type: 'connected' });
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data) as WsMessage;
                this.emit(msg.type, msg);
                this.emit('*', msg); // wildcard listener
            } catch {
                // ignore malformed messages
            }
        };

        this.ws.onclose = () => {
            this.stopHeartbeat();
            this.emit('disconnected', { type: 'disconnected' });
            this.attemptReconnect(params);
        };

        this.ws.onerror = () => {
            this.ws?.close();
        };
    }

    disconnect(): void {
        this.isDestroyed = true;
        this.stopHeartbeat();
        this.ws?.close();
        this.ws = null;
        this.handlers.clear();
    }

    // ----------------------------------------------------------
    // AUCTION ROOMS
    // ----------------------------------------------------------

    joinAuction(auctionId: string, userId?: string): void {
        this.disconnect();
        this.isDestroyed = false;
        this.connect({
            auctionId,
            ...(userId ? { userId } : {}),
        });
    }

    leaveAuction(): void {
        this.disconnect();
    }

    // ----------------------------------------------------------
    // MESSAGING
    // ----------------------------------------------------------

    send(message: WsMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    // ----------------------------------------------------------
    // EVENT HANDLING
    // ----------------------------------------------------------

    on(eventType: string, handler: WsHandler): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.handlers.get(eventType)?.delete(handler);
        };
    }

    private emit(eventType: string, message: WsMessage): void {
        this.handlers.get(eventType)?.forEach((handler) => handler(message));
    }

    // ----------------------------------------------------------
    // RECONNECTION
    // ----------------------------------------------------------

    private attemptReconnect(params?: Record<string, string>): void {
        if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            30000
        );

        setTimeout(() => {
            if (!this.isDestroyed) {
                this.connect(params);
            }
        }, delay);
    }

    // ----------------------------------------------------------
    // HEARTBEAT
    // ----------------------------------------------------------

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.send({ type: 'ping' });
        }, 25000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton for app-wide use
let socketInstance: ClawSocket | null = null;

export function getSocket(): ClawSocket {
    if (!socketInstance) {
        socketInstance = new ClawSocket();
    }
    return socketInstance;
}
