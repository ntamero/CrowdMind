// ============================================
// CrowdMind AI - Multi-Provider AI Service
// Groq (cheap/fast) → OpenRouter (flexible) → Claude (premium)
// ============================================

import type { AIAnalysis } from '@/types';

export type AIProvider = 'groq' | 'openrouter' | 'anthropic';

interface AIRequestPayload {
  questionTitle: string;
  options: { text: string; votes: number; percentage: number }[];
  totalVotes: number;
  category?: string;
  tags?: string[];
}

const SYSTEM_PROMPT = `You are CrowdMind AI, an advanced collective intelligence analyst. You analyze voting data from millions of users worldwide to generate strategic insights.

Given a question, its voting options with vote counts and percentages, return a JSON analysis with EXACTLY this structure:
{
  "summary": "2-3 sentence analysis of the voting results and what they reveal",
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": number between 50-98 (based on vote count and margin),
  "insights": ["insight 1", "insight 2", "insight 3", "insight 4"] (exactly 4 insights),
  "recommendation": "1-2 sentence strategic recommendation based on the data",
  "demographics": [
    {"label": "18-24", "value": number},
    {"label": "25-34", "value": number},
    {"label": "35-44", "value": number},
    {"label": "45+", "value": number}
  ] (estimated demographic breakdown, values must sum to 100),
  "trendDirection": "up" | "down" | "stable"
}

Rules:
- Be insightful and specific, not generic
- Reference actual option names and percentages
- Confidence should scale with total votes (more votes = higher confidence)
- Sentiment should reflect the overall tone of the results
- Demographics are estimated based on the topic category
- Respond ONLY with valid JSON, no markdown, no code blocks`;

function buildUserPrompt(payload: AIRequestPayload): string {
  const optionsText = payload.options
    .map((o, i) => `  ${i + 1}. "${o.text}" — ${o.votes.toLocaleString()} votes (${o.percentage}%)`)
    .join('\n');

  return `Question: "${payload.questionTitle}"
Category: ${payload.category || 'general'}
Total Votes: ${payload.totalVotes.toLocaleString()}
${payload.tags?.length ? `Tags: ${payload.tags.join(', ')}` : ''}

Options:
${optionsText}

Analyze this voting data and return your JSON analysis.`;
}

// ─── Groq ───────────────────────────────────────────
async function callGroq(payload: AIRequestPayload): Promise<AIAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return parseAIResponse(data.choices[0].message.content);
}

// ─── OpenRouter ─────────────────────────────────────
async function callOpenRouter(payload: AIRequestPayload): Promise<AIAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://crowdmind.ai',
      'X-Title': 'CrowdMind AI',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return parseAIResponse(data.choices[0].message.content);
}

// ─── Anthropic Claude ───────────────────────────────
async function callAnthropic(payload: AIRequestPayload): Promise<AIAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(payload) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const textBlock = data.content.find((b: { type: string }) => b.type === 'text');
  if (!textBlock) throw new Error('No text in Anthropic response');
  return parseAIResponse(textBlock.text);
}

// ─── Response Parser ────────────────────────────────
function parseAIResponse(raw: string): AIAnalysis {
  // Strip markdown code blocks if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Validate and normalize
  return {
    summary: String(parsed.summary || ''),
    sentiment: ['positive', 'negative', 'neutral', 'mixed'].includes(parsed.sentiment)
      ? parsed.sentiment
      : 'neutral',
    confidence: Math.max(50, Math.min(98, Number(parsed.confidence) || 70)),
    insights: Array.isArray(parsed.insights)
      ? parsed.insights.slice(0, 4).map(String)
      : ['Analysis pending'],
    recommendation: parsed.recommendation ? String(parsed.recommendation) : undefined,
    demographics: Array.isArray(parsed.demographics)
      ? parsed.demographics.map((d: { label: string; value: number }) => ({
          label: String(d.label),
          value: Number(d.value) || 0,
        }))
      : undefined,
    trendDirection: ['up', 'down', 'stable'].includes(parsed.trendDirection)
      ? parsed.trendDirection
      : 'stable',
  };
}

// ─── Fallback Mock ──────────────────────────────────
function getMockAnalysis(payload: AIRequestPayload): AIAnalysis {
  return {
    summary: `Based on ${payload.totalVotes.toLocaleString()} votes for "${payload.questionTitle}", the collective intelligence shows a clear trend. The leading option reflects broader market sentiment and aligns with current global trends.`,
    sentiment: payload.totalVotes > 10000 ? 'positive' : 'neutral',
    confidence: Math.min(95, 50 + Math.floor(payload.totalVotes / 500)),
    insights: [
      `${payload.options[0]?.text || 'Leading option'} leads with strong support across demographics`,
      'Voting patterns suggest high conviction among participants',
      'Similar questions globally show consistent results',
      'Engagement rate is above platform average',
    ],
    recommendation:
      'The crowd wisdom strongly favors the leading option. Consider this alongside your own research and context.',
    demographics: [
      { label: '18-24', value: 35 },
      { label: '25-34', value: 40 },
      { label: '35-44', value: 15 },
      { label: '45+', value: 10 },
    ],
    trendDirection: 'up',
  };
}

// ─── Main Entry Point ───────────────────────────────
const providers: Record<AIProvider, (payload: AIRequestPayload) => Promise<AIAnalysis>> = {
  groq: callGroq,
  openrouter: callOpenRouter,
  anthropic: callAnthropic,
};

export async function analyzeWithAI(payload: AIRequestPayload): Promise<AIAnalysis> {
  const providerName = (process.env.AI_PROVIDER || 'mock') as AIProvider | 'mock';

  // No provider configured — return mock
  if (providerName === 'mock' || !providers[providerName]) {
    console.log('[AI] Using mock analysis (set AI_PROVIDER env to enable real AI)');
    return getMockAnalysis(payload);
  }

  try {
    console.log(`[AI] Calling ${providerName}...`);
    const result = await providers[providerName](payload);
    console.log(`[AI] ${providerName} returned successfully`);
    return result;
  } catch (error) {
    console.error(`[AI] ${providerName} failed:`, error);
    // Fallback to mock on error
    console.log('[AI] Falling back to mock analysis');
    return getMockAnalysis(payload);
  }
}
