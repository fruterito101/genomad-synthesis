/**
 * Pusher Auth API
 * 
 * POST /api/pusher/auth - Authenticate users for private channels
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, authenticatePresence, getPresenceChannel } from '@/lib/pusher/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;
    
    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Get userId from Authorization header or query
    // In production, verify JWT token
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      // TODO: Verify Privy token and extract userId
      // For now, extract from channel name for private channels
      if (channel.startsWith('private-user-')) {
        userId = channel.replace('private-user-', '');
      }
    }

    // Also check query param (for initial connection)
    const { searchParams } = new URL(request.url);
    userId = userId || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let auth;
    
    if (channel.startsWith('presence-')) {
      // Presence channel auth
      auth = authenticatePresence(socketId, channel, userId, {
        name: userId.slice(0, 8),
      });
    } else if (channel.startsWith('private-')) {
      // Private channel auth
      auth = authenticateUser(socketId, channel, userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid channel type' },
        { status: 400 }
      );
    }

    return NextResponse.json(auth);

  } catch (error) {
    console.error('[Pusher Auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 403 }
    );
  }
}
