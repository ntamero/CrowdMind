'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Trophy, Users, Clock, TrendingUp,
  DollarSign, Target, Flame, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockPredictions } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function PredictionsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const cats = ['all', 'crypto', 'tech', 'sports', 'politics'];
  const filtered = filter === 'all' ? mockPredictions : mockPredictions.filter((p) => p.category === filter);

  return (
    <div className="max-w-[900px] mx-auto py-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Prediction <span className="gradient-text">Markets</span>
        </h1>
        <p className="text-muted-foreground text-[14px]">Forecast the future. Compete with the crowd. Win prizes.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { icon: Zap, label: 'Active Markets', value: '48', color: 'text-amber-400', bg: 'bg-amber-500/8' },
          { icon: Users, label: 'Participants', value: '48.2K', color: 'text-indigo-400', bg: 'bg-indigo-500/8' },
          { icon: DollarSign, label: 'Prize Pool', value: '$18K', color: 'text-emerald-400', bg: 'bg-emerald-500/8' },
          { icon: Trophy, label: 'Top Accuracy', value: '82.1%', color: 'text-red-400', bg: 'bg-red-500/8' },
        ].map((s) => (
          <div key={s.label} className="bg-card/50 border border-border/30 rounded-xl p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-5">
        {cats.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(cat)}
            className={cn(
              'capitalize text-[12px] h-8',
              filter === cat ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-muted-foreground'
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Markets */}
      <div className="space-y-3">
        {filtered.map((prediction, i) => {
          const isExpanded = selectedPrediction === prediction.id;
          return (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'bg-card border rounded-xl p-5 cursor-pointer transition-colors',
                isExpanded ? 'border-indigo-500/30' : 'border-border/40 hover:border-border'
              )}
              onClick={() => setSelectedPrediction(isExpanded ? null : prediction.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={cn(
                      'text-[10px] gap-1 border-0',
                      prediction.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    )}>
                      {prediction.status === 'open' ? <Flame size={10} /> : <Clock size={10} />}
                      {prediction.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] border-0 capitalize">
                      {prediction.category}
                    </Badge>
                  </div>
                  <h3 className="text-[17px] font-bold leading-snug mb-1">{prediction.title}</h3>
                  <p className="text-[13px] text-muted-foreground">{prediction.description}</p>
                </div>
                {prediction.prize && (
                  <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-4 py-2.5 text-center shrink-0 ml-4">
                    <div className="text-[10px] text-emerald-400 font-semibold mb-0.5">PRIZE</div>
                    <div className="text-lg font-black text-emerald-400">${prediction.prize.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex gap-5 mb-4 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users size={13} /> {formatNumber(prediction.totalParticipants)}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {new Date(prediction.targetDate).toLocaleDateString()}</span>
                {prediction.currentValue && (
                  <span className="flex items-center gap-1.5 text-amber-400"><TrendingUp size={13} /> ${prediction.currentValue.toLocaleString()}</span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {prediction.options.map((option) => {
                  const totalP = prediction.totalParticipants || 1;
                  const pct = Math.round((option.participants / totalP) * 100);
                  return (
                    <div key={option.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium">{option.text}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-muted-foreground">{formatNumber(option.participants)}</span>
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-400 border-0 px-1.5 py-0">
                              {option.odds}x
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 flex-1 bg-secondary/50" />
                          <span className="text-[13px] font-bold text-indigo-400 w-10 text-right">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2.5 mt-4 pt-4 border-t border-border/30">
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Target size={16} /> Make Prediction
                      </Button>
                      <Button variant="outline" className="gap-2 border-border/50" onClick={(e) => e.stopPropagation()}>
                        <Share2 size={14} /> Share
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
