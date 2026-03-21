'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Eye } from 'lucide-react';

// Generate a session ID that persists for the browser tab
function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('ws_sid');
  if (!sid) {
    sid = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('ws_sid', sid);
  }
  return sid;
}

export default function VisitorTracker() {
  const [online, setOnline] = useState(0);
  const pathname = usePathname();
  const lastPingPath = useRef('');
  const pageStart = useRef(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();

    const ping = (path: string, duration?: number) => {
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          referrer: document.referrer || null,
          sessionId,
          duration: duration || null,
        }),
      })
        .then(r => r.json())
        .then(d => setOnline(d.online))
        .catch(() => {});
    };

    // Send duration for previous page
    if (lastPingPath.current && lastPingPath.current !== pathname) {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      if (duration > 0 && duration < 3600) {
        ping(lastPingPath.current, duration);
      }
    }

    // Track new page
    pageStart.current = Date.now();
    lastPingPath.current = pathname;
    ping(pathname);

    // Keep-alive ping every 30s
    const interval = setInterval(() => ping(pathname), 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (online === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-border/30 backdrop-blur-sm shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Eye size={12} className="text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{online}</span>
        <span className="text-[10px] text-muted-foreground">live</span>
      </div>
    </div>
  );
}
