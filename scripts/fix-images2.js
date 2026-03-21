const { Client } = require('pg');
const https = require('https');

const PEXELS_KEY = 'YsR0vGxch3KlonMgJz1XYHlMOI6lFVZURXigRlrhgu9QxC29fpINvD6A';

// Simple single-word searches for reliability
const searchTerms = [
  'technology', 'bitcoin', 'smartphone', 'football', 'basketball',
  'cinema', 'music', 'laptop', 'city', 'food',
  'couple', 'court', 'office', 'mosque', 'doctor',
  'meditation', 'skyscraper', 'robot', 'coding', 'science',
  'gaming', 'streaming', 'investment', 'economy', 'earth',
  'sports', 'entertainment', 'business', 'education', 'nature',
  'sunset', 'ocean', 'mountain', 'space', 'future',
];

function fetchImage(query) {
  return new Promise((resolve) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const options = {
      headers: { Authorization: PEXELS_KEY },
      timeout: 10000,
    };
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos?.length > 0) {
            const idx = Math.floor(Math.random() * json.photos.length);
            resolve(json.photos[idx].src.large);
          } else {
            console.log(`  API returned no photos for "${query}", status: ${res.statusCode}`);
            resolve(null);
          }
        } catch(e) {
          console.log(`  Parse error for "${query}": ${e.message}, raw: ${data.substring(0, 200)}`);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => { console.log(`  Request error: ${e.message}`); resolve(null); });
    req.on('timeout', () => { console.log(`  Timeout for "${query}"`); req.destroy(); resolve(null); });
  });
}

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();

  const { rows } = await client.query('SELECT id, title FROM "Question" WHERE "imageUrl" IS NULL ORDER BY "createdAt" DESC');
  console.log(`Found ${rows.length} questions without images\n`);

  let fixed = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const searchTerm = searchTerms[i % searchTerms.length];
    console.log(`[${i+1}/${rows.length}] "${row.title.substring(0, 50)}..." → ${searchTerm}`);

    const imgUrl = await fetchImage(searchTerm);
    if (imgUrl) {
      await client.query('UPDATE "Question" SET "imageUrl" = $1 WHERE id = $2', [imgUrl, row.id]);
      fixed++;
      console.log(`  ✅ Done`);
    } else {
      console.log(`  ❌ Failed`);
    }
    // Longer delay between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✅ Fixed ${fixed}/${rows.length} question images`);
  await client.end();
}

main().catch(console.error);
