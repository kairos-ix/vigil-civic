# VIGIL — AI-Powered Hyperlocal Civic Issue Platform
## Complete Product Requirements Document (PRD)
### Vibe2Ship Hackathon Edition · Solo Developer · 5-Day Build

---

> **⚠️ Critical Reality Check Before You Read Further**
> This PRD covers both the 5-day hackathon MVP and a 2-year product vision. Do NOT confuse them.
> Sections marked 🔴 are hackathon-critical. Sections marked 🔵 are future roadmap.
> Building everything here in 5 days will result in nothing working well. Build less, but build it excellently.

---

## 1. Executive Summary

**Vigil** is an AI-powered, community-driven platform that enables citizens to report, verify, track, and resolve hyperlocal civic infrastructure issues — potholes, broken streetlights, water leakages, waste overflow — through a transparent, gamified, and genuinely agentic AI pipeline.

Unlike existing solutions that are siloed government portals with zero community engagement, Vigil creates a closed feedback loop: citizen reports → AI validation → community verification → authority notification → resolution tracking → civic impact scoring.

The core differentiator is the **Agentic Issue Pipeline** — a multi-step autonomous AI workflow (powered by Google Gemini 2.0 Flash) that classifies, deduplicates, prioritizes, and generates predictive infrastructure insights without human intervention at each step.

**Hackathon Target:** Score maximum on Agentic Depth (20%), Problem Solving & Impact (20%), and Innovation (20%) — the three highest-weighted criteria.

---

## 2. Problem Statement

### The Real Problem (Deeper Than the Brief Suggests)

The problem isn't just "reporting is fragmented." It's a **civic trust collapse**:

1. Citizens report issues and hear nothing → they stop reporting
2. No verification means false/duplicate reports flood systems
3. No transparency means authorities have no accountability
4. No community involvement means zero social proof that anyone cares
5. Existing platforms (like MyGov, FixMyStreet) are **authority-first**, not **citizen-first** → they feel like complaint boxes, not change agents

**The real problem:** Citizens don't believe reporting works, so they don't report, so issues don't get fixed, so citizens lose more trust. It's a trust death spiral.

**Vigil breaks this spiral** by making every report visible, every verification meaningful, and every resolution celebrated publicly.

---

## 3. Target Users & User Personas

### Persona 1: Arjun, The Frustrated Commuter (Primary)
- Age: 24–35 | Tier 2 city | Uses bike/two-wheeler
- Pain: Hits the same pothole daily, complained to municipality, nothing happened
- Goal: Wants his complaint to be heard AND acted on
- Behavior: Shares civic frustrations on WhatsApp groups
- What he needs: Quick reporting (under 60 seconds), visible proof that others also reported it, status updates

### Persona 2: Priya, The Community Organizer (Secondary)
- Age: 30–45 | RWA member, school parent
- Pain: Spends hours chasing municipal contacts with no result
- Goal: Wants neighborhood data to present to officials
- What she needs: Dashboard with area-level stats, downloadable reports, impact numbers

### Persona 3: Rahul, The Civic Tech Enthusiast (Engaged Power User)
- Age: 20–28 | Engineering student or early professional
- Pain: Wants to contribute to his community but doesn't know how
- Goal: Recognition for civic contributions, leaderboard status
- What he needs: Gamification, badges, points, public profile

### Persona 4 (Future): Municipal Officer
- Needs a verified, prioritized list of issues with community validation scores
- Not the hackathon target but crucial for long-term product viability

---

## 4. Market Gap & Competitor Analysis

| Platform | What It Does | Critical Weakness |
|---|---|---|
| MyGov India | Government portal for complaints | One-way, no community, no AI, no tracking |
| FixMyStreet (UK) | Report civic issues on map | No AI, no gamification, not India-focused |
| SeeClickFix (US) | Community + government reporting | US-only, no agentic AI pipeline |
| Swachhata App | Waste reporting only | Single-category, no community verification |
| Local WhatsApp Groups | Informal issue reporting | No tracking, no accountability, no data |

**The Gap Vigil Fills:**
No existing platform combines AI-powered classification + community verification + predictive infrastructure insights + gamified civic engagement in a single mobile-first experience for Indian cities.

---

## 5. Unique Value Proposition

> **"Report once. AI validates instantly. Community verifies together. City gets fixed."**

Three-layer differentiation:

1. **AI-first pipeline** — Gemini Vision instantly classifies what you photographed, auto-generates the report title and description, detects duplicates geographically, and assigns severity. Zero typing required.

2. **Community trust layer** — Reports need community upvotes to reach "Verified" status. This eliminates spam, creates social proof, and makes resolution more likely.

3. **Predictive Infrastructure Intelligence** — When 3+ similar issues cluster within 500m, Vigil auto-generates an "Infrastructure Alert" for that zone — a feature no competitor has.

---

## 6. Core Features — Hackathon MVP 🔴

**Rule: Build these 7 features excellently. Nothing else for the hackathon.**

### Feature 1: One-Tap Issue Reporting with AI Classification 🔴
- User opens app → clicks "Report Issue" → uploads or takes photo
- Gemini 2.0 Flash Vision analyzes image
- Auto-fills: Category, Severity, AI-generated description
- User pins location on Leaflet map (auto-detected via browser geolocation)
- One-click submit

### Feature 2: Agentic AI Pipeline 🔴
This is your highest-scoring feature. Must be multi-step and autonomous:
```
Step 1: Image → Gemini Vision → Category + Severity + Description
Step 2: Location check → Duplicate detection (same category, within 200m, last 7 days)
Step 3: If duplicate → Merge with existing report (upvote it instead)
Step 4: Priority Score calculation: (upvotes × 2) + (severity_weight) + (age_penalty)
Step 5: Zone clustering → If 3+ issues in 500m → Trigger Infrastructure Alert
```
Each step is autonomous. This is genuine agentic behavior, not just AI classification.

### Feature 3: Interactive Issue Map 🔴
- Leaflet.js + OpenStreetMap
- Color-coded markers by status (red = reported, yellow = verified, green = resolved)
- Marker clustering for dense areas
- Click marker → Issue card with details
- Filter by category, severity, status

### Feature 4: Community Verification System 🔴
- Any logged-in user can upvote ("I've seen this too") or verify ("I'm at this location and confirm")
- At 3 upvotes → status auto-changes to "Community Verified"
- Prevents spam without requiring any authority involvement
- Shows "X people confirmed this issue"

### Feature 5: Real-Time Issue Dashboard 🔴
- City-wide stats: Total reported, verified, resolved this month
- Category breakdown (donut chart via Recharts or Chart.js)
- Top issues this week by priority score
- Recent activity feed
- Infrastructure Alerts panel

### Feature 6: User Profile & Gamification 🔴
- Points for: reporting (+10), verifying (+5), issue resolved (+20)
- Civic Level: Newcomer → Reporter → Verifier → Guardian → Community Hero
- Badges: First Report, Verified 10 Issues, Resolved Issue, etc.
- Simple leaderboard (top 10 contributors this week)

### Feature 7: Issue Detail Page 🔴
- Photo, AI classification details, location on mini-map
- Status timeline (Reported → Verified → In Progress → Resolved)
- Comment section
- Upvote button
- Share button (WhatsApp deep link — critical for viral spread)

---

## 7. Advanced Features — Future Roadmap 🔵

*(Do NOT build these for the hackathon)*

- Authority dashboard for municipal officers
- SMS/WhatsApp notifications on status changes
- Offline-first PWA with sync
- Multi-language support (Hindi, Gujarati, etc.)
- Photo-less reporting (text + location only)
- Anonymous reporting option
- API for third-party integrations (municipal ERPs)
- AI-generated weekly civic health reports for neighborhoods
- Petition system (collect signatures for critical issues)
- Resolution photo verification (AI confirms fix by comparing before/after)

---

## 8. User Journey & User Flows

### Primary Flow: Reporting an Issue (Target: Under 90 seconds)
```
App Opens (Landing/Map view)
    ↓
"+" Button (prominent, floating)
    ↓
Camera/Gallery picker
    ↓
Image uploaded → Loading spinner ("AI is analyzing your photo...")
    ↓
AI Result displayed:
  Category: 🔴 Pothole | Severity: High
  Description: "Large pothole approximately 2ft wide on road surface..."
  [User can edit if wrong]
    ↓
Location: Auto-detected via GPS, shown on mini-map
  [User can drag pin to adjust]
    ↓
[Optional] Add note
    ↓
Submit → Confetti animation + "Issue #247 reported! +10 points"
    ↓
Issue appears on map immediately
```

### Secondary Flow: Verifying a Nearby Issue
```
Map view → See issue marker near location
    ↓
Click marker → Issue card popup
    ↓
"I've seen this" button (upvote) or "I'm here, confirm" (verification)
    ↓
If 3rd upvote → Status changes to Verified → User sees "Issue now Verified!" toast
    ↓
+5 points awarded
```

---

## 9. Information Architecture

```
Vigil App
├── 🗺️  Map (default landing for logged-in users)
│   ├── All Issues (filtered)
│   ├── Nearby Issues
│   └── Infrastructure Alerts overlay
├── 📊  Dashboard
│   ├── City Stats
│   ├── Category Breakdown
│   ├── Top Issues
│   └── Alerts
├── ➕  Report Issue (Floating Action Button)
├── 📋  Issues Feed (List view alternative to map)
│   └── Issue Detail Page
│       ├── Photos
│       ├── AI Analysis
│       ├── Timeline
│       └── Comments
├── 🏆  Leaderboard
└── 👤  Profile
    ├── My Reports
    ├── My Verifications
    ├── Points & Level
    └── Badges
```

---

## 10. UI/UX Principles

### Design Philosophy: "Civic Trust Aesthetics"
The app must feel **official but human**. Not cold government blue, not startup neon. Think: approachable authority.

### Core Principles
1. **Speed over completeness** — Map loads first, content loads progressively
2. **Proof over claims** — Show numbers ("847 issues resolved this month") not promises
3. **Celebration over shame** — Every action gets positive micro-feedback
4. **One primary action per screen** — No cognitive overload

### Color System
```
Primary:     #1D4ED8 (Trust Blue)
Success:     #16A34A (Resolved Green)
Warning:     #D97706 (Pending Amber)
Danger:      #DC2626 (Critical Red)
Background:  #F8FAFC (Near White)
Surface:     #FFFFFF
Text:        #0F172A (Near Black)
Muted:       #64748B
```

### Typography
- Headings: Inter (700) — authority
- Body: Inter (400/500) — readability
- Numbers/Stats: Tabular nums for dashboards

### Spacing System: 4px base unit (Tailwind defaults)

---

## 11. Landing Page Structure (Unauthenticated)

```
[HERO]
  Headline: "Your city has problems. Vigil fixes them."
  Subline: "Report issues in 60 seconds. AI validates. Community verifies. Cities respond."
  CTA: "Report an Issue" | "See Live Map"
  Background: Animated map showing real-time issue markers appearing

[SOCIAL PROOF BAR]
  "2,400+ issues reported | 680+ resolved | 12,000+ citizens engaged"
  (Use seed/demo data for hackathon)

[HOW IT WORKS - 3 STEPS]
  📸 Snap → 🤖 AI Validates → 👥 Community Verifies

[LIVE ISSUES FEED]
  Real scrolling feed of recent reports (shows the app is alive)

[IMPACT STATS]
  Animated counter cards

[CTA]
  "Join 12,000+ citizens making their city better"
```

---

## 12. Dashboard Structure 🔴

### Layout: Sidebar (desktop) | Bottom nav (mobile)

```
TOP ROW — 4 Stat Cards
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Total   │ │ Verified │ │ Resolved │ │ Active   │
│  Issues  │ │  Issues  │ │ This Mo. │ │ Alerts   │
│   247    │ │   156    │ │    89    │ │    3     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

MIDDLE ROW
┌─────────────────────┐ ┌──────────────────────┐
│  Issues by Category │ │  Resolution Timeline  │
│  (Donut Chart)      │ │  (Bar chart, 30 days) │
└─────────────────────┘ └──────────────────────┘

BOTTOM ROW
┌─────────────────────┐ ┌──────────────────────┐
│  🚨 Infrastructure  │ │  Top Issues This Week │
│  Alerts             │ │  (Priority sorted)    │
│  [Alert cards]      │ │  [Issue list]         │
└─────────────────────┘ └──────────────────────┘
```

---

## 13. Mobile Responsiveness Strategy

**Mobile-first architecture.** 70%+ of Indian civic app users are on mobile.

- Bottom navigation bar (5 icons): Map | Feed | Report | Dashboard | Profile
- Floating Action Button for "Report Issue" — always visible
- Map takes full viewport on mobile
- Cards are swipeable (touch-friendly 48px+ tap targets)
- Issue form is a bottom sheet, not a new page
- Images compressed client-side before upload (reduce Cloudinary bandwidth)
- PWA-ready: Add to Home Screen prompt after 3 reports

---

## 14. Gamification & Engagement Ideas

### Point System
| Action | Points |
|---|---|
| First-ever report | +25 (bonus) |
| Report an issue | +10 |
| Issue gets verified (you reported) | +15 |
| Issue gets resolved (you reported) | +25 |
| Verify/upvote an issue | +5 |
| Daily login streak (3+ days) | +5/day |

### Civic Levels
```
Newcomer     → 0–49 pts     (Grey badge)
Reporter     → 50–149 pts   (Blue badge)
Verifier     → 150–399 pts  (Green badge)
Guardian     → 400–999 pts  (Purple badge)
Community Hero → 1000+ pts  (Gold badge ⭐)
```

### Badges (10 for MVP)
- 🏁 First Step — Submit first report
- 👁️ Eagle Eye — Verify 10 issues
- 🔥 On Fire — 5 reports in one week
- 🌟 Community Star — Your report gets 10+ upvotes
- ✅ Problem Solver — Your reported issue gets resolved
- 📍 Local Legend — 25 reports in same ward
- 🤝 Verifier — Verify 25 issues
- 🏆 Top Contributor — #1 on weekly leaderboard
- 📊 Data Nerd — Open dashboard 10 times
- 🚀 Vigil Hero — 1000+ points

### Viral Hook
"Share this issue on WhatsApp" → Prefilled message with issue photo, description, and app link. This is the single most powerful growth mechanic for Indian markets.

---

## 15. AI Features 🔴

### Core: Gemini 2.0 Flash Vision — Issue Classification API

**Prompt Engineering (Critical for accuracy):**
```
System: You are an AI assistant for a civic issue reporting platform in India.
Analyze the provided image and return ONLY a JSON response.

User: Analyze this image and classify the civic issue.
Return JSON with:
{
  "category": "pothole|water_leakage|streetlight|waste|road_damage|drainage|other",
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "title": "Brief 5-8 word title",
  "description": "2-3 sentence description of the issue for authorities",
  "issuedDetected": true|false,
  "suggestedTags": ["tag1", "tag2"]
}

If no civic issue is visible, return issuedDetected: false.
```

### Agentic Pipeline Steps (All Autonomous):

**Step 1 — Vision Classification** (Gemini Flash, ~2s)
Image → Category + Severity + Auto-description

**Step 2 — Duplicate Detection** (MongoDB geospatial query)
```
db.issues.findOne({
  "location": { $near: { $geometry: point, $maxDistance: 200 } },
  "category": classifiedCategory,
  "status": { $ne: "resolved" },
  "createdAt": { $gte: sevenDaysAgo }
})
```
If found → Increment upvotes on existing issue instead of creating duplicate

**Step 3 — Priority Scoring** (Computed field, auto-updated)
```
priorityScore = (upvotes × 2) + severityWeight + max(0, 30 - daysSinceReport)
severityWeights = { low: 1, medium: 3, high: 7, critical: 15 }
```

**Step 4 — Cluster Analysis** (Infrastructure Alert trigger)
On every new issue creation:
```
const nearbyCount = await Issue.countDocuments({
  location: { $near: { geometry: point, maxDistance: 500 } },
  category: issue.category,
  status: { $ne: "resolved" },
  createdAt: { $gte: thirtyDaysAgo }
})
if (nearbyCount >= 3) → Create/update InfrastructureAlert for this zone
```

**Step 5 — AI Insights for Dashboard** (Gemini Text, daily batch or on-demand)
Send top 10 priority issues to Gemini → Get natural language insight:
*"The eastern ward shows a 40% spike in drainage issues this week, suggesting a systemic problem with the drainage network near the market area."*

---

## 16. Monetization Strategy 🔵

*(Post-hackathon. Not relevant for the build phase.)*

**Phase 1 (0–12 months): Free, build user base**

**Phase 2: B2G (Business to Government) — The real model**
- Monthly SaaS subscription to municipal corporations
- Verified issue reports + priority dashboard + resolution tracking = save 80% of their current manual complaint-handling cost
- Pricing: ₹15,000–₹50,000/month per municipality

**Phase 3: Data Intelligence**
- Infrastructure health reports for urban planners
- Anonymized trend data for NGOs, urban researchers

**What NOT to do:** Don't monetize with ads. Civic trust apps die the moment they feel commercial.

---

## 17. Growth & Viral Loops

### Primary Loop: WhatsApp Sharing
Report Issue → "Share on WhatsApp" → Friends see → Download app → Report more issues

### Secondary Loop: Ward-Level Competition
"Koramangala Ward reported 47 issues this week — #2 in Bangalore. Help your ward reach #1!"

### Tertiary Loop: Resolution Celebration
When an issue is resolved: Push notification + shareable card "Thanks to 12 Vigil users, this pothole was fixed in 8 days! 🎉"

---

## 18. Analytics & Success Metrics

### Hackathon Demo Metrics (Seed with realistic data)
- Total Issues Reported
- Verification Rate (% of reports that get 3+ upvotes)
- Resolution Rate
- Average Time to Resolution
- Active Users (DAU/WAU)
- Issues per Category (breakdown)

### North Star Metric (Post-hackathon)
**Issues Resolved per Month** — this is the only metric that proves the product works

---

## 19. Security & Privacy Considerations

### For Hackathon MVP
- Password hashing: bcrypt (saltRounds: 12)
- JWT tokens with 7-day expiry
- Rate limiting on report submission (max 10/hour per user)
- Image validation (MIME type check, max 5MB)
- MongoDB: Parameterized queries (Mongoose handles this)
- No PII in public-facing issue data (hide email, show only username)
- Location stored as GeoJSON Point (lat/lng only, not exact address)

### What NOT to Implement for Hackathon
- Complex OAuth flows
- End-to-end encryption
- GDPR compliance workflows
These will add days of work with zero judge value.

---

## 20. Complete Database Schema

```javascript
// models/Issue.ts
{
  _id: ObjectId,
  title: String (required, max: 100),
  description: String (required),
  category: {
    type: String,
    enum: ['pothole', 'water_leakage', 'streetlight', 'waste', 
           'road_damage', 'drainage', 'other'],
    required: true
  },
  images: [String], // Cloudinary URLs, max 3
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude] — GeoJSON standard
    address: String,
    ward: String,
    city: String
  },
  status: {
    type: String,
    enum: ['reported', 'community_verified', 'in_progress', 'resolved', 'rejected'],
    default: 'reported'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  reportedBy: { type: ObjectId, ref: 'User', required: true },
  upvotes: [{ type: ObjectId, ref: 'User' }],   // upvoteCount = upvotes.length
  verifiedBy: [{ type: ObjectId, ref: 'User' }],
  aiClassification: {
    category: String,
    severity: String,
    confidence: Number,
    rawDescription: String,
    isDuplicate: Boolean,
    duplicateOf: ObjectId
  },
  priorityScore: { type: Number, default: 0 },
  comments: [{
    user: { type: ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  resolvedAt: Date
}
// Index: location (2dsphere), status, category, priorityScore

// models/User.ts
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  passwordHash: String,
  avatar: String, // Cloudinary URL or DiceBear avatar URL
  points: { type: Number, default: 0 },
  level: {
    type: String,
    enum: ['newcomer', 'reporter', 'verifier', 'guardian', 'hero'],
    default: 'newcomer'
  },
  badges: [{
    name: String,
    earnedAt: Date,
    icon: String
  }],
  stats: {
    reportsSubmitted: { type: Number, default: 0 },
    issuesVerified: { type: Number, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    upvotesGiven: { type: Number, default: 0 }
  },
  ward: String,
  city: String,
  createdAt: { type: Date, default: Date.now },
  lastActive: Date
}

// models/InfrastructureAlert.ts
{
  _id: ObjectId,
  zone: {
    center: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    radiusMeters: Number
  },
  category: String,
  issueCount: Number,
  relatedIssues: [ObjectId],
  severity: String, // derived from highest severity issue in cluster
  status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
  aiInsight: String, // Gemini-generated insight text
  createdAt: Date,
  updatedAt: Date
}
```

---

## 21. API Architecture

```
BASE: /api

AUTH
  POST  /api/auth/register      → Create account
  POST  /api/auth/login         → JWT token
  GET   /api/auth/me            → Current user (from token)

ISSUES
  GET   /api/issues             → List (params: lat, lng, radius, category, status, page)
  POST  /api/issues             → Create issue (multipart/form-data with image)
  GET   /api/issues/:id         → Single issue details
  PATCH /api/issues/:id/upvote  → Toggle upvote (auth required)
  PATCH /api/issues/:id/verify  → Add to verifiedBy (auth required)
  PATCH /api/issues/:id/status  → Update status (admin only for hackathon)
  POST  /api/issues/:id/comment → Add comment (auth required)

AI
  POST  /api/ai/classify        → Classify image with Gemini Vision
                                   Body: { imageBase64: string }
                                   Returns: { category, severity, title, description, confidence }

DASHBOARD
  GET   /api/dashboard/stats    → Aggregated stats (total, by status, by category)
  GET   /api/dashboard/alerts   → Active infrastructure alerts
  GET   /api/dashboard/trending → Top 5 issues by priority score

USERS
  GET   /api/users/:id          → Public profile
  GET   /api/users/leaderboard  → Top 10 by points (weekly)
```

---

## 22. Folder Structure

```
vigil/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx              ← Sidebar + Bottomnav
│   │   ├── map/page.tsx            ← Main map view
│   │   ├── dashboard/page.tsx
│   │   ├── report/page.tsx         ← Report form (or bottom sheet)
│   │   ├── issues/
│   │   │   ├── page.tsx            ← Issue feed/list
│   │   │   └── [id]/page.tsx       ← Issue detail
│   │   ├── leaderboard/page.tsx
│   │   └── profile/
│   │       └── [id]/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── me/route.ts
│   │   ├── issues/
│   │   │   ├── route.ts            ← GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts        ← GET single
│   │   │       ├── upvote/route.ts
│   │   │       ├── verify/route.ts
│   │   │       ├── status/route.ts
│   │   │       └── comment/route.ts
│   │   ├── ai/
│   │   │   └── classify/route.ts
│   │   ├── dashboard/
│   │   │   ├── stats/route.ts
│   │   │   ├── alerts/route.ts
│   │   │   └── trending/route.ts
│   │   └── users/
│   │       ├── [id]/route.ts
│   │       └── leaderboard/route.ts
│   ├── layout.tsx
│   └── page.tsx                    ← Landing (unauthenticated)
│
├── components/
│   ├── ui/                         ← shadcn/ui components
│   ├── map/
│   │   ├── IssueMap.tsx            ← Leaflet wrapper (dynamic import, no SSR)
│   │   ├── IssueMarker.tsx
│   │   └── ClusterLayer.tsx
│   ├── issues/
│   │   ├── IssueCard.tsx
│   │   ├── ReportForm.tsx
│   │   ├── AIClassificationResult.tsx
│   │   ├── UpvoteButton.tsx
│   │   └── StatusTimeline.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── CategoryChart.tsx       ← Recharts donut
│   │   ├── TrendingIssues.tsx
│   │   └── AlertsPanel.tsx
│   ├── gamification/
│   │   ├── PointsBadge.tsx
│   │   ├── LevelBadge.tsx
│   │   └── Leaderboard.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── BottomNav.tsx           ← Mobile nav
│
├── lib/
│   ├── mongodb.ts                  ← Connection singleton
│   ├── gemini.ts                   ← Gemini API client
│   ├── cloudinary.ts               ← Upload helper
│   ├── auth.ts                     ← JWT utils
│   ├── scoring.ts                  ← Priority score calculator
│   └── constants.ts
│
├── models/
│   ├── Issue.ts
│   ├── User.ts
│   └── InfrastructureAlert.ts
│
├── hooks/
│   ├── useIssues.ts               ← SWR fetch hook
│   ├── useGeolocation.ts
│   └── useAuth.ts
│
├── types/
│   └── index.ts
│
├── public/
│   ├── icons/                     ← PWA icons
│   └── markers/                   ← Custom map markers (SVG)
│
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 23. Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER / MOBILE                           │
│                                                                 │
│  Next.js 14 (App Router)                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Map     │ │Dashboard │ │ Report   │ │  Profile/        │  │
│  │ (Leaflet)│ │(Recharts)│ │  Form    │ │  Leaderboard     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                    Tailwind CSS + shadcn/ui                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (REST API)
┌───────────────────────────▼─────────────────────────────────────┐
│                  NEXT.JS API ROUTES (Vercel)                    │
│                                                                 │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │  /api/issues│  │ /api/ai/      │  │ /api/dashboard/    │   │
│  │  CRUD +     │  │ classify      │  │ stats/alerts/      │   │
│  │  geospatial │  │ (Gemini call) │  │ trending           │   │
│  └──────┬──────┘  └───────┬───────┘  └──────────┬─────────┘   │
│         │                 │                       │             │
│  AGENTIC PIPELINE         │                       │             │
│  [Classify]→[Dedup]→      │                       │             │
│  [Score]→[Cluster]→       │                       │             │
│  [Alert]                  │                       │             │
└──────┬──────────────┬─────┘───────────────────────┘            │
       │              │
┌──────▼──────┐ ┌─────▼──────────────┐ ┌───────────────────────┐
│  MongoDB    │ │  Google Gemini     │ │  Cloudinary           │
│  Atlas      │ │  2.0 Flash         │ │  (Image Storage)      │
│  (Free M0)  │ │  (AI Studio API)   │ │  (Free 25GB)          │
│             │ │                    │ │                       │
│  Issues     │ │  Vision API        │ │  Issue Photos         │
│  Users      │ │  Text API          │ │  User Avatars         │
│  Alerts     │ │  (Free tier)       │ │                       │
└─────────────┘ └────────────────────┘ └───────────────────────┘
```

---

## 24. Best Free Tech Stack Choices

| Layer | Choice | Why | Free Tier |
|---|---|---|---|
| **Framework** | Next.js 14 (App Router) | You already know it (Rivolo), API routes eliminate separate backend, SSR for SEO | ✅ Free |
| **Styling** | Tailwind CSS + shadcn/ui | Fastest way to build premium UI, component-rich, no design skills needed | ✅ Free |
| **Database** | MongoDB Atlas M0 | You know Mongoose, geospatial queries built-in, 512MB sufficient for demo | ✅ Free |
| **AI** | Google Gemini 2.0 Flash | Required by hackathon, Vision API is excellent for image classification, generous free tier | ✅ Free |
| **Maps** | Leaflet.js + OpenStreetMap | No card needed, highly customizable, used in production apps, marker clustering available | ✅ Free |
| **Images** | Cloudinary | 25GB free, easy Next.js integration, auto-optimization, no card needed for basic use | ✅ Free |
| **Auth** | Custom JWT (jsonwebtoken + bcrypt) | Simpler than NextAuth for this use case, full control, no provider config needed | ✅ Free |
| **Charts** | Recharts | React-native charts, clean defaults, no config overhead | ✅ Free |
| **Animations** | Framer Motion | Smooth page transitions and micro-interactions, React-native | ✅ Free |
| **Deployment** | Vercel | Zero-config Next.js deployment, automatic CI/CD from GitHub | ✅ Free tier |

**⚠️ Critical Stack Decision:** Use Next.js API Routes instead of a separate Express server. For a hackathon, one deployment is infinitely simpler than two. You already have Rivolo using Express separately — don't repeat that complexity here.

---

## 25. Hosting & Deployment Plan

### For Hackathon Submission
```
Frontend + API Routes: Vercel (free)
  → Connect GitHub repo → Auto-deploy on push
  → Custom domain optional (vigil-app.vercel.app works fine)

Database: MongoDB Atlas M0 (free)
  → Whitelist 0.0.0.0/0 for Vercel's dynamic IPs
  → Add connection string to Vercel env vars

Images: Cloudinary free tier
  → CLOUDINARY_URL env var in Vercel

AI: Google AI Studio API Key
  → GEMINI_API_KEY env var in Vercel

Maps: Leaflet + OpenStreetMap
  → No API key, no deployment config, just works
```

### Google AI Studio "Deployment" Requirement
Build your app USING Gemini API from Google AI Studio. The submission asks for a deployed application that uses Google AI Studio — your Vercel deployment powered by Gemini API qualifies. Get your API key from ai.google.dev (free, no card needed).

---

## 26. Cost Breakdown

### Hackathon MVP (5 days): ₹0
| Service | Cost |
|---|---|
| Vercel | ₹0 |
| MongoDB Atlas M0 | ₹0 |
| Cloudinary (25GB) | ₹0 |
| Google Gemini API (free tier) | ₹0 |
| Leaflet + OpenStreetMap | ₹0 |
| Domain (optional) | ₹0 (use .vercel.app) |
| **TOTAL** | **₹0** |

### Scale (1,000 daily users): ~₹3,000–5,000/month
| Service | Cost |
|---|---|
| Vercel Pro | ~₹1,600/mo |
| MongoDB Atlas M2 | ~₹700/mo |
| Cloudinary Starter | ~₹1,600/mo |
| Gemini API (pay-per-use) | ~₹500–1,000/mo |
| **TOTAL** | **~₹4,400–5,000/month** |

---

## 27. Development Timeline (5 Days, Realistic)

### Day 1 — Foundation (June 24) ← TODAY
**Target: Skeleton works, auth functional**
- [ ] `npx create-next-app vigil --typescript --tailwind`
- [ ] Install: mongoose, cloudinary, @google/generative-ai, jsonwebtoken, bcrypt, recharts, leaflet, react-leaflet, framer-motion, shadcn/ui
- [ ] MongoDB Atlas setup + models (Issue, User, Alert)
- [ ] Auth API routes (register, login, me)
- [ ] Login/Register pages
- [ ] Basic app layout (sidebar desktop, bottom nav mobile)

### Day 2 — Core AI + Reporting (June 25)
**Target: Report an issue with AI classification**
- [ ] Gemini Vision API integration (`/api/ai/classify`)
- [ ] Image upload to Cloudinary
- [ ] Report form with AI result display
- [ ] Agentic pipeline: Classify → Dedup → Score → Alert
- [ ] Issue creation API (`POST /api/issues`)

### Day 3 — Map + Community (June 26)
**Target: Map shows issues, users can interact**
- [ ] Leaflet map with issue markers (color-coded by status)
- [ ] Marker clustering (`leaflet.markercluster`)
- [ ] Issue detail page (photo, AI analysis, timeline, comments)
- [ ] Upvote + Verify functionality
- [ ] Auto-status change to "community_verified" at 3 upvotes
- [ ] Infrastructure Alert creation trigger

### Day 4 — Dashboard + Gamification (June 27)
**Target: Dashboard impresses judges, users have profiles**
- [ ] Dashboard stats API + UI
- [ ] Category donut chart (Recharts)
- [ ] Infrastructure Alerts panel
- [ ] User profile page (points, level, badges)
- [ ] Leaderboard (top 10)
- [ ] Seed database with 20–30 realistic demo issues

### Day 5 — Polish + Deployment (June 28)
**Target: Submission-ready, impressive demo**
- [ ] Landing page (for unauthenticated users)
- [ ] Mobile responsiveness pass
- [ ] Loading states + error handling
- [ ] Smooth animations (Framer Motion page transitions)
- [ ] Deploy to Vercel
- [ ] Test full user flow end-to-end
- [ ] Record demo video
- [ ] Write Google Doc project description

### June 29 (Morning)
- [ ] Final bug fixes
- [ ] Submit by 2:00 PM ← Hard deadline

---

## 28. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limits | Medium | High | Cache classification results, batch requests, show fallback manual form |
| Leaflet SSR issues in Next.js | High | Medium | Use `dynamic(() => import('./IssueMap'), { ssr: false })` — non-negotiable |
| MongoDB geospatial queries fail | Low | High | Test 2dsphere index creation first, on Day 1 |
| Cloudinary free tier exhausted | Low | Medium | Compress images client-side before upload (use `browser-image-compression`) |
| Time runs out on Day 5 | High | High | Don't start polish/animations until core features work. Judges care about function first. |
| Overbuilding on Day 1-2 | High | High | Stick to the timeline. No feature creep. |

---

## 29. What Would Impress Hackathon Judges?

**Based on the evaluation matrix, ranked by impact:**

1. **Demo the full agentic pipeline live** (highest impact) — Upload an actual photo of a real road issue during the demo. Show Gemini classifying it in real time, the duplicate check firing, and the priority score calculating. This is what "Agentic Depth" means to judges.

2. **Show a before/after Infrastructure Alert** — Pre-seed 2 issues in the same area, report a 3rd during the demo, and show the alert generating automatically. This is genuinely novel.

3. **Dashboard with real-looking data** — Seed 30–50 realistic issues before your demo. An empty dashboard kills credibility. Categories, resolved issues, trends — make it look alive.

4. **Mobile demo on your phone** — Open your phone, show the map, report an issue standing in front of judges. The 60-second report flow is your killer demo moment.

5. **Community verification working** — Log in as two different accounts and show an issue getting auto-verified after the 3rd upvote. Shows the system actually functions.

6. **Clean, professional UI** — Judges judge books by covers. shadcn/ui + Tailwind defaults look premium. Don't use Bootstrap or raw CSS.

---

## 30. What Would Make Users Come Back Daily?

1. **"Near You" feed on app open** — Show issues within 500m. Relevance drives retention.
2. **Daily points streak** — +5 points for logging in daily. Simple but sticky.
3. **"Your issue got verified!" notification** — The moment someone validates your report, you get immediate positive reinforcement.
4. **Ward leaderboard** — "Your ward is #3 this week in Ahmedabad" — local pride is underestimated.
5. **Issue resolved celebrations** — When your reported issue gets resolved, a small confetti animation + "You helped fix this!" message.

---

## 31. What Features Should Be Avoided?

**Cut these even if they seem good:**

| Feature | Why to Avoid |
|---|---|
| SMS/Email notifications | Requires third-party service + setup time + cost. Use browser notifications if at all. |
| Authority portal | Doubles scope. You have 5 days. Focus on citizen side. |
| Photo-less reporting | Degrades AI pipeline quality. Photos are mandatory. |
| Complex filtering UI | Users want simple: "Show issues near me." Multiple filter panels add confusion. |
| Dark mode | Adds 0 judge value and takes hours to implement properly. |
| Multi-language | Out of scope. English-first for the hackathon. |
| In-app camera | Use native `<input type="file" accept="image/*" capture="environment">`. Same UX, zero code. |
| PWA offline mode | Service workers are complex. Skip for hackathon. |
| Social login (Google OAuth) | Custom JWT auth is faster to build and sufficient. |
| Admin panel | Judges don't evaluate admin tools. Focus on citizen UX. |

---

## 32. Future Vision (1–3 Years)

**Year 1: Prove the model**
- Launch in 2–3 Indian cities
- Partner with 1 progressive municipal corporation
- 10,000 monthly active reporters
- 60%+ resolution rate for "Community Verified" issues
- Mobile apps (React Native, same codebase via Expo)

**Year 2: Scale the network**
- Municipal SaaS subscription (₹15,000–50,000/month per city)
- AI-powered resolution time prediction
- Integration with government 311 systems
- 25 cities, ₹1Cr ARR

**Year 3: Civic Data Platform**
- Anonymous infrastructure health data for urban planners
- Predictive maintenance recommendations for municipalities
- International expansion (SEA cities with similar infrastructure challenges)
- Impact: ₹500Cr+ in avoided infrastructure damage through early detection

---

## 33. Recommended Modern UI Style

**Design Language: "Civic Premium"**

Think: trusted fintech app meets civic utility. Clean, data-dense but not overwhelming, blue-dominant, high information density on desktop but simple on mobile.

**Reference aesthetic:** Razorpay Dashboard × Linear App × Indian government (but actually good)

### Animations & Micro-interactions
```
Page transitions: Framer Motion fade+slide (duration: 0.2s)
Map markers: Spring animation on appear
Issue card hover: Subtle shadow lift (translateY: -2px)
Upvote button: Heart-like bounce on click
Points earned: Floating number (+10!) that rises and fades
Status badge: Smooth color transition between states
Chart bars: Animate on mount (duration: 0.8s, easing: ease-out)
Loading skeleton: Shimmer effect on cards
Form submit: Button loading state with spinner
```

### Accessibility
- Minimum 4.5:1 contrast ratio on all text
- 48px minimum tap targets on mobile
- `aria-label` on all icon-only buttons
- Keyboard navigation for map (Tab to cycle markers)
- `alt` text on all issue images
- Error messages connected to form fields via `aria-describedby`

### Premium Feel on Zero Budget
- Use DiceBear avatars (free, algorithmic, unique per user)
- Subtle gradient on hero section (CSS only)
- Custom SVG map markers (category-specific icons)
- Recharts with custom colors matching your palette
- shadcn/ui cards with subtle border + shadow
- Inter font (Google Fonts, free, premium feel)
- Consistent 8px border-radius on all cards

---

## 34. Product Names — 20 Options

| # | Name | Why It Works |
|---|---|---|
| 1 | **Vigil** | Watchfulness + community vigilance. Short, powerful, global. |
| 2 | **CivicLoop** | Perfectly describes the feedback loop the app creates. |
| 3 | **PatchWork** | Double meaning: patching roads + community patchwork quilt. |
| 4 | **StreetPulse** | Pulse = real-time + alive. Street = hyperlocal. |
| 5 | **Mendly** | Mend + friendly suffix. Action-oriented, approachable. |
| 6 | **FixGrid** | Fix + urban grid. Clear, technical, brandable. |
| 7 | **NearFix** | Geo-focused. "Fix what's near you." |
| 8 | **GridGuard** | Protecting urban infrastructure. |
| 9 | **WardWatch** | Ward = Indian administrative unit. Watch = vigilance. |
| 10 | **Upkeep** | Civic maintenance. Single word, clean. |
| 11 | **Flagr** | Flag issues. Short, memorable, startup-style. |
| 12 | **UrbanEye** | Urban observation. Simple. |
| 13 | **Proxima** | Latin for "nearby." Premium feel, short. |
| 14 | **Lokaal** | "Local" in Dutch. Unique spelling, easy to say. |
| 15 | **CivAlert** | Civic + Alert. Functional, clear. |
| 16 | **Civvy** | Civic + playful suffix. Friendly and accessible. |
| 17 | **Pinpoint** | Pinning issues on a map. Precision implied. |
| 18 | **Mend** | Clean single word. "Mend your city." |
| 19 | **ReportCard** | Dual meaning: report issues + civic report card. |
| 20 | **ZoneFix** | Zone-level fixing. Geographic focus. |

### Top 5 Ranked

| Rank | Name | Why It Wins |
|---|---|---|
| 🥇 #1 | **Vigil** | Most powerful. One word, zero explanation needed. "Stay vigilant about your city." Low domain competition. vigil.app likely available. Strong brand potential. |
| 🥈 #2 | **CivicLoop** | Technically perfect name — it literally describes the product's core mechanism. Good for B2G sales. |
| 🥉 #3 | **PatchWork** | Most creative. The road-patching + community-quilt double meaning is genuinely clever. Memorable. |
| 4th | **StreetPulse** | Most evocative. "Pulse" implies real-time, alive, responsive. Good for consumer brand. |
| 5th | **Mendly** | Most approachable. Feels like a consumer app. Best for non-tech users. |

### 🏆 Final Recommendation: **VIGIL**

**Vigil** wins because:
- One syllable. Zero explanation. Instant recall.
- Works in every Indian language context
- "Community Vigil" is a phrase people already understand
- Strong visual identity potential (eye icon, shield icon)
- Not taken by major apps (search: vigil.in, vigil.app)
- Judges will remember it. Users will tell friends about it.
- Scales from hackathon project to real product without needing a rename

---

## Appendix: Hackathon Submission Checklist

**Must submit by June 29, 2:00 PM via BlockseBlock:**

- [ ] Deployed app link (Vercel URL)
- [ ] GitHub repository (public, clean README)
- [ ] Google Doc with: Problem Statement, Solution Overview, Key Features, Technologies Used, Google Technologies Utilized
- [ ] App accessible and functional during evaluation period

**Google Doc Template:**
```
Problem Statement Selected: Community Hero — Hyperlocal Problem Solver

Solution Overview:
Vigil is an AI-powered civic platform that enables citizens to report, 
verify, and track infrastructure issues through a 5-step agentic AI pipeline 
powered by Google Gemini 2.0 Flash.

Key Features:
1. AI-powered issue classification (Gemini Vision)
2. Autonomous agentic pipeline (classify → dedup → score → cluster → alert)
3. Community verification system
4. Infrastructure Alert generation
5. Gamified civic engagement

Technologies Used:
Next.js 14, MongoDB Atlas, Leaflet.js, OpenStreetMap, Cloudinary,
Recharts, Framer Motion, Tailwind CSS, shadcn/ui

Google Technologies Utilized:
- Google Gemini 2.0 Flash (image classification, text generation)
- Google AI Studio (API access and development)
- Google Fonts (Inter)
```

---

*PRD Version: 1.0 | Created: June 24, 2026 | Hackathon: Vibe2Ship by Coding Ninjas × Google for Developers*
