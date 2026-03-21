import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: number;
  marketId: string;
}

// In-memory chat store per market
const chatRooms = new Map<string, ChatMessage[]>();
const MAX_MESSAGES = 100;

function getRoom(marketId: string): ChatMessage[] {
  if (!chatRooms.has(marketId)) {
    chatRooms.set(marketId, []);
  }
  return chatRooms.get(marketId)!;
}

// Cleanup old rooms (> 1 hour)
function cleanupRooms() {
  const now = Date.now();
  for (const [key, messages] of chatRooms) {
    if (messages.length === 0 || now - messages[messages.length - 1].timestamp > 3600000) {
      chatRooms.delete(key);
    }
  }
}

// GET: Fetch messages for a market
export async function GET(req: NextRequest) {
  const marketId = req.nextUrl.searchParams.get('marketId');
  const after = parseInt(req.nextUrl.searchParams.get('after') || '0');

  if (!marketId) {
    return NextResponse.json({ error: 'marketId required' }, { status: 400 });
  }

  const room = getRoom(marketId);
  const messages = after > 0
    ? room.filter(m => m.timestamp > after)
    : room.slice(-50); // Last 50 messages

  return NextResponse.json({ messages });
}

// POST: Send a message
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Sign in to chat' }, { status: 401 });
    }

    const { marketId, message } = await req.json();

    if (!marketId || !message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    if (message.length > 200) {
      return NextResponse.json({ error: 'Message too long (max 200 chars)' }, { status: 400 });
    }

    const room = getRoom(marketId);

    const chatMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: currentUser.id,
      username: currentUser.username || currentUser.email?.split('@')[0] || 'Anon',
      message: message.trim(),
      timestamp: Date.now(),
      marketId,
    };

    room.push(chatMsg);

    // Trim to max messages
    if (room.length > MAX_MESSAGES) {
      room.splice(0, room.length - MAX_MESSAGES);
    }

    // Periodic cleanup
    if (Math.random() < 0.05) cleanupRooms();

    return NextResponse.json({ success: true, message: chatMsg });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
