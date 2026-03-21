'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export default function VisitorTracker() {
  const [online, setOnline] = useState(0);

  useEffect(() => {
    // Ping on mount
    const ping = () => {
      fetch('/api/visitors', { method: 'POST' })
        .then(r => r.json())
        .then(d => setOnline(d.online))
        .catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

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
