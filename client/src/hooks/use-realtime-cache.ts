import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from './use-user';

export function useRealtimeCache() {
  const queryClient = useQueryClient();
  const { isAdmin } = useUser();

  useEffect(() => {
    if (!isAdmin) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    // Send admin authentication
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'adminAuth', isAdmin: true }));
    };

    // Handle incoming messages
    ws.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        
        if (eventType === 'invalidateCache') {
          // Invalidate the appropriate queries based on the resource
          switch (data.resource) {
            case 'testimonials':
              queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
              queryClient.invalidateQueries({ queryKey: ['/api/testimonials/approved'] });
              break;
            case 'users':
              queryClient.invalidateQueries({ queryKey: ['/api/users'] });
              break;
            case 'settings':
              queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
              break;
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Clean up
    return () => {
      ws.close();
    };
  }, [queryClient, isAdmin]);
}
