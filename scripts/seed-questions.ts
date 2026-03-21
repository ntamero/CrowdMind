// MIA Question Seeder - 30 engaging questions with images
const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

const GROQ_KEY = process.env.GROQ_API_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';

const categories = ['technology', 'finance', 'sports', 'entertainment', 'lifestyle', 'politics', 'health', 'business', 'education', 'other'];

const questionTemplates = [
  // Technology
  { cat: 'technology', q: 'Will GPT-5 be released before September 2026?', opts: ['Yes, definitely', 'No, delayed', 'Partial release only', 'Already released'], img: 'artificial intelligence' },
  { cat: 'technology', q: 'Which AI company will dominate by end of 2026?', opts: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI', 'xAI'], img: 'AI technology' },
  { cat: 'technology', q: 'Will Apple release AR glasses this year?', opts: ['Yes, 2026', 'No, 2027+', 'Only developer version', 'Cancelled'], img: 'augmented reality glasses' },
  { cat: 'technology', q: 'Is TikTok going to be banned in the US?', opts: ['Yes, fully banned', 'No, deal made', 'Partially restricted', 'Sold to US company'], img: 'social media app' },
  { cat: 'technology', q: 'Will quantum computers break encryption by 2030?', opts: ['Yes', 'No', 'Partially', 'Too early to tell'], img: 'quantum computer' },

  // Finance & Crypto
  { cat: 'finance', q: 'Bitcoin price by end of 2026?', opts: ['Under $80K', '$80K-$120K', '$120K-$200K', 'Above $200K'], img: 'bitcoin cryptocurrency' },
  { cat: 'finance', q: 'Will Ethereum flip Bitcoin in market cap?', opts: ['Yes, in 2026', 'Yes, but later', 'Never happening', 'Already happened'], img: 'ethereum crypto' },
  { cat: 'finance', q: 'Best investment strategy for 2026?', opts: ['AI stocks', 'Crypto', 'Real estate', 'Index funds', 'Gold'], img: 'stock market investment' },
  { cat: 'finance', q: 'Will there be a global recession in 2026?', opts: ['Yes, severe', 'Mild slowdown', 'No recession', 'Only in some regions'], img: 'global economy' },

  // Sports
  { cat: 'sports', q: 'Who will win the 2026 FIFA World Cup?', opts: ['Brazil', 'France', 'Argentina', 'Germany', 'England'], img: 'football world cup' },
  { cat: 'sports', q: 'Will Messi play in the 2026 World Cup?', opts: ['Yes, starting', 'Yes, as substitute', 'No, retired', 'Undecided'], img: 'lionel messi football' },
  { cat: 'sports', q: 'NBA MVP 2025-2026 season?', opts: ['Luka Dončić', 'Nikola Jokić', 'Jayson Tatum', 'Victor Wembanyama', 'Shai Gilgeous-Alexander'], img: 'basketball NBA' },

  // Entertainment
  { cat: 'entertainment', q: 'Best movie of 2026 so far?', opts: ['Avatar 3', 'Avengers: Secret Wars', 'The Batman 2', 'Dune 3', 'Other'], img: 'cinema movie theater' },
  { cat: 'entertainment', q: 'Will AI-generated music top the Billboard charts?', opts: ['Yes, already did', 'Soon, within months', 'Not this year', 'Never'], img: 'music production studio' },
  { cat: 'entertainment', q: 'Which streaming platform will lead in 2026?', opts: ['Netflix', 'Disney+', 'YouTube Premium', 'Apple TV+', 'Amazon Prime'], img: 'streaming entertainment' },
  { cat: 'entertainment', q: 'GTA 6 will break all sales records?', opts: ['Yes, day one', 'Yes, within a week', 'No, overhyped', 'Delayed again'], img: 'video game gaming' },

  // Lifestyle
  { cat: 'lifestyle', q: 'Remote work vs Office — what wins in 2026?', opts: ['Full remote', 'Hybrid (3+2)', 'Back to office', 'Depends on industry'], img: 'remote work laptop' },
  { cat: 'lifestyle', q: 'Best city to live in 2026?', opts: ['Dubai', 'Lisbon', 'Austin', 'Singapore', 'Tokyo'], img: 'modern city skyline' },
  { cat: 'lifestyle', q: 'Will plant-based meat replace real meat?', opts: ['Yes, within 10 years', 'Partially', 'No, never', 'Lab-grown instead'], img: 'vegan food healthy' },
  { cat: 'lifestyle', q: 'Dating apps — still relevant in 2026?', opts: ['More popular than ever', 'Declining', 'AI dating assistants', 'Dead, IRL is back'], img: 'dating couple love' },

  // Politics
  { cat: 'politics', q: 'Will AI regulation pass globally by 2027?', opts: ['Yes, strict rules', 'Partial regulation', 'No consensus', 'Self-regulation only'], img: 'government politics law' },
  { cat: 'politics', q: 'EU vs Big Tech — who wins?', opts: ['EU forces changes', 'Big Tech adapts', 'Stalemate', 'Companies leave EU'], img: 'european union flag' },
  { cat: 'politics', q: 'Will Turkey join the EU by 2030?', opts: ['Yes', 'No', 'Partial membership', 'Not interested anymore'], img: 'turkey istanbul' },

  // Health
  { cat: 'health', q: 'Will we cure cancer with AI by 2030?', opts: ['Major breakthrough', 'Significant progress', 'Some cancers only', 'Too optimistic'], img: 'medical research science' },
  { cat: 'health', q: 'Is intermittent fasting actually healthy?', opts: ['Yes, proven benefits', 'Depends on person', 'Overhyped', 'Can be harmful'], img: 'healthy food diet' },
  { cat: 'health', q: 'Mental health crisis — getting better or worse?', opts: ['Getting worse', 'Slowly improving', 'Same as always', 'Varies by region'], img: 'mental health wellness' },

  // Business
  { cat: 'business', q: 'First $5 trillion company?', opts: ['Apple', 'Microsoft', 'NVIDIA', 'Saudi Aramco', 'Google'], img: 'business corporate office' },
  { cat: 'business', q: 'Will AI replace 50% of jobs by 2030?', opts: ['Yes', 'No, but transforms them', 'Only 20-30%', 'Creates more jobs'], img: 'artificial intelligence robot' },
  { cat: 'business', q: 'Best programming language to learn in 2026?', opts: ['Python', 'Rust', 'TypeScript', 'Go', 'None — AI codes for you'], img: 'programming code developer' },

  // Fun / Engaging
  { cat: 'other', q: 'Would you trust an AI doctor over a human doctor?', opts: ['Yes, AI is more accurate', 'Only for diagnosis', 'Never', 'Combined approach'], img: 'futuristic technology' },
];

async function getImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: { Authorization: PEXELS_KEY },
    });
    const data = await res.json();
    if (data.photos?.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(5, data.photos.length));
      return data.photos[idx].src.large;
    }
  } catch {}
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

  // Get Tamer user
  let tamerUser = await prisma.user.findFirst({ where: { email: 'ntamero@gmail.com' } });
  if (!tamerUser) {
    console.log('Tamer user not found, using MIA for all');
    tamerUser = miaUser;
  }

  const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#f97316'];

  let created = 0;
  for (let i = 0; i < questionTemplates.length; i++) {
    const t = questionTemplates[i];
    const isPro = i % 7 === 0; // ~4 pro, rest public
    const isMia = i % 3 !== 0; // 2/3 MIA, 1/3 Tamer
    const userId = isMia ? miaUser.id : tamerUser.id;

    // Random expiry between 3-30 days
    const daysToExpiry = 3 + Math.floor(Math.random() * 28);
    const expiresAt = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);

    // Get image
    console.log(`[${i+1}/${questionTemplates.length}] Creating: ${t.q} (image: ${t.img})`);
    const imageUrl = await getImage(t.img);

    // Create question with options
    const question = await prisma.question.create({
      data: {
        title: t.q,
        description: `Community prediction market — vote and earn XP! ${isPro ? '🔒 Pro question' : '🌐 Public question'}`,
        category: t.cat,
        type: t.opts.length === 2 ? 'binary' : 'multiple',
        status: 'active',
        image: imageUrl,
        expiresAt,
        userId,
        options: {
          create: t.opts.map((opt: string, j: number) => ({
            label: opt,
            voteCount: Math.floor(Math.random() * 50) + 5, // Random initial votes
            color: colors[j % colors.length],
          })),
        },
      },
      include: { options: true },
    });

    // Add MIA AI comment
    const sentiment = ['bullish', 'bearish', 'neutral', 'cautious'][Math.floor(Math.random() * 4)];
    const confidence = 55 + Math.floor(Math.random() * 40);
    await prisma.comment.create({
      data: {
        content: `🤖 MIA Analysis: Based on current trends and community sentiment, this question shows ${sentiment} outlook with ${confidence}% confidence. The crowd wisdom suggests interesting patterns forming around this topic.`,
        questionId: question.id,
        userId: miaUser.id,
        isAiGenerated: true,
      },
    });

    // Update vote counts
    const totalVotes = question.options.reduce((sum: number, o: any) => sum + o.voteCount, 0);
    await prisma.question.update({
      where: { id: question.id },
      data: { totalVotes },
    });

    created++;
    // Small delay to not overwhelm Pexels API
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✅ Created ${created} questions with images and MIA comments!`);
  await prisma.$disconnect();
}

main().catch(console.error);
