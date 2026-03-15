'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Plus, X, Sparkles, Send, Image, Globe, Lock } from 'lucide-react';
import { categories } from '@/lib/mock-data';

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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Brain size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Ask the World
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Share your decision and let collective intelligence guide you
        </p>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            Your Question
          </label>
          <input
            type="text"
            placeholder='e.g., "Should I invest in Tesla or Apple?"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: 16, padding: '14px 16px' }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            Description (optional)
          </label>
          <textarea
            placeholder="Add more context to help people understand your question..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>
            Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: category === cat.value ? `2px solid ${cat.color}` : '1px solid var(--border)',
                  background: category === cat.value ? `${cat.color}20` : 'var(--bg-card)',
                  color: category === cat.value ? cat.color : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>
            Options (min 2, max 6)
          </label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 44,
                  borderRadius: 8,
                  background: `${['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'][i]}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'][i],
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <input
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    color: '#ef4444',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              onClick={addOption}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--primary-light)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              <Plus size={16} /> Add Option
            </button>
          )}
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            Tags (max 5)
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="tag"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              >
                #{tag} <X size={12} />
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <button className="btn-secondary" onClick={addTag} style={{ flexShrink: 0 }}>
              Add
            </button>
          </div>
        </div>

        {/* Visibility */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>
            Visibility
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setVisibility('public')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: visibility === 'public' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: visibility === 'public' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Globe size={18} /> Public
            </button>
            <button
              onClick={() => setVisibility('premium')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: visibility === 'premium' ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: visibility === 'premium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Lock size={18} /> Premium
            </button>
          </div>
        </div>

        {/* AI Preview */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Sparkles size={20} color="var(--primary-light)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>
              AI Analysis Included
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Our AI will analyze votes and generate strategic insights
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn-glow"
          onClick={handleSubmit}
          disabled={submitting || !title || !category || options.filter((o) => o.trim()).length < 2}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: (!title || !category || options.filter((o) => o.trim()).length < 2) ? 0.5 : 1,
          }}
        >
          {submitting ? (
            'Publishing...'
          ) : (
            <>
              <Send size={18} />
              Publish Question
            </>
          )}
        </button>
      </div>
    </div>
  );
}
