# CROWDMIND / WISERY — Project Soul & Progress Tracker

## Project Identity
- **Name:** Wisery (CrowdMind)
- **Vision:** Social prediction & voting platform — Ask, Vote, Earn WSR tokens
- **Live URL:** https://wisery.live
- **GitHub:** https://github.com/ntamero/CrowdMind
- **Owner:** TAMER
- **Domain:** wisery.live (Namecheap DNS → Hetzner VPS)

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL 16 (Prisma 7 ORM) |
| Auth | Custom JWT (email/password + wallet SIWE) |
| UI | Tailwind 4 + shadcn/ui + Framer Motion |
| AI | Groq (MIA engine) |
| Web3 | ethers.js v6 + MetaMask |
| Blockchain | Polygon Amoy Testnet (Chain ID: 80002) |
| Token | WSR (ERC-20) — 1B supply |
| Deploy | Hetzner VPS (Ubuntu 24.04) + PM2 + Nginx |

---

## WSR Token Economy
| Parameter | Value |
|-----------|-------|
| Token Name | Wisery (WSR) |
| Network | Polygon Amoy Testnet |
| Contract (v1) | `0x56df3739cc0510151897424CD662060066a4Ab97` |
| Deployer Wallet | `0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119` |
| Total Supply | 1,000,000,000 WSR |
| XP → WSR Rate | 250 XP = 1 WSR |
| Conversion Fee | 10 XP per transaction (→ 0.04 WSR to pool) |
| WSR → XP Rate | 1 WSR = 250 XP (- 10 XP fee) |
| WSR Price | 1 WSR = $0.001 (testnet) |
| Min Conversion | 1 WSR (260 XP minimum) |
| Cooldown | 1 hour between XP→WSR conversions |

### XP Earning Methods
| Action | XP Reward |
|--------|-----------|
| Vote on question | +1 XP |
| Create question | +3 XP |
| Leave comment | +1 XP |
| Correct prediction | +5 XP |
| Level up | Every 1000 XP = +1 Level |

### Pool Wallet (Fee Collection)
- **Address:** `0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119`
- **Purpose:** Collects 0.04 WSR fee from every XP↔WSR conversion
- **Visible in:** Admin Panel → Wallets tab
- **Withdrawal:** Admin can transfer pool WSR to personal MetaMask

---

## VPS Deployment
| Detail | Value |
|--------|-------|
| VPS | Hetzner, IP `37.27.247.119`, Ubuntu 24.04, 16GB RAM |
| Port | 3200 |
| PM2 Process | `wisery` |
| Nginx | /etc/nginx/sites-available/wisery |
| Code Path | /var/www/wisery |
| SSL | Let's Encrypt (auto-renew) |
| PostgreSQL | user: wisery, db: wisery_db |

### Deploy Command
```bash
ssh root@37.27.247.119
cd /var/www/wisery && git pull origin master
npx prisma db push && npx prisma generate
npx next build && pm2 restart wisery
```

---

## Core Features & Status

### Completed
| Feature | Description |
|---------|-------------|
| Auth System | Email/password registration, JWT sessions, email verification |
| Wallet Connect | MetaMask SIWE, Polygon Amoy, auto-reconnect |
| XP Wallet | Per-user XP tracking, earn from votes/questions/comments |
| WSR Token | ERC-20 on Polygon Amoy, 1B supply |
| XP → WSR Conversion | 250 XP = 1 WSR, 10 XP fee, 1hr cooldown |
| WSR → XP Conversion | 1 WSR = 240 XP (250 - 10 fee) |
| On-chain WSR Deposit | MetaMask → Site: send WSR to pool wallet, backend verifies tx, credits unclaimedWSR |
| On-chain WSR Withdrawal | Site → MetaMask: backend sends WSR from deployer wallet to user's wallet on Polygon Amoy |
| Pool Wallet | Fee collection (0.04 WSR per conversion), admin visible |
| Admin Panel (Real Data) | Overview, Users, Questions, Categories, Earnings, Wallets, Transactions, Timers |
| Dashboard | Overview stats, my questions, create question, earnings, wallet tab |
| Question System | Create, vote, options, categories, expiry, images |
| Leaderboard | Top users by reputation/XP |
| Predictions | Prediction markets with participation |
| Feed | Social feed with posts |
| Earn Page | Daily tasks, achievements, earning methods |
| Token Page | WSR token info and guide |
| Comments | Nested comments with likes |
| MIA AI | AI analysis engine (Groq) |
| Seed Script | 30+ questions with Pexels images |

### Database Models (Prisma)
User, Session, Question, QuestionOption, Vote, Comment, CommentLike, Prediction, PredictionOption, PredictionParticipation, Post, PostLike, Follow, TokenTransaction, PoolWallet, PoolTransaction, Bookmark, Notification, UserAchievement, Hashtag

### Key Files
```
src/app/wallet/page.tsx          — XP↔WSR conversion UI (two-way)
src/app/dashboard/page.tsx       — User dashboard (XP/WSR units)
src/app/admin/page.tsx           — Admin panel (real DB data)
src/app/earn/page.tsx            — Earning methods & daily tasks
src/app/api/wallet/claim/route.ts           — XP → WSR conversion API
src/app/api/wallet/deposit/route.ts         — WSR → XP conversion API (internal)
src/app/api/wallet/onchain-deposit/route.ts — MetaMask → Site WSR deposit (verifies on-chain tx)
src/app/api/wallet/withdraw/route.ts        — Site → MetaMask WSR withdrawal (sends on-chain)
src/app/api/wallet/balance/route.ts         — On-chain balance check
src/app/api/wallet/connect/route.ts         — MetaMask SIWE connection
src/app/api/admin/stats/route.ts    — Admin dashboard data
src/app/api/admin/pool/route.ts     — Pool wallet data
src/context/WalletContext.tsx    — MetaMask state provider
src/lib/auth.ts                  — JWT auth helpers
src/lib/database.ts              — XP award functions
src/lib/prisma.ts                — Prisma client
prisma/schema.prisma             — Database schema
contracts/WiseryToken.sol        — ERC-20 contract
token-deploy/                    — Hardhat deployment
```

---

## Access Levels
| Feature | Email Only | Wallet Connected |
|---------|:----------:|:----------------:|
| View feed, questions | ✅ | ✅ |
| MIA AI analysis | ✅ | ✅ |
| Leaderboard | ✅ | ✅ |
| Comments | ✅ | ✅ |
| Vote / Predict | ✅ | ✅ |
| Create questions | ✅ | ✅ |
| Earn XP | ✅ | ✅ |
| Convert XP ↔ WSR | ✅ | ✅ |
| Deposit WSR from MetaMask | ❌ | ✅ |
| Withdraw WSR to MetaMask | ❌ | ✅ |

---

## Pending / Next Steps
- [x] On-chain WSR deposit: Transfer WSR from MetaMask → site (credit unclaimedWSR)
- [x] On-chain WSR withdrawal: Transfer WSR from site → MetaMask (on-chain transfer)
- [ ] Deploy v2 contract (Pausable, daily limits, batch rewards)
- [ ] Cron job: auto-distribute pending WSR claims on-chain
- [ ] Real-time voting (WebSocket/Supabase Realtime)
- [ ] Telegram bot integration
- [ ] Follow system / social features
- [ ] Referral system
- [ ] Mobile optimization

---

*Last updated: 2026-03-21*
