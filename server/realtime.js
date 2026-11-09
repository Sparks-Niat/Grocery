// Server-Sent Events (SSE) Real-Time Synchronization Manager
// Sri Manikanta Sai General Store

class RealtimeManager {
  constructor() {
    this.clients = new Set();
    this.pingInterval = null;
    this.startPing();
  }

  // Handle incoming client SSE subscription
  handleConnection(req, res) {
    // SSE Headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('retry: 5000\n');
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    this.clients.add(res);

    req.on('close', () => {
      this.clients.delete(res);
    });

    req.on('error', () => {
      this.clients.delete(res);
    });
  }

  // Broadcast event to all connected customer and admin storefronts
  broadcast(eventType, payload) {
    if (this.clients.size === 0) return;

    const data = JSON.stringify(payload);
    const message = `event: ${eventType}\ndata: ${data}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  // Keep-alive ping every 25 seconds to prevent proxy / Render connection timeouts
  startPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      for (const client of this.clients) {
        try {
          client.write(': ping\n\n');
        } catch (err) {
          this.clients.delete(client);
        }
      }
    }, 25000);

    // Prevent this interval from keeping process alive if server shuts down
    if (this.pingInterval.unref) {
      this.pingInterval.unref();
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

export const realtime = new RealtimeManager();
