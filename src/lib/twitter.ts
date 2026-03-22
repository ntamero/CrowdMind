import crypto from 'crypto';

const TWITTER_API_V2 = 'https://api.twitter.com/2';

// OAuth 1.0a signing
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const signature = generateSignature(method, url, oauthParams, consumerSecret, accessTokenSecret);
  oauthParams['oauth_signature'] = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

// ═══════════ Public API ═══════════

export async function postTweet(text: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const consumerKey = process.env.TWITTER_CONSUMER_KEY;
  const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    console.warn('Twitter API credentials not configured');
    return { success: false, error: 'Twitter credentials not configured' };
  }

  const url = `${TWITTER_API_V2}/tweets`;

  try {
    const authHeader = buildAuthHeader('POST', url, consumerKey, consumerSecret, accessToken, accessTokenSecret);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (res.ok && data.data?.id) {
      console.log(`Tweet posted: ${data.data.id}`);
      return { success: true, tweetId: data.data.id };
    }

    console.error('Twitter API error:', JSON.stringify(data));
    return { success: false, error: data.detail || data.title || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Twitter post error:', message);
    return { success: false, error: message };
  }
}

// ═══════════ Pre-built tweet templates ═══════════

export async function tweetNewQuestion(
  title: string,
  category: string,
  questionId?: string,
  duration?: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const url = questionId ? `https://wisery.live/questions/${questionId}` : 'https://wisery.live';

  const durationEmoji = duration === 'daily' ? '⏰ 24h' : duration === 'weekly' ? '📅 7 days' : duration === 'monthly' ? '📆 30 days' : '';
  const durationText = durationEmoji ? `\n${durationEmoji} to vote` : '';

  const hashtags = getHashtags(category);

  const text =
    `🗳️ New on Wisery!\n\n` +
    `"${title}"${durationText}\n\n` +
    `Vote now & earn XP 👇\n${url}\n\n` +
    `${hashtags} #Wisery #PredictionMarket #VoteToEarn`;

  // Twitter limit is 280 chars
  const trimmed = text.length > 280 ? text.substring(0, 277) + '...' : text;

  return postTweet(trimmed);
}

export async function tweetBatchQuestions(
  questions: Array<{ title: string; category: string; duration: string }>
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const dailyCount = questions.filter((q) => q.duration === 'daily').length;
  const weeklyCount = questions.filter((q) => q.duration === 'weekly').length;
  const monthlyCount = questions.filter((q) => q.duration === 'monthly').length;

  let breakdown = '';
  if (dailyCount > 0) breakdown += `⏰ ${dailyCount} Daily\n`;
  if (weeklyCount > 0) breakdown += `📅 ${weeklyCount} Weekly\n`;
  if (monthlyCount > 0) breakdown += `📆 ${monthlyCount} Monthly\n`;

  const categories = [...new Set(questions.map((q) => q.category))];
  const hashtags = categories.flatMap((c) => getHashtags(c).split(' ')).slice(0, 4).join(' ');

  const text =
    `🔥 ${questions.length} new questions just dropped on Wisery!\n\n` +
    `${breakdown}\n` +
    `Vote & earn XP rewards 🏆\n\n` +
    `👉 wisery.live/feed\n\n` +
    `${hashtags} #Wisery #VoteToEarn`;

  const trimmed = text.length > 280 ? text.substring(0, 277) + '...' : text;

  return postTweet(trimmed);
}

function getHashtags(category: string): string {
  const map: Record<string, string> = {
    crypto: '#Crypto #Bitcoin',
    finance: '#Finance #Markets',
    technology: '#Tech #AI',
    sports: '#Sports #NBA',
    entertainment: '#Entertainment #Movies',
    politics: '#Politics #World',
    health: '#Health #Science',
    business: '#Business #Startup',
    lifestyle: '#Lifestyle #Trends',
  };
  return map[category.toLowerCase()] || '#Trending';
}
