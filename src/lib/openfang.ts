// ============================================
// OpenFang AI Integration for Wisery
// Connects to OpenFang agent on localhost:4200
// ============================================

const OPENFANG_URL = process.env.OPENFANG_URL || 'http://localhost:4200';

interface OpenFangResponse {
  success: boolean;
  data?: {
    response?: string;
    message?: string;
    analysis?: string;
  };
  error?: string;
}

/**
 * Send a question to OpenFang agent for analysis
 */
export async function getOpenFangAnalysis(
  questionTitle: string,
  options: string[],
  category: string,
  totalVotes?: number,
): Promise<string | null> {
  try {
    const prompt = `Analyze this community poll/prediction on Wisery platform:

Question: "${questionTitle}"
Category: ${category}
Options: ${options.join(', ')}
${totalVotes ? `Total Votes: ${totalVotes}` : 'New question, no votes yet'}

Provide a brief, insightful analysis (2-3 sentences max) covering:
- Why this question matters
- What the crowd sentiment likely indicates
- A smart take or prediction

Be conversational and engaging. This will be shown as an AI comment on the platform.`;

    const res = await fetch(`${OPENFANG_URL}/api/agents/general/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data: OpenFangResponse = await res.json();
    return data.data?.response || data.data?.message || null;
  } catch (err) {
    console.error('OpenFang analysis error:', err);
    return null;
  }
}

/**
 * Get OpenFang status
 */
export async function getOpenFangStatus(): Promise<{ online: boolean; version?: string }> {
  try {
    const res = await fetch(`${OPENFANG_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: data.status === 'ok', version: data.version };
  } catch {
    return { online: false };
  }
}
