// Seed 10 fresh MIA questions with Pexels images
const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

const PEXELS_KEY = process.env.PEXELS_API_KEY || '';

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

async function getImage(query) {
  if (!PEXELS_KEY) return null;
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
  // Get or create MIA user
  let miaUser = await prisma.user.findFirst({ where: { username: 'MIA' } });
  if (!miaUser) {
    miaUser = await prisma.user.create({
      data: {
        email: 'mia@wisery.live',
        passwordHash: 'system',
        displayName: 'MIA',
        username: 'MIA',
        role: 'admin',
        emailVerified: true,
        badge: 'oracle',
        xp: 10000,
        level: 50,
        reputation: 9999,
      },
    });
    console.log('Created MIA user');
  }

  let created = 0;
  for (let i = 0; i < newQuestions.length; i++) {
    const t = newQuestions[i];

    // Check if question already exists
    const existing = await prisma.question.findFirst({ where: { title: t.q } });
    if (existing) {
      console.log(`[${i+1}] SKIP (exists): ${t.q}`);
      continue;
    }

    const daysToExpiry = 7 + Math.floor(Math.random() * 21);
    const expiresAt = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);

    console.log(`[${i+1}/${newQuestions.length}] Creating: ${t.q}`);
    const imageUrl = await getImage(t.img);

    await prisma.question.create({
      data: {
        title: t.q,
        description: t.desc,
        category: t.cat,
        imageUrl: imageUrl,
        userId: miaUser.id,
        status: 'active',
        visibility: 'public',
        expiresAt,
        options: {
          create: t.opts.map((label, idx) => ({
            label,
            order: idx,
            color: ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981'][idx % 5],
          })),
        },
      },
    });
    created++;
    console.log(`  ✓ Created with ${imageUrl ? 'image' : 'no image'}`);
  }

  console.log(`\nDone! Created ${created} new questions by MIA.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
