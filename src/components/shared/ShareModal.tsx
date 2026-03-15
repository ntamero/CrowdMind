'use client';

import { useState } from 'react';
import { X, Link2, Check, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

export default function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const platforms = [
    { name: 'Twitter / X', icon: '𝕏', color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'text-green-500', bg: 'bg-green-500/10', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'LinkedIn', icon: 'in', color: 'text-blue-600', bg: 'bg-blue-600/10', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Reddit', icon: 'R', color: 'text-orange-500', bg: 'bg-orange-500/10', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { name: 'Telegram', icon: '✈', color: 'text-sky-500', bg: 'bg-sky-500/10', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="w-[420px] max-w-[90vw] rounded-2xl border border-border bg-card p-7 shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Share this question</h3>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="size-8 rounded-lg"
              >
                <X size={16} />
              </Button>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              &quot;{title}&quot;
            </p>

            <div className="mb-5 grid grid-cols-5 gap-2.5">
              {platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-[11px] text-foreground no-underline transition-all hover:border-primary/30 hover:bg-muted"
                >
                  <div className={`flex size-10 items-center justify-center rounded-[10px] text-lg font-bold ${p.bg} ${p.color}`}>
                    {p.icon}
                  </div>
                  {p.name}
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 truncate rounded-[10px] border border-border bg-input/30 px-3.5 py-2.5 text-[13px] text-muted-foreground">
                {shareUrl}
              </div>
              <Button
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1.5"
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
