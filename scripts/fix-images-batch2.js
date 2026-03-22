const { Client } = require('pg');
const PEXELS_KEY = 'BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0';

const searches = {
  'Will Bitcoin close above': 'bitcoin cryptocurrency trading chart',
  'Which team will dominate tonight': 'basketball nba game court',
  'Will Apple announce': 'apple technology product launch',
  'Which movie will top': 'cinema movie theater popcorn',
  'Will the S&P 500': 'stock market wall street trading',
  'Will GPT-5 be released': 'artificial intelligence robot technology',
  'Will Ethereum break': 'ethereum crypto digital currency',
  'Will any country officially adopt Bitcoin': 'government parliament politics',
  'Will a major mRNA vaccine': 'medical research laboratory science',
  'Will a tech company announce': 'corporate office technology business',
};

async function getImg(q) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=3`, {
    headers: { Authorization: PEXELS_KEY },
  });
  const data = await res.json();
  if (data.photos?.length > 0) return data.photos[Math.floor(Math.random() * data.photos.length)].src.large;
  return null;
}

async function main() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'wisery', password: 'wisery2026', database: 'wisery_db' });
  await client.connect();
  const res = await client.query('SELECT id, title FROM "Question" WHERE "imageUrl" IS NULL');
  console.log('Questions without images:', res.rows.length);
  for (const row of res.rows) {
    let searchQ = null;
    for (const [prefix, sq] of Object.entries(searches)) {
      if (row.title.startsWith(prefix)) { searchQ = sq; break; }
    }
    if (!searchQ) searchQ = row.title.split(' ').slice(0, 4).join(' ');
    const img = await getImg(searchQ);
    if (img) {
      await client.query('UPDATE "Question" SET "imageUrl" = $1 WHERE id = $2', [img, row.id]);
      console.log('Updated:', row.title.substring(0, 50));
    } else {
      console.log('No image for:', row.title.substring(0, 50));
    }
  }
  await client.end();
  console.log('Done!');
}
main().catch(console.error);
