import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { log } from './vite';

interface AdminWebSocket extends WebSocket {
  isAdmin?: boolean;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket connections
  wss.on('connection', (ws: AdminWebSocket) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'adminAuth' && data.isAdmin) {
          ws.isAdmin = true;
        }
      } catch (error) {
        log('WebSocket message parse error:', error);
      }
    });
  });

  // Broadcast to all admin clients
  const broadcastToAdmins = (event: string, data: any) => {
    wss.clients.forEach((client: AdminWebSocket) => {
      if (client.isAdmin && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  };

  // Handle upgrade
  server.on('upgrade', (request, socket, head) => {
    if (request.headers['sec-websocket-protocol'] === 'vite-hmr') {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  return { broadcastToAdmins };
}

export const invalidateAdminCache = (resource: string) => {
  // This will be called from routes to trigger cache invalidation
  if (global.wss) {
    global.wss.broadcastToAdmins('invalidateCache', { resource });
  }
};
