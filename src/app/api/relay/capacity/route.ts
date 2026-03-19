/**
 * Capacity Check API
 * 
 * GET /api/relay/capacity - Check if a new connection can be accepted
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  canAcceptConnection, 
  registerConnection,
  removeConnection,
  updateActivity,
  getConnectionStats,
} from '@/lib/pusher/connection-limiter';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing userId' },
      { status: 400 }
    );
  }

  const result = await canAcceptConnection();
  
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, socketId } = body;

    switch (action) {
      case 'register':
        if (!userId || !socketId) {
          return NextResponse.json(
            { error: 'Missing userId or socketId' },
            { status: 400 }
          );
        }
        
        const registered = registerConnection(userId, socketId);
        if (!registered) {
          return NextResponse.json(
            { success: false, message: 'At capacity' },
            { status: 429 }
          );
        }
        
        return NextResponse.json({ success: true });

      case 'disconnect':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing userId' },
            { status: 400 }
          );
        }
        
        removeConnection(userId);
        return NextResponse.json({ success: true });

      case 'heartbeat':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing userId' },
            { status: 400 }
          );
        }
        
        updateActivity(userId);
        return NextResponse.json({ success: true });

      case 'stats':
        const stats = getConnectionStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
