// Seed 10 MIA questions: 2 daily, 3 weekly, 5 monthly — with Pexels images + Telegram notification
const { Client } = require('pg');
const { randomUUID } = require('crypto');

const PEXELS_KEY = 'BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0';
const TELEGRAM_BOT_TOKEN = '8757329203:AAGU3RTylnEiJp2THICnipA7XKcNDsjWsOA';
const TELEGRAM_CHAT_ID = '-1003735489682';

// duration: 'daily' = 24h, 'weekly' = 7d, 'monthly' = 30d
const newQuestions = [
  // ── DAILY (2) ──
  {
    cat: 'crypto',
    q: 'Will Bitcoin close above $90,000 today?',
    desc: 'Bitcoin has been trading near all-time highs. With massive institutional inflows and ETF demand, can BTC close above $90K in the next 24 hours?',
    opts: ['Yes, above $90K', 'No, stays below', 'Flash crash below $85K', 'Breaks $95K'],
    img: 'bitcoin cryptocurrency trading',
    duration: 'daily',
  },
  {
    cat: 'sports',
    q: 'Which team will dominate tonight\'s NBA matchups?',
    desc: 'Several key NBA games are on the schedule tonight. With playoff positioning on the line, which conference will claim more wins?',
    opts: ['Eastern Conference sweep', 'Western Conference sweep', 'Split results', 'Major upset happens'],
    img: 'basketball NBA game',
    duration: 'daily',
  },
  // ── WEEKLY (3) ──
  {
    cat: 'technology',
    q: 'Will Apple announce a new AI product this week?',
    desc: 'Apple has been quietly building AI features. Rumors suggest a major announcement could come any day. Will this week be the one?',
    opts: ['Yes, major announcement', 'Minor update only', 'No announcement', 'Partnership reveal'],
    img: 'apple technology innovation',
    duration: 'weekly',
  },
  {
    cat: 'entertainment',
    q: 'Which movie will top the box office this weekend?',
    desc: 'Multiple blockbusters are competing for the #1 spot this weekend. Audience hype is building across social media.',
    opts: ['Action blockbuster', 'Animated film', 'Horror surprise', 'Sequel dominates'],
    img: 'movie cinema box office',
    duration: 'weekly',
  },
  {
    cat: 'finance',
    q: 'Will the S&P 500 finish this week in the green?',
    desc: 'Markets have been volatile with mixed economic signals. Fed rate decision uncertainty looms. How will the week close?',
    opts: ['Green, above +1%', 'Slight green, under +1%', 'Flat (within 0.5%)', 'Red week'],
    img: 'stock market trading wall street',
    duration: 'weekly',
  },
  // ── MONTHLY (5) ──
  {
    cat: 'technology',
    q: 'Will GPT-5 be released before May 2026?',
    desc: 'OpenAI has been teasing next-gen models. Competitors are closing the gap. Will GPT-5 launch within the next month?',
    opts: ['Yes, full release', 'Preview/beta only', 'Delayed to summer', 'Different model name'],
    img: 'artificial intelligence chatbot',
    duration: 'monthly',
  },
  {
    cat: 'crypto',
    q: 'Will Ethereum break $5,000 this month?',
    desc: 'ETH has been showing strength with layer-2 adoption booming and staking yields rising. Can it reach the psychological $5K barrier?',
    opts: ['Yes, breaks $5K', 'Gets close but fails', 'Drops below $3K', 'Stablecoin flip instead'],
    img: 'ethereum crypto blockchain',
    duration: 'monthly',
  },
  {
    cat: 'politics',
    q: 'Will any country officially adopt Bitcoin as legal tender this month?',
    desc: 'Following El Salvador, several nations have been considering Bitcoin legislation. Latin America and Africa are leading the push.',
    opts: ['Yes, new country adopts', 'Bill introduced only', 'No movement', 'Country reverses adoption'],
    img: 'government finance digital currency',
    duration: 'monthly',
  },
  {
    cat: 'health',
    q: 'Will a major mRNA vaccine breakthrough be announced this month?',
    desc: 'mRNA technology is being applied to cancer, HIV, and malaria. Multiple Phase 3 trials are showing promising results.',
    opts: ['Cancer vaccine breakthrough', 'HIV progress', 'Malaria vaccine approved', 'No major news'],
    img: 'medical vaccine research laboratory',
    duration: 'monthly',
  },
  {
    cat: 'business',
    q: 'Will a tech company announce 10,000+ layoffs this month?',
    desc: 'Tech sector restructuring continues as companies optimize for AI-first strategies. Cost-cutting remains a priority.',
    opts: ['Yes, mega layoff', 'Small rounds only (<5K)', 'Hiring surge instead', 'Merger causes restructuring'],
    img: 'tech company office corporate',
    duration: 'monthly',
  },
];

const DURATIONS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

async function getImage(query) {
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: { Authorization: PEXELS_KEY },
    });
    const data = await res.json();
    if (data.photos?.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(5, data.photos.length));
      return data.photos[idx].src.large;
    }
  } catch (e) {
    console.log('Pexels error:', e.message);
  }
  return null;
}

async function sendTelegram(text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error('Telegram error:', data.description);
    return data.ok;
  } catch (e) {
    console.error('Telegram error:', e.message);
    return false;
  }
}

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();

  // Get MIA user
  const miaRes = await client.query("SELECT id FROM \"User\" WHERE username ILIKE 'mia' LIMIT 1");
  if (miaRes.rows.length === 0) {
    console.log('MIA user not found!');
    await client.end();
    return;
  }
  const miaId = miaRes.rows[0].id;
  console.log(`MIA user ID: ${miaId}`);

  const createdQuestions = [];

  for (let i = 0; i < newQuestions.length; i++) {
    const t = newQuestions[i];

    // Check duplicate
    const existRes = await client.query('SELECT id FROM "Question" WHERE title = $1 LIMIT 1', [t.q]);
    if (existRes.rows.length > 0) {
      console.log(`[${i+1}] SKIP (exists): ${t.q}`);
      continue;
    }

    const days = DURATIONS[t.duration];
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    console.log(`[${i+1}/10] Creating (${t.duration}): ${t.q}`);
    const imageUrl = await getImage(t.img);

    const qId = randomUUID();
    await client.query(
      `INSERT INTO "Question" (id, title, description, category, "imageUrl", "userId", status, visibility, "expiresAt", "totalVotes", "totalComments", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'active', 'public', $7, 0, 0, NOW(), NOW())`,
      [qId, t.q, t.desc, t.cat, imageUrl, miaId, expiresAt]
    );

    for (let j = 0; j < t.opts.length; j++) {
      await client.query(
        `INSERT INTO "QuestionOption" (id, "questionId", label, "voteCount")
         VALUES ($1, $2, $3, 0)`,
        [randomUUID(), qId, t.opts[j]]
      );
    }

    createdQuestions.push({ title: t.q, category: t.cat, duration: t.duration, id: qId });
    console.log(`  ✓ Created (${t.duration}, expires: ${expiresAt.toISOString().split('T')[0]}) ${imageUrl ? 'with image' : 'no image'}`);
  }

  await client.end();

  if (createdQuestions.length === 0) {
    console.log('No new questions created (all existed).');
    return;
  }

  // Send Telegram notification
  console.log('\nSending Telegram notification...');

  const dailyQ = createdQuestions.filter(q => q.duration === 'daily');
  const weeklyQ = createdQuestions.filter(q => q.duration === 'weekly');
  const monthlyQ = createdQuestions.filter(q => q.duration === 'monthly');

  let msg = `🔥 <b>MIA just posted ${createdQuestions.length} new questions!</b>\n\n`;

  if (dailyQ.length > 0) {
    msg += `⏰ <b>Daily (24h):</b>\n`;
    dailyQ.forEach(q => msg += `• ${q.title}\n`);
    msg += '\n';
  }
  if (weeklyQ.length > 0) {
    msg += `📅 <b>Weekly (7 days):</b>\n`;
    weeklyQ.forEach(q => msg += `• ${q.title}\n`);
    msg += '\n';
  }
  if (monthlyQ.length > 0) {
    msg += `📆 <b>Monthly (30 days):</b>\n`;
    monthlyQ.forEach(q => msg += `• ${q.title}\n`);
    msg += '\n';
  }

  msg += `🗳️ Vote now and earn XP!\n👉 <a href="https://wisery.live/feed">wisery.live/feed</a>`;

  const sent = await sendTelegram(msg);
  console.log(sent ? '✓ Telegram notification sent!' : '✗ Telegram notification failed');

  console.log(`\nDone! Created ${createdQuestions.length} questions.`);
}

main().catch(console.error);
