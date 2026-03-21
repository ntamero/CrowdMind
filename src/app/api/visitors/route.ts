import { NextRequest, NextResponse } from 'next/server';

// In-memory visitor tracking (resets on server restart)
const visitors = new Map<string, number>(); // fingerprint → last seen timestamp
const VISITOR_TTL = 5 * 60 * 1000; // 5 minutes = "online"
const CLEANUP_INTERVAL = 60 * 1000; // cleanup every minute

// Periodic cleanup of stale visitors
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, lastSeen] of visitors) {
    if (now - lastSeen > VISITOR_TTL) visitors.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    // Simple fingerprint from IP + UA prefix
    const fingerprint = `${ip}_${ua.slice(0, 50)}`;

    visitors.set(fingerprint, Date.now());
    cleanup();

    return NextResponse.json({
      online: visitors.size,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ online: 1, timestamp: Date.now() });
  }
}

export async function GET() {
  cleanup();
  return NextResponse.json({
    online: Math.max(1, visitors.size),
    timestamp: Date.now(),
  });
}
