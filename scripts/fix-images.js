const { Client } = require('pg');
const https = require('https');

const PEXELS_KEY = 'BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0';

const imageMap = {
  'GPT-5': 'artificial intelligence technology',
  'AI company': 'AI robot technology',
  'Apple': 'apple technology gadget',
  'TikTok': 'social media phone',
  'quantum': 'quantum physics science',
  'Bitcoin': 'bitcoin gold coin',
  'Ethereum': 'ethereum cryptocurrency',
  'investment': 'stock market trading',
  'recession': 'economy finance chart',
  'FIFA': 'football soccer stadium',
  'Messi': 'soccer football player',
  'NBA': 'basketball sport',
  'movie': 'cinema movie popcorn',
  'music': 'music headphones studio',
  'streaming': 'streaming tv entertainment',
  'GTA': 'video game controller',
  'Remote work': 'laptop remote work coffee',
  'city': 'city skyline night',
  'plant-based': 'healthy food vegetables',
  'Dating': 'couple romantic sunset',
  'regulation': 'law court justice',
  'Big Tech': 'technology office modern',
  'Turkey': 'istanbul turkey mosque',
  'cancer': 'medical doctor hospital',
  'fasting': 'healthy salad food',
  'Mental health': 'meditation wellness zen',
  'trillion': 'corporate skyscraper business',
  'replace': 'robot AI futuristic',
  'programming': 'coding programmer laptop',
  'AI doctor': 'doctor technology hospital',
};

function fetchImage(query) {
  return new Promise((resolve) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
    https.get(url, { headers: { Authorization: PEXELS_KEY } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos?.length > 0) {
            const idx = Math.floor(Math.random() * json.photos.length);
            resolve(json.photos[idx].src.large);
          } else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();

  const { rows } = await client.query('SELECT id, title FROM "Question" WHERE "imageUrl" IS NULL');
  console.log(`Found ${rows.length} questions without images`);

  let fixed = 0;
  for (const row of rows) {
    // Find best matching search term
    let searchTerm = 'technology';
    for (const [keyword, term] of Object.entries(imageMap)) {
      if (row.title.includes(keyword)) {
        searchTerm = term;
        break;
      }
    }

    console.log(`[${fixed+1}/${rows.length}] "${row.title}" → searching: ${searchTerm}`);
    const imgUrl = await fetchImage(searchTerm);
    if (imgUrl) {
      await client.query('UPDATE "Question" SET "imageUrl" = $1 WHERE id = $2', [imgUrl, row.id]);
      fixed++;
      console.log(`  ✅ Image set`);
    } else {
      console.log(`  ❌ No image found`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✅ Fixed ${fixed}/${rows.length} question images`);
  await client.end();
}

main().catch(console.error);
