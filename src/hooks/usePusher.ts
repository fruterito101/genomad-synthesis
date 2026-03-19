/**
 * Pusher React Hook
 * 
 * Connects to Pusher and handles real-time events.
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
}

// Singleton Pusher instance
let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {},
      },
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
  });
  
  const channelRef = useRef<Channel | null>(null);
  const handlersRef = useRef<{
    onProvision?: (data: ProvisionAgentEvent) => void;
    onDeprovision?: (data: DeprovisionAgentEvent) => void;
    onPing?: () => void;
    onError?: (error: { code: string; message: string }) => void;
  }>({});

  const userId = user?.id;

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
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected');
      setState(s => ({
        ...s,
        connected: true,
        connecting: false,
        error: null,
        socketId: pusher.connection.socket_id,
      }));
    });

    pusher.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected');
      setState(s => ({ ...s, connected: false }));
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

    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [userId]);

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

  // Disconnect
  const disconnect = useCallback(() => {
    if (channelRef.current && userId) {
      const pusher = getPusher();
      pusher.unsubscribe(`private-user-${userId}`);
      channelRef.current = null;
    }
  }, [userId]);

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
