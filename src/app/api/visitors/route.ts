import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// In-memory visitor tracking for real-time online count
const visitors = new Map<string, number>();
const VISITOR_TTL = 5 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 1000;

let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, lastSeen] of visitors) {
    if (now - lastSeen > VISITOR_TTL) visitors.delete(key);
  }
}

// Parse user-agent for device/browser/os
function parseUA(ua: string) {
  let device = 'desktop';
  let browser = 'Other';
  let os = 'Other';

  // Device
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    const fingerprint = `${ip}_${ua.slice(0, 50)}`;

    visitors.set(fingerprint, Date.now());
    cleanup();

    // Parse body for page tracking
    let path = '/';
    let referrer = null;
    let sessionId = null;
    let duration = null;
    try {
      const body = await req.json();
      path = body.path || '/';
      referrer = body.referrer || null;
      sessionId = body.sessionId || null;
      duration = body.duration || null;
    } catch {}

    // Get current user if logged in
    let userId = null;
    try {
      const user = await getCurrentUser();
      if (user) userId = user.id;
    } catch {}

    const { device, browser, os } = parseUA(ua);

    // Save page view to DB (fire and forget, don't block response)
    prisma.pageView.create({
      data: {
        fingerprint,
        userId,
        path,
        referrer,
        userAgent: ua.slice(0, 500),
        device,
        browser,
        os,
        sessionId,
        duration,
      },
    }).catch(() => {}); // silently fail

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
