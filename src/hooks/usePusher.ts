/**
 * Pusher React Hook - v2 with Connection Management
 * 
 * Features:
 * - Auto-disconnect on tab close
 * - Inactivity detection
 * - Capacity checking
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { usePrivy } from '@privy-io/react-auth';

// Event types
export interface ProvisionAgentEvent {
  agentId: string;
  name: string;
  soul: string;
  identity: string;
  traits: number[];
  parents?: {
    parentA?: { id: string; name: string };
    parentB?: { id: string; name: string };
  };
}

export interface DeprovisionAgentEvent {
  agentId: string;
  reason?: string;
}

export interface PusherState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  socketId: string | null;
  atCapacity: boolean;
}

// Config
const ACTIVITY_INTERVAL_MS = 5 * 60 * 1000; // Send heartbeat every 5 min

// Singleton Pusher instance
let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });
  }
  return pusherInstance;
}

export function usePusher() {
  const { user } = usePrivy();
  const [state, setState] = useState<PusherState>({
    connected: false,
    connecting: false,
    error: null,
    socketId: null,
    atCapacity: false,
  });
  
  const channelRef = useRef<Channel | null>(null);
  const activityInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const handlersRef = useRef<{
    onProvision?: (data: ProvisionAgentEvent) => void;
    onDeprovision?: (data: DeprovisionAgentEvent) => void;
    onPing?: () => void;
    onError?: (error: { code: string; message: string }) => void;
  }>({});

  const userId = user?.id;

  // Send heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetch('/api/relay/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', userId }),
      });
    } catch (error) {
      console.error('[Pusher] Heartbeat failed:', error);
    }
  }, [userId]);

  // Disconnect from server
  const disconnectFromServer = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetch('/api/relay/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', userId }),
      });
    } catch (error) {
      console.error('[Pusher] Disconnect failed:', error);
    }
  }, [userId]);

  // Register connection with server
  const registerWithServer = useCallback(async (socketId: string) => {
    if (!userId) return false;
    
    try {
      const res = await fetch('/api/relay/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', userId, socketId }),
      });
      
      if (res.status === 429) {
        setState(s => ({ ...s, atCapacity: true, error: 'Platform at capacity' }));
        return false;
      }
      
      return res.ok;
    } catch (error) {
      console.error('[Pusher] Register failed:', error);
      return false;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusher();
    
    // Update auth endpoint with userId
    pusher.config.auth = {
      ...pusher.config.auth,
      params: { userId },
    };

    setState(s => ({ ...s, connecting: true }));

    // Connection state handlers
    pusher.connection.bind('connected', async () => {
      console.log('[Pusher] Connected');
      const socketId = pusher.connection.socket_id;
      
      // Register with our server
      const registered = await registerWithServer(socketId);
      
      if (registered) {
        setState(s => ({
          ...s,
          connected: true,
          connecting: false,
          error: null,
          socketId,
          atCapacity: false,
        }));
        
        // Start activity heartbeat
        activityInterval.current = setInterval(sendHeartbeat, ACTIVITY_INTERVAL_MS);
      } else {
        // Disconnect from Pusher if we couldn't register
        pusher.disconnect();
      }
    });

    pusher.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected');
      setState(s => ({ ...s, connected: false }));
      
      // Stop activity heartbeat
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
        activityInterval.current = null;
      }
    });

    pusher.connection.bind('error', (error: any) => {
      console.error('[Pusher] Connection error:', error);
      setState(s => ({
        ...s,
        error: error?.message || 'Connection error',
        connecting: false,
      }));
    });

    // Subscribe to private channel
    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] Subscribed to', channelName);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Pusher] Subscription error:', error);
      setState(s => ({ ...s, error: 'Failed to subscribe' }));
    });

    // Event handlers
    channel.bind('provision-agent', (data: ProvisionAgentEvent) => {
      console.log('[Pusher] Received provision-agent:', data.name);
      handlersRef.current.onProvision?.(data);
    });

    channel.bind('deprovision-agent', (data: DeprovisionAgentEvent) => {
      console.log('[Pusher] Received deprovision-agent:', data.agentId);
      handlersRef.current.onDeprovision?.(data);
    });

    channel.bind('ping', () => {
      handlersRef.current.onPing?.();
    });

    channel.bind('error', (data: { code: string; message: string }) => {
      console.error('[Pusher] Error event:', data);
      handlersRef.current.onError?.(data);
    });

    // Handle tab close / page unload
    const handleBeforeUnload = () => {
      disconnectFromServer();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
      }
      
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      
      // Disconnect from server
      disconnectFromServer();
    };
  }, [userId, registerWithServer, sendHeartbeat, disconnectFromServer]);

  // Register event handlers
  const onProvision = useCallback((handler: (data: ProvisionAgentEvent) => void) => {
    handlersRef.current.onProvision = handler;
  }, []);

  const onDeprovision = useCallback((handler: (data: DeprovisionAgentEvent) => void) => {
    handlersRef.current.onDeprovision = handler;
  }, []);

  const onPing = useCallback((handler: () => void) => {
    handlersRef.current.onPing = handler;
  }, []);

  const onError = useCallback((handler: (error: { code: string; message: string }) => void) => {
    handlersRef.current.onError = handler;
  }, []);

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (channelRef.current && userId) {
      const pusher = getPusher();
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
      channelRef.current = null;
      disconnectFromServer();
    }
  }, [userId, disconnectFromServer]);

  return {
    ...state,
    onProvision,
    onDeprovision,
    onPing,
    onError,
    disconnect,
  };
}

export default usePusher;
