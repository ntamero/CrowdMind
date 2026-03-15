'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Plus, X, Sparkles, Send, Globe, Lock } from 'lucide-react';
import { categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const optionColors = ['text-indigo-500', 'text-amber-500', 'text-emerald-500', 'text-red-500', 'text-violet-500', 'text-cyan-500'];
const optionBgs = ['bg-indigo-500/10', 'bg-amber-500/10', 'bg-emerald-500/10', 'bg-red-500/10', 'bg-violet-500/10', 'bg-cyan-500/10'];

export default function AskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'premium'>('public');
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || options.filter((o) => o.trim()).length < 2) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/');
  };

  const isValid = title && category && options.filter((o) => o.trim()).length >= 2;

  return (
    <div className="mx-auto max-w-[700px] py-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-9 text-center"
      >
        <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <Brain size={28} className="text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
          Ask the World
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Share your decision and let collective intelligence guide you
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-border/30 bg-card/50 p-8"
      >
        {/* Title */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Your Question
          </label>
          <Input
            type="text"
            placeholder='e.g., "Should I invest in Tesla or Apple?"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Description (optional)
          </label>
          <Textarea
            placeholder="Add more context to help people understand your question..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-y"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? 'border-2 bg-primary/10 text-primary'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
                style={
                  category === cat.value
                    ? { borderColor: cat.color, color: cat.color, background: `${cat.color}20` }
                    : undefined
                }
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Options (min 2, max 6)
          </label>
          {options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="mb-2 flex gap-2"
            >
              <div
                className={`flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${optionBgs[i]} ${optionColors[i]}`}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <Input
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="h-11"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-red-500/20 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          ))}
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Plus size={16} /> Add Option
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Tags (max 5)
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                #{tag} <X size={12} />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="h-9"
            />
            <Button variant="outline" onClick={addTag} className="shrink-0">
              Add
            </Button>
          </div>
        </div>

        {/* Visibility */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Visibility
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setVisibility('public')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-3.5 text-sm font-semibold text-foreground transition-all ${
                visibility === 'public'
                  ? 'border-2 border-primary bg-primary/10'
                  : 'border border-border bg-card hover:border-primary/30'
              }`}
            >
              <Globe size={18} /> Public
            </button>
            <button
              onClick={() => setVisibility('premium')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-3.5 text-sm font-semibold text-foreground transition-all ${
                visibility === 'premium'
                  ? 'border-2 border-amber-500 bg-amber-500/10'
                  : 'border border-border bg-card hover:border-amber-500/30'
              }`}
            >
              <Lock size={18} /> Premium
            </button>
          </div>
        </div>

        {/* AI Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.08] p-4"
        >
          <Sparkles size={20} className="text-indigo-400" />
          <div>
            <div className="text-[13px] font-semibold text-indigo-400">
              AI Analysis Included
            </div>
            <div className="text-xs text-muted-foreground">
              Our AI will analyze votes and generate strategic insights
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className="flex h-12 w-full items-center justify-center gap-2 text-base"
        >
          {submitting ? (
            'Publishing...'
          ) : (
            <>
              <Send size={18} />
              Publish Question
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
