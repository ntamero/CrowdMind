// Seed 10 fresh MIA questions with Pexels images (using pg directly)
const { Client } = require('pg');
const { randomUUID } = require('crypto');

const PEXELS_KEY = 'BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0';

const newQuestions = [
  {
    cat: 'technology',
    q: 'Will humanoid robots be in homes by 2028?',
    desc: 'Tesla Optimus, Figure AI, and Boston Dynamics are racing to build affordable humanoid robots. Will they succeed in bringing them to consumer homes?',
    opts: ['Yes, mass production', 'Only for wealthy', 'Industrial use only', 'Not before 2030'],
    img: 'humanoid robot technology',
  },
  {
    cat: 'finance',
    q: 'Solana vs Ethereum — which wins the DeFi war?',
    desc: 'Solana is gaining ground with faster transactions and lower fees. Can it overtake Ethereum in total DeFi value locked?',
    opts: ['Ethereum stays king', 'Solana flips ETH', 'Both coexist', 'New chain wins'],
    img: 'cryptocurrency blockchain',
  },
  {
    cat: 'sports',
    q: 'Will an AI coach lead a team to a championship?',
    desc: 'AI-assisted coaching is already used in NBA and Premier League. How far will it go?',
    opts: ['Within 5 years', 'Within 10 years', 'Never fully AI', 'Already happening'],
    img: 'sports coaching strategy',
  },
  {
    cat: 'entertainment',
    q: 'Is the era of superhero movies finally over?',
    desc: 'Box office numbers for superhero films have been declining. Marvel and DC are restructuring. What happens next?',
    opts: ['Yes, audience fatigue', 'No, just a reset', 'Smaller budget era', 'New genre takes over'],
    img: 'cinema movie superhero',
  },
  {
    cat: 'lifestyle',
    q: 'Will 4-day work week become the global standard?',
    desc: 'Trials in UK, Spain, and Japan show productivity gains with 4-day weeks. Will governments mandate it?',
    opts: ['By 2028', 'By 2030', 'Only some countries', 'Never standard'],
    img: 'office work life balance',
  },
  {
    cat: 'health',
    q: 'Can AI diagnose diseases better than doctors in 2026?',
    desc: 'Google DeepMind and other AI systems are matching or exceeding doctor accuracy in radiology and pathology. Is this the future?',
    opts: ['Already better', 'By end of 2026', 'Assists but not replaces', 'Too many errors still'],
    img: 'medical AI healthcare',
  },
  {
    cat: 'technology',
    q: 'Which country will lead the AI race by 2030?',
    desc: 'USA and China are investing billions in AI. Europe is regulating. Who comes out on top?',
    opts: ['USA', 'China', 'EU surprise', 'India rises', 'No clear winner'],
    img: 'artificial intelligence global',
  },
  {
    cat: 'finance',
    q: 'Will gold hit $4,000 per ounce this year?',
    desc: 'Gold has been on a historic rally, breaking records. Central banks are buying at unprecedented rates.',
    opts: ['Yes, easily', 'Close but no', 'Crashes back down', 'Already there'],
    img: 'gold bars investment',
  },
  {
    cat: 'business',
    q: 'Will OpenAI become the most valuable startup ever?',
    desc: 'With valuations exceeding $300B and ChatGPT reaching 300M users, OpenAI is on a rocket trajectory.',
    opts: ['Yes, $1T valuation', 'Competitors catch up', 'Bubble pops', 'Already is'],
    img: 'startup technology company',
  },
  {
    cat: 'lifestyle',
    q: 'Is social media making Gen Z more or less creative?',
    desc: 'TikTok and YouTube have democratized creativity but also created echo chambers. What does the data say?',
    opts: ['More creative', 'Less creative', 'Different kind of creative', 'No measurable effect'],
    img: 'social media youth creative',
  },
];

const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981'];

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

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();

  // Get MIA user
  const miaRes = await client.query("SELECT id FROM \"User\" WHERE username ILIKE 'mia' LIMIT 1");
  if (miaRes.rows.length === 0) {
    console.log('MIA user not found! Run seed-raw.js first.');
    await client.end();
    return;
  }
  const miaId = miaRes.rows[0].id;
  console.log(`MIA user ID: ${miaId}`);

  let created = 0;
  for (let i = 0; i < newQuestions.length; i++) {
    const t = newQuestions[i];

    // Check if exists
    const existRes = await client.query('SELECT id FROM "Question" WHERE title = $1 LIMIT 1', [t.q]);
    if (existRes.rows.length > 0) {
      console.log(`[${i+1}] SKIP (exists): ${t.q}`);
      continue;
    }

    const daysToExpiry = 7 + Math.floor(Math.random() * 21);
    const expiresAt = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);

    console.log(`[${i+1}/${newQuestions.length}] Creating: ${t.q}`);
    const imageUrl = await getImage(t.img);

    const qId = randomUUID();
    await client.query(
      `INSERT INTO "Question" (id, title, description, category, "imageUrl", "userId", status, visibility, "expiresAt", "totalVotes", "totalComments", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'active', 'public', $7, 0, 0, NOW(), NOW())`,
      [qId, t.q, t.desc, t.cat, imageUrl, miaId, expiresAt]
    );

    for (let j = 0; j < t.opts.length; j++) {
      await client.query(
        `INSERT INTO "QuestionOption" (id, "questionId", label, "order", color, "voteCount")
         VALUES ($1, $2, $3, $4, $5, 0)`,
        [randomUUID(), qId, t.opts[j], j, colors[j % colors.length]]
      );
    }

    created++;
    console.log(`  ✓ Created with ${imageUrl ? 'image' : 'no image'}`);
  }

  console.log(`\nDone! Created ${created} new questions by MIA.`);
  await client.end();
}

main().catch(console.error);
