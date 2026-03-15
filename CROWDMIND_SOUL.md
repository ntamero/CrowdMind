# CROWDMIND AI - Project Soul & Progress Tracker

## Project Identity
- **Name:** CrowdMind AI
- **Vision:** Global AI-powered collective intelligence platform (Reddit + Twitter + Polymarket + Facebook + AI fusion)
- **GitHub:** https://github.com/ntamero/CrowdMind
- **Live URL:** https://crowd-mind-rho.vercel.app/
- **Owner:** TAMER

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI Library | Shadcn/UI v4 (@base-ui/react, NOT radix) |
| Animations | Framer Motion (stagger, spring, AnimatePresence) |
| Styling | Tailwind CSS v4 (dark theme default) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google/GitHub OAuth) |
| AI Providers | Groq -> OpenRouter -> Claude (multi-provider fallback) |
| Deploy | Vercel (GitHub auto-deploy) |
| Web3 (planned) | Base chain (Coinbase L2) |

---

## Core Features & Status

### Completed Features
| Feature | Status | Description |
|---------|--------|-------------|
| Homepage | DONE | 3-column grid, featured markets carousel, category pills, sort tabs, live activity feed, quick stats |
| Predictions Page | DONE | 3-column grid, countdown timers, probability overlays, sparklines, betting-style options |
| QuestionCard Component | DONE | Compact vertical card: image top, probability overlay, sparkline, vote buttons, progress bars, earn indicator |
| SparklineChart | DONE | SVG sparkline with gradient fill and pulsing glow |
| MiniDonutChart | DONE | SVG donut ring with CSS animation |
| Featured Markets | DONE | Horizontal scrollable carousel (6 markets with images, YES%, sparklines) |
| Category System | DONE | 10 categories with emoji + color glow |
| AI Analysis Page | DONE | AI insights and analysis reports |
| Leaderboard | DONE | Top predictors ranking |
| Profile Page | DONE | User stats, achievements, recent questions |
| Settings Page | DONE | User settings |
| Pricing Page | DONE | Free/Pro/Premium cards with FAQ (visual only, not yet functional) |
| Auth System | DONE | Supabase Auth with Google/GitHub OAuth |
| Navbar | DONE | Logo, search, nav links, user dropdown, mobile menu |
| Sidebar | DONE | Menu links, topics, live stats |
| Question Detail | DONE | Dynamic route /questions/[id] |
| Ask Page | DONE | Question creation form |
| Member Dashboard | DONE | /dashboard - Overview, My Questions, Create Question, Earnings, Wallet tabs |
| Notification System | DONE | NotificationDropdown component |
| Share Modal | DONE | Social sharing for questions |
| Mock Data | DONE | Full mock data with Unsplash images, trend data, volumes |

### In Progress
| Feature | Status | Description |
|---------|--------|-------------|
| Admin Panel Rebuild | IN PROGRESS | Full expansion: categories CRUD, revenue/visitor/earnings/wallet tracking, options, trading, mail system |
| Navigation Update | PENDING | Add Dashboard link to Sidebar & Navbar |
| Pricing Functional | PENDING | Make Free/Pro/Premium selection work |

### Planned (Future)
| Feature | Status | Description |
|---------|--------|-------------|
| MetaMask/Web3 Wallet | PLANNED | Base chain integration (last stage, after site is fully active) |
| Real-time Voting | PLANNED | WebSocket-based live updates |
| Referral System | PLANNED | Invite friends, earn rewards |
| Mobile App | PLANNED | Flutter-based mobile application |
| API | PLANNED | Public API for developers |

---

## File Structure (Key Files)

```
src/
├── app/
│   ├── page.tsx                    # Homepage (3-col grid, featured markets)
│   ├── layout.tsx                  # Root layout
│   ├── admin/page.tsx              # Admin panel
│   ├── ai-analysis/page.tsx        # AI analysis page
│   ├── ask/page.tsx                # Create question
│   ├── auth/page.tsx               # Auth page
│   ├── auth/callback/route.ts      # OAuth callback
│   ├── dashboard/page.tsx          # Member dashboard (NEW)
│   ├── leaderboard/page.tsx        # Leaderboard
│   ├── predictions/page.tsx        # Predictions (3-col grid)
│   ├── pricing/page.tsx            # Pricing plans
│   ├── profile/page.tsx            # User profile
│   ├── questions/[id]/page.tsx     # Question detail
│   ├── settings/page.tsx           # Settings
│   └── api/                        # API routes (ai, questions, predictions, votes, comments, users)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Top navigation
│   │   └── Sidebar.tsx             # Left sidebar
│   ├── questions/
│   │   └── QuestionCard.tsx        # Compact vertical question card
│   ├── shared/
│   │   ├── SparklineChart.tsx      # SVG sparkline
│   │   ├── MiniDonutChart.tsx      # SVG donut
│   │   ├── ShareModal.tsx          # Share dialog
│   │   ├── StatsBar.tsx            # Stats display
│   │   └── NotificationDropdown.tsx # Notifications
│   └── ui/                         # Shadcn/UI components (14 files)
├── lib/
│   ├── mock-data.ts                # All mock data
│   ├── utils.ts                    # Utilities
│   ├── database.ts                 # DB queries
│   ├── ai-providers.ts             # AI integration
│   └── supabase/                   # Supabase client/server/middleware/auth
├── types/index.ts                  # TypeScript types
├── hooks/                          # (empty, for future)
├── context/                        # (empty, for future)
└── middleware.ts                    # Session management
```

---

## Design Principles
- **Images:** Unsplash photos matching each topic (not random)
- **Layout:** 3-column grid for cards (sm:2, lg:3)
- **Cards:** Compact vertical: image top (130px), probability overlay, sparkline, vote options with progress bars
- **Colors:** Dark theme, indigo/purple/cyan accent palette
- **Typography:** Font-black headings, tight tracking
- **Animations:** Framer Motion stagger entries, spring transitions
- **Data Display:** SparklineCharts, progress bars, percentage badges, countdown timers
- **Earn Indicator:** Every card shows "Earn" with DollarSign icon
- **Full-width:** No max-width constraints on content area

---

## Important Notes
- Shadcn/UI v4 uses @base-ui/react — `asChild` NOT supported
- Framer Motion ease arrays need `as const` to fix TypeScript errors
- Using `<img>` tags (not Next Image) for Unsplash URLs reliability
- next.config.ts has remotePatterns for picsum.photos, images.unsplash.com
- Categories are manageable from admin panel (planned)
- Users earn money from their questions — unique differentiator
- Questions are time-limited with countdown timers
- System supports ALL types of questions (personal, general, everything)

---

## Admin Panel Requirements (Detailed)
1. **Kategori CRUD** — Add/edit/delete categories from admin
2. **Reklam Yonetimi** — Ad management system
3. **Gelir Takibi** — Revenue tracking dashboard
4. **Ziyaretci Takibi** — Visitor analytics
5. **Kazanc Takibi** — Platform earnings tracking
6. **Uye Kazanc Takibi** — Member individual earnings
7. **Cuzdan Takibi** — Wallet tracking for all users
8. **Opsiyon Sistemler** — Options/betting system management
9. **Trading Takibi** — Trading activity monitoring
10. **Sure Takibi** — Time/duration tracking for questions
11. **Mail Sistemi** — Email notification system
12. **Wallet Sistemi** — Individual wallet per user

---

## Member Dashboard Features (/dashboard)
1. **Overview** — Quick stats (earned, balance, questions, accuracy), recent questions, earnings summary, recent transactions
2. **My Questions** — 3-col grid of user's questions with edit/delete, status badges
3. **Create Question** — Full form: title, description, category, duration, options (2-6), earn info
4. **Earnings** — Daily/weekly/monthly/all-time, breakdown (questions/predictions/referrals), daily chart, top earning questions
5. **Wallet** — Balance card, pending earnings, withdraw button, Web3 connect, transaction history

---

## Pricing Packages
| Package | Price | Key Features |
|---------|-------|-------------|
| Free | $0 | 5 questions/day, basic voting, 3 predictions/week |
| Pro | $9.99/mo | Unlimited questions, full AI analysis, export data, 2x rewards |
| Premium/Enterprise | $49.99/mo | Everything in Pro + API access, white-label, custom analytics, 3x rewards |

---

## Commit History (Key)
1. `feat: complete visual revolution - Polymarket-quality UI overhaul` — Images, sparklines, featured markets
2. `fix: wider layout, relevant images, earning indicator` — Unsplash images, full-width, earn badges
3. `feat: 3-column predictions grid, countdown timers, compact cards` — Predictions redesign
4. `feat: convert homepage to 3-column grid with compact vertical cards` — Homepage 3-col
5. `feat: member dashboard with earnings, wallet, question creation` — Dashboard (next commit)

---

*Last updated: 2026-03-15*
