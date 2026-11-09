// Client-Side Server-Sent Events (SSE) Real-Time Synchronization Service
// Sri Manikanta Sai General Store

const DEFAULT_PROD_API = 'https://grocery-k0jb.onrender.com';

function getSseUrl() {
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl) {
    return `${customUrl.replace(/\/+$/, '')}/api/realtime/events`;
  }
  // If running in production browser on non-localhost domain, connect directly to Render backend
  if (typeof window !== 'undefined' && 
      window.location.hostname && 
      !window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1')) {
    return `${DEFAULT_PROD_API}/api/realtime/events`;
  }
  return '/api/realtime/events';
}

class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map(); // eventName -> Set of callbacks
    this.retryCount = 0;
    this.maxRetryDelay = 10000;
    this.reconnectTimer = null;
    this.isConnected = false;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.connect());
    }
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.eventSource && (this.eventSource.readyState === EventSource.OPEN || this.eventSource.readyState === EventSource.CONNECTING)) {
      return;
    }

    try {
      const sseUrl = getSseUrl();
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.retryCount = 0;
        this.notifySubscribers('connection:change', { connected: true });
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifySubscribers('connection:change', { connected: false });
        this.scheduleReconnect();
      };

      // Register supported event listeners
      const events = [
        'product:created',
        'product:updated',
        'product:deleted',
        'products:bulk',
        'inventory:adjusted',
        'category:created',
        'category:updated',
        'category:deleted',
        'coupon:created',
        'coupon:deleted',
        'settings:updated'
      ];

      events.forEach(eventName => {
        this.eventSource.addEventListener(eventName, (e) => {
          try {
            const data = JSON.parse(e.data);
            this.notifySubscribers(eventName, data);
            // Also emit custom DOM event for lightweight non-React listeners
            window.dispatchEvent(new CustomEvent(`sms:realtime:${eventName}`, { detail: data }));
          } catch (err) {
            console.error(`Error parsing real-time event "${eventName}":`, err);
          }
        });
      });

    } catch (err) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (_) {}
      this.eventSource = null;
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), this.maxRetryDelay);
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    // Auto-connect if not already connected
    if (!this.eventSource && typeof window !== 'undefined') {
      this.connect();
    }

    // Return cleanup unsubscribe function
    return () => {
      const set = this.listeners.get(eventName);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  notifySubscribers(eventName, data) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in real-time subscriber for "${eventName}":`, err);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (_) {}
      this.eventSource = null;
    }
    this.isConnected = false;
  }
}

export const realtimeService = new RealtimeService();
