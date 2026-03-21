const { Client } = require('pg');
const https = require('https');

const PEXELS_KEY = 'BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0';
const MIA_ID = '25159993-a3a6-43a2-8f4c-5f8f37da3e9d';
const TAMER_ID = '51ebb2f3-3ac3-4712-9ab0-16785841bfb6';

const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#f97316'];

const questions = [
  { cat: 'technology', q: 'Will GPT-5 be released before September 2026?', opts: ['Yes, definitely', 'No, delayed', 'Partial release only', 'Already released'], img: 'artificial intelligence' },
  { cat: 'technology', q: 'Which AI company will dominate by end of 2026?', opts: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI', 'xAI'], img: 'AI technology' },
  { cat: 'technology', q: 'Will Apple release AR glasses this year?', opts: ['Yes, 2026', 'No, 2027+', 'Only developer version', 'Cancelled'], img: 'augmented reality glasses' },
  { cat: 'technology', q: 'Is TikTok going to be banned in the US?', opts: ['Yes, fully banned', 'No, deal made', 'Partially restricted', 'Sold to US company'], img: 'social media app' },
  { cat: 'technology', q: 'Will quantum computers break encryption by 2030?', opts: ['Yes', 'No', 'Partially', 'Too early to tell'], img: 'quantum computer' },
  { cat: 'finance', q: 'Bitcoin price by end of 2026?', opts: ['Under $80K', '$80K-$120K', '$120K-$200K', 'Above $200K'], img: 'bitcoin cryptocurrency' },
  { cat: 'finance', q: 'Will Ethereum flip Bitcoin in market cap?', opts: ['Yes, in 2026', 'Yes, but later', 'Never happening', 'Already happened'], img: 'ethereum crypto' },
  { cat: 'finance', q: 'Best investment strategy for 2026?', opts: ['AI stocks', 'Crypto', 'Real estate', 'Index funds', 'Gold'], img: 'stock market investment' },
  { cat: 'finance', q: 'Will there be a global recession in 2026?', opts: ['Yes, severe', 'Mild slowdown', 'No recession', 'Only in some regions'], img: 'global economy' },
  { cat: 'sports', q: 'Who will win the 2026 FIFA World Cup?', opts: ['Brazil', 'France', 'Argentina', 'Germany', 'England'], img: 'football world cup' },
  { cat: 'sports', q: 'Will Messi play in the 2026 World Cup?', opts: ['Yes, starting', 'Yes, as substitute', 'No, retired', 'Undecided'], img: 'lionel messi football' },
  { cat: 'sports', q: 'NBA MVP 2025-2026 season?', opts: ['Luka Doncic', 'Nikola Jokic', 'Jayson Tatum', 'Victor Wembanyama'], img: 'basketball NBA' },
  { cat: 'entertainment', q: 'Best movie of 2026 so far?', opts: ['Avatar 3', 'Avengers: Secret Wars', 'The Batman 2', 'Dune 3', 'Other'], img: 'cinema movie theater' },
  { cat: 'entertainment', q: 'Will AI-generated music top the Billboard charts?', opts: ['Yes, already did', 'Soon, within months', 'Not this year', 'Never'], img: 'music production studio' },
  { cat: 'entertainment', q: 'Which streaming platform will lead in 2026?', opts: ['Netflix', 'Disney+', 'YouTube Premium', 'Apple TV+'], img: 'streaming entertainment' },
  { cat: 'entertainment', q: 'GTA 6 will break all sales records?', opts: ['Yes, day one', 'Yes, within a week', 'No, overhyped', 'Delayed again'], img: 'video game gaming' },
  { cat: 'lifestyle', q: 'Remote work vs Office — what wins in 2026?', opts: ['Full remote', 'Hybrid (3+2)', 'Back to office', 'Depends on industry'], img: 'remote work laptop' },
  { cat: 'lifestyle', q: 'Best city to live in 2026?', opts: ['Dubai', 'Lisbon', 'Austin', 'Singapore', 'Tokyo'], img: 'modern city skyline' },
  { cat: 'lifestyle', q: 'Will plant-based meat replace real meat?', opts: ['Yes, within 10 years', 'Partially', 'No, never', 'Lab-grown instead'], img: 'vegan food healthy' },
  { cat: 'lifestyle', q: 'Dating apps — still relevant in 2026?', opts: ['More popular than ever', 'Declining', 'AI dating assistants', 'Dead, IRL is back'], img: 'dating couple love' },
  { cat: 'politics', q: 'Will AI regulation pass globally by 2027?', opts: ['Yes, strict rules', 'Partial regulation', 'No consensus', 'Self-regulation only'], img: 'government politics law' },
  { cat: 'politics', q: 'EU vs Big Tech — who wins?', opts: ['EU forces changes', 'Big Tech adapts', 'Stalemate', 'Companies leave EU'], img: 'european union flag' },
  { cat: 'politics', q: 'Will Turkey join the EU by 2030?', opts: ['Yes', 'No', 'Partial membership', 'Not interested anymore'], img: 'turkey istanbul mosque' },
  { cat: 'health', q: 'Will we cure cancer with AI by 2030?', opts: ['Major breakthrough', 'Significant progress', 'Some cancers only', 'Too optimistic'], img: 'medical research science' },
  { cat: 'health', q: 'Is intermittent fasting actually healthy?', opts: ['Yes, proven benefits', 'Depends on person', 'Overhyped', 'Can be harmful'], img: 'healthy food diet' },
  { cat: 'health', q: 'Mental health crisis — getting better or worse?', opts: ['Getting worse', 'Slowly improving', 'Same as always', 'Varies by region'], img: 'mental health wellness' },
  { cat: 'business', q: 'First company to reach $5 trillion?', opts: ['Apple', 'Microsoft', 'NVIDIA', 'Saudi Aramco', 'Google'], img: 'business corporate office' },
  { cat: 'business', q: 'Will AI replace 50% of jobs by 2030?', opts: ['Yes', 'No, but transforms them', 'Only 20-30%', 'Creates more jobs'], img: 'artificial intelligence robot' },
  { cat: 'business', q: 'Best programming language to learn in 2026?', opts: ['Python', 'Rust', 'TypeScript', 'Go', 'None — AI codes for you'], img: 'programming code developer' },
  { cat: 'other', q: 'Would you trust an AI doctor over a human doctor?', opts: ['Yes, AI is more accurate', 'Only for diagnosis', 'Never', 'Combined approach'], img: 'futuristic technology' },
];

function fetchImage(query) {
  return new Promise((resolve) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`;
    const options = { headers: { Authorization: PEXELS_KEY } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos?.length > 0) {
            const idx = Math.floor(Math.random() * Math.min(5, json.photos.length));
            resolve(json.photos[idx].src.large);
          } else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();
  console.log('Connected to DB');

  let created = 0;
  for (let i = 0; i < questions.length; i++) {
    const t = questions[i];
    const userId = i % 3 !== 0 ? MIA_ID : TAMER_ID;
    const daysToExpiry = 3 + Math.floor(Math.random() * 28);
    const expiresAt = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);

    console.log(`[${i+1}/${questions.length}] ${t.q}`);
    const imageUrl = await fetchImage(t.img);

    const qId = uuid();
    const totalVotes = t.opts.reduce((s) => s + Math.floor(Math.random() * 50) + 5, 0);
    const type = t.opts.length === 2 ? 'binary' : 'multiple';

    await client.query(
      `INSERT INTO "Question" (id, title, description, category, status, "imageUrl", "expiresAt", "userId", "totalVotes", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, NOW(), NOW())`,
      [qId, t.q, `Community prediction — vote and earn XP!`, t.cat, imageUrl, expiresAt, userId, totalVotes]
    );

    // Insert options
    const optVotes = [];
    let remaining = totalVotes;
    for (let j = 0; j < t.opts.length; j++) {
      const isLast = j === t.opts.length - 1;
      const v = isLast ? remaining : Math.floor(Math.random() * (remaining / (t.opts.length - j) * 2));
      optVotes.push(v);
      remaining -= v;
    }

    for (let j = 0; j < t.opts.length; j++) {
      await client.query(
        `INSERT INTO "QuestionOption" (id, "questionId", label, "voteCount") VALUES ($1, $2, $3, $4)`,
        [uuid(), qId, t.opts[j], optVotes[j]]
      );
    }

    // MIA comment
    const sentiments = ['bullish', 'bearish', 'neutral', 'cautious'];
    const sentiment = sentiments[Math.floor(Math.random() * 4)];
    const confidence = 55 + Math.floor(Math.random() * 40);
    await client.query(
      `INSERT INTO "Comment" (id, text, "questionId", "userId", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuid(), `🤖 MIA Analysis: Based on current trends and community sentiment, this question shows a ${sentiment} outlook with ${confidence}% confidence. The crowd wisdom suggests interesting patterns forming.`, qId, MIA_ID]
    );

    created++;
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n✅ Created ${created} questions with images and MIA comments!`);
  await client.end();
}

main().catch(console.error);
