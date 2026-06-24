@AGENTS.md
# VIGIL — Build Prompt for Claude Opus 4.6

## FIRST ACTION (mandatory before any code)
1. Read package.json → list installed deps
2. List app/ folder structure
3. Check these exist: lib/utils.ts, components/ui/button.tsx, app/globals.css
4. List what EXISTS vs what NEEDS CREATION
5. Never overwrite existing correct files
6. Then build in EXACT phase order below

---

## PROJECT
Civic issue reporting platform. Citizens upload photos of potholes/leaks/waste → 5-step AI pipeline auto-classifies, deduplicates, scores, and clusters issues into infrastructure alerts.

Stack: Next.js 14 App Router + TypeScript + Tailwind v4 + shadcn Nova + MongoDB/Mongoose + Gemini 2.0 Flash + Cloudinary + Leaflet/OpenStreetMap + JWT (custom) + Recharts + Framer Motion + Sonner + Lucide

---

## ENV (already in .env.local)
MONGODB_URI=<set>

JWT_SECRET=<set>

GEMINI_API_KEY=<set>

CLOUDINARY_CLOUD_NAME=<set>

CLOUDINARY_API_KEY=<set>

CLOUDINARY_API_SECRET=<set>

NEXT_PUBLIC_APP_URL=http://localhost:3000

---

## HARD RULES
- NEVER use localStorage/sessionStorage → cookies only (httpOnly for token)
- NEVER import Leaflet at top level → dynamic import + ssr:false always
- NEVER use Google Maps API
- App Router only — no /pages directory
- No NextAuth — custom JWT only
- Gemini fail → fallback to manual input, never crash
- Every API route: try/catch + correct HTTP status codes
- Run `npm run build` at end to verify zero errors

---

## FOLDER STRUCTURE
app/

(auth)/login/page.tsx

(auth)/register/page.tsx

(main)/layout.tsx

(main)/map/page.tsx

(main)/dashboard/page.tsx

(main)/report/page.tsx

(main)/issues/page.tsx

(main)/issues/[id]/page.tsx

(main)/leaderboard/page.tsx

(main)/profile/[id]/page.tsx

api/

auth/register/route.ts

auth/login/route.ts

auth/me/route.ts

issues/route.ts

issues/[id]/route.ts

issues/[id]/upvote/route.ts

issues/[id]/verify/route.ts

issues/[id]/status/route.ts

issues/[id]/comment/route.ts

ai/classify/route.ts

upload/route.ts

dashboard/stats/route.ts

dashboard/alerts/route.ts

dashboard/trending/route.ts

users/[id]/route.ts

users/leaderboard/route.ts

seed/route.ts

layout.tsx

page.tsx

globals.css (DO NOT TOUCH)

components/

map/IssueMap.tsx        ← 'use client', all leaflet imports here only

map/MapWrapper.tsx      ← dynamic(() => import('./IssueMap'), {ssr:false})

map/IssueMarker.tsx

issues/IssueCard.tsx

issues/ReportForm.tsx

issues/AIClassificationResult.tsx

issues/UpvoteButton.tsx

issues/StatusTimeline.tsx

dashboard/StatsCard.tsx

dashboard/CategoryChart.tsx

dashboard/AlertsPanel.tsx

dashboard/TrendingIssues.tsx

gamification/LevelBadge.tsx

gamification/PointsBadge.tsx

gamification/Leaderboard.tsx

layout/Navbar.tsx

layout/Sidebar.tsx

layout/BottomNav.tsx

ui/ (DO NOT TOUCH — shadcn generated)

lib/

mongodb.ts    ← singleton pattern

auth.ts

gemini.ts

cloudinary.ts

scoring.ts

constants.ts

utils.ts (DO NOT TOUCH)

models/

User.ts

Issue.ts

InfrastructureAlert.ts

hooks/

useAuth.ts

useIssues.ts

useGeolocation.ts

types/index.ts

middleware.ts

---

## MODELS

### models/User.ts
```typescript
import mongoose, { Schema, Document } from 'mongoose'
export interface IUser extends Document {
  name: string; email: string; passwordHash: string; avatar?: string
  points: number; level: 'newcomer'|'reporter'|'verifier'|'guardian'|'hero'
  badges: Array<{name:string; earnedAt:Date; icon:string}>
  stats: {reportsSubmitted:number; issuesVerified:number; issuesResolved:number; upvotesGiven:number}
  ward?: string; city?: string; lastActive: Date
}
const UserSchema = new Schema<IUser>({
  name: {type:String, required:true, trim:true},
  email: {type:String, required:true, unique:true, lowercase:true},
  passwordHash: {type:String, required:true},
  avatar: String,
  points: {type:Number, default:0},
  level: {type:String, enum:['newcomer','reporter','verifier','guardian','hero'], default:'newcomer'},
  badges: [{name:String, earnedAt:{type:Date,default:Date.now}, icon:String}],
  stats: {
    reportsSubmitted:{type:Number,default:0}, issuesVerified:{type:Number,default:0},
    issuesResolved:{type:Number,default:0}, upvotesGiven:{type:Number,default:0}
  },
  ward: String, city: String,
  lastActive: {type:Date, default:Date.now}
}, {timestamps:true})
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

### models/Issue.ts
```typescript
import mongoose, { Schema, Document } from 'mongoose'
export interface IIssue extends Document {
  title:string; description:string; category:string; images:string[]
  location: {type:string; coordinates:number[]; address?:string; ward?:string; city?:string}
  status:string; severity:string
  reportedBy: mongoose.Types.ObjectId
  upvotes: mongoose.Types.ObjectId[]; verifiedBy: mongoose.Types.ObjectId[]
  aiClassification: {category?:string; severity?:string; confidence?:number; rawDescription?:string; isDuplicate?:boolean; duplicateOf?:mongoose.Types.ObjectId}
  priorityScore:number
  comments: Array<{user:mongoose.Types.ObjectId; text:string; createdAt:Date}>
  statusHistory: Array<{status:string; changedAt:Date}>
  resolvedAt?: Date
}
const IssueSchema = new Schema<IIssue>({
  title: {type:String, required:true, maxlength:100},
  description: {type:String, required:true},
  category: {type:String, enum:['pothole','water_leakage','streetlight','waste','road_damage','drainage','other'], required:true},
  images: [String],
  location: {type:{type:String,default:'Point'}, coordinates:{type:[Number],required:true}, address:String, ward:String, city:String},
  status: {type:String, enum:['reported','community_verified','in_progress','resolved','rejected'], default:'reported'},
  severity: {type:String, enum:['low','medium','high','critical'], required:true},
  reportedBy: {type:Schema.Types.ObjectId, ref:'User', required:true},
  upvotes: [{type:Schema.Types.ObjectId, ref:'User'}],
  verifiedBy: [{type:Schema.Types.ObjectId, ref:'User'}],
  aiClassification: {category:String, severity:String, confidence:Number, rawDescription:String, isDuplicate:Boolean, duplicateOf:Schema.Types.ObjectId},
  priorityScore: {type:Number, default:0},
  comments: [{user:{type:Schema.Types.ObjectId,ref:'User'}, text:String, createdAt:{type:Date,default:Date.now}}],
  statusHistory: [{status:String, changedAt:{type:Date,default:Date.now}}],
  resolvedAt: Date
}, {timestamps:true})
IssueSchema.index({location:'2dsphere'})
IssueSchema.index({status:1}); IssueSchema.index({category:1}); IssueSchema.index({priorityScore:-1})
export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema)
```

### models/InfrastructureAlert.ts
```typescript
import mongoose, { Schema, Document } from 'mongoose'
export interface IInfrastructureAlert extends Document {
  zone: {center:{type:string; coordinates:number[]}; radiusMeters:number}
  category:string; issueCount:number; relatedIssues:mongoose.Types.ObjectId[]
  severity:string; status:'active'|'acknowledged'|'resolved'; aiInsight?:string
}
const AlertSchema = new Schema<IInfrastructureAlert>({
  zone: {center:{type:{type:String,default:'Point'}, coordinates:[Number]}, radiusMeters:{type:Number,default:500}},
  category:String, issueCount:{type:Number,default:0},
  relatedIssues:[{type:Schema.Types.ObjectId,ref:'Issue'}],
  severity:String, status:{type:String,enum:['active','acknowledged','resolved'],default:'active'},
  aiInsight:String
}, {timestamps:true})
AlertSchema.index({'zone.center':'2dsphere'})
export default mongoose.models.InfrastructureAlert || mongoose.model<IInfrastructureAlert>('InfrastructureAlert', AlertSchema)
```

---

## LIB FILES

### lib/mongodb.ts — SINGLETON (critical, prevents connection leaks)
```typescript
import mongoose from 'mongoose'
const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI not defined')
interface Cache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var mongoose: Cache }
const cached: Cache = global.mongoose || { conn: null, promise: null }
if (!global.mongoose) global.mongoose = cached
export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) cached.promise = mongoose.connect(MONGODB_URI, {bufferCommands:false})
  cached.conn = await cached.promise
  return cached.conn
}
```

### lib/auth.ts
```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'
const SECRET = process.env.JWT_SECRET!
export const hashPassword = (p: string) => bcrypt.hash(p, 12)
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)
export const generateToken = (userId: string) => jwt.sign({userId}, SECRET, {expiresIn:'7d'})
export function verifyToken(token: string): {userId:string}|null {
  try { return jwt.verify(token, SECRET) as {userId:string} } catch { return null }
}
export function getTokenFromRequest(req: NextRequest): string|null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.substring(7)
  return req.cookies.get('vigil_token')?.value || null
}
export async function getUserIdFromRequest(req: NextRequest): Promise<string|null> {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)?.userId || null
}
```

### lib/gemini.ts
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const geminiFlash = genAI.getGenerativeModel({model:'gemini-2.0-flash-exp'})

export interface ClassificationResult {
  category:string; severity:string; confidence:number
  title:string; description:string; issueDetected:boolean; suggestedTags:string[]
}

export async function classifyIssueImage(imageBase64:string, mimeType='image/jpeg'): Promise<ClassificationResult> {
  const prompt = `Analyze this image for a civic issue reporting app in India.
Return ONLY valid JSON, no markdown, no backticks:
{"category":"pothole|water_leakage|streetlight|waste|road_damage|drainage|other","severity":"low|medium|high|critical","confidence":0.0-1.0,"title":"5-8 word title","description":"2-3 sentence description for authorities","issueDetected":true|false,"suggestedTags":["tag1","tag2"]}
If no civic issue visible: issueDetected:false, category:"other", severity:"low"`
  try {
    const result = await geminiFlash.generateContent([
      {text:prompt},
      {inlineData:{mimeType, data:imageBase64}}
    ])
    const text = result.response.text().trim().replace(/```json|```/g,'').trim()
    return JSON.parse(text)
  } catch {
    return {category:'other',severity:'low',confidence:0,title:'Civic Issue Reported',description:'Issue requires manual review.',issueDetected:true,suggestedTags:[]}
  }
}

export async function generateAreaInsight(category:string, count:number, area:string): Promise<string> {
  try {
    const result = await geminiFlash.generateContent(
      `You are a civic analyst. Write 1-2 sentences of actionable insight for municipal authorities about: ${count} ${category.replace('_',' ')} issues near ${area}. Plain text only.`
    )
    return result.response.text().trim()
  } catch {
    return `${count} ${category.replace('_',' ')} issues detected in this area. Immediate inspection recommended.`
  }
}
```

### lib/cloudinary.ts
```typescript
import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
export async function uploadImage(base64:string, folder='vigil/issues'): Promise<string> {
  const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
    folder,
    transformation:[{width:1200,height:900,crop:'limit'},{quality:'auto'},{format:'webp'}]
  })
  return result.secure_url
}
export default cloudinary
```

### lib/scoring.ts
```typescript
const SEVERITY_WEIGHTS: Record<string,number> = {low:1,medium:3,high:7,critical:15}
export function calculatePriorityScore(upvotes:number, severity:string, createdAt:Date): number {
  const daysSince = Math.floor((Date.now()-createdAt.getTime())/(86400000))
  return (upvotes*2) + (SEVERITY_WEIGHTS[severity]||1) + Math.max(0,30-daysSince)
}
export function calculateLevel(points:number): 'newcomer'|'reporter'|'verifier'|'guardian'|'hero' {
  if (points>=1000) return 'hero'
  if (points>=400) return 'guardian'
  if (points>=150) return 'verifier'
  if (points>=50) return 'reporter'
  return 'newcomer'
}
export function getNewBadges(stats:{reportsSubmitted:number;issuesVerified:number;issuesResolved:number}, existing:string[]) {
  const rules = [
    {name:'First Step',icon:'🏁',cond:stats.reportsSubmitted>=1},
    {name:'On Fire',icon:'🔥',cond:stats.reportsSubmitted>=5},
    {name:'Eagle Eye',icon:'👁️',cond:stats.issuesVerified>=10},
    {name:'Problem Solver',icon:'✅',cond:stats.issuesResolved>=1},
    {name:'Verifier',icon:'🤝',cond:stats.issuesVerified>=25},
    {name:'Vigil Hero',icon:'🚀',cond:stats.reportsSubmitted>=50&&stats.issuesVerified>=100},
  ]
  return rules.filter(r=>r.cond&&!existing.includes(r.name)).map(({name,icon})=>({name,icon}))
}
```

### lib/constants.ts
```typescript
export const CATEGORIES = [
  {value:'pothole',label:'Pothole',icon:'🕳️',color:'#DC2626'},
  {value:'water_leakage',label:'Water Leakage',icon:'💧',color:'#2563EB'},
  {value:'streetlight',label:'Broken Streetlight',icon:'💡',color:'#D97706'},
  {value:'waste',label:'Waste/Garbage',icon:'🗑️',color:'#16A34A'},
  {value:'road_damage',label:'Road Damage',icon:'🚧',color:'#9333EA'},
  {value:'drainage',label:'Drainage Issue',icon:'🌊',color:'#0891B2'},
  {value:'other',label:'Other',icon:'📍',color:'#6B7280'},
]
export const SEVERITY_COLORS = {low:'#16A34A',medium:'#D97706',high:'#EA580C',critical:'#DC2626'}
export const STATUS_CONFIG: Record<string,{label:string;color:string;bg:string}> = {
  reported:{label:'Reported',color:'#6B7280',bg:'#F3F4F6'},
  community_verified:{label:'Verified',color:'#2563EB',bg:'#EFF6FF'},
  in_progress:{label:'In Progress',color:'#D97706',bg:'#FFFBEB'},
  resolved:{label:'Resolved',color:'#16A34A',bg:'#F0FDF4'},
  rejected:{label:'Rejected',color:'#DC2626',bg:'#FEF2F2'},
}
export const POINTS = {REPORT:10,FIRST_BONUS:25,VERIFY:5,RESOLVE:25,UPVOTE:5}
export const VERIFICATION_THRESHOLD = 3
export const DUPLICATE_RADIUS_METERS = 200
export const DUPLICATE_DAYS = 7
export const CLUSTER_RADIUS_METERS = 500
export const CLUSTER_THRESHOLD = 3
```

---

## TYPES (types/index.ts)
```typescript
export interface User {
  _id:string; name:string; email:string; avatar?:string; points:number; level:string
  badges:Array<{name:string;earnedAt:string;icon:string}>
  stats:{reportsSubmitted:number;issuesVerified:number;issuesResolved:number;upvotesGiven:number}
  ward?:string; city?:string; createdAt:string
}
export interface Issue {
  _id:string; title:string; description:string; category:string; images:string[]
  location:{type:string;coordinates:[number,number];address?:string;ward?:string;city?:string}
  status:string; severity:string; reportedBy:User|string
  upvotes:string[]; verifiedBy:string[]
  aiClassification:{category?:string;severity?:string;confidence?:number;isDuplicate?:boolean}
  priorityScore:number
  comments:Array<{user:User|string;text:string;createdAt:string}>
  statusHistory:Array<{status:string;changedAt:string}>
  createdAt:string; updatedAt:string; resolvedAt?:string
}
export interface InfrastructureAlert {
  _id:string; zone:{center:{coordinates:[number,number]};radiusMeters:number}
  category:string; issueCount:number; relatedIssues:string[]
  severity:string; status:string; aiInsight?:string; createdAt:string
}
export interface DashboardStats {
  total:number; reported:number; community_verified:number
  in_progress:number; resolved:number; rejected:number
  byCategory:Record<string,number>; resolvedThisMonth:number; activeAlerts:number
}
```

---

## API ROUTES — IMPLEMENT ALL

### Auth
**POST /api/auth/register** — {name,email,password} → validate → hash → create user → jwt cookie → return {user,token}
**POST /api/auth/login** — {email,password} → verify → jwt httpOnly cookie → return {user,token}
**GET /api/auth/me** — auth required → return user (no passwordHash)

Set cookie on login/register:
```typescript
const response = NextResponse.json({user, token})
response.cookies.set('vigil_token', token, {httpOnly:true, secure:process.env.NODE_ENV==='production', maxAge:604800, path:'/'})
```

### Issues
**GET /api/issues** — params: lat,lng,radius,category,status,page(def 1),limit(def 20)
- If lat+lng: $nearSphere geospatial query
- Else: sort by priorityScore desc
- Populate reportedBy(name avatar level)
- Return {issues, total, page, pages}

**POST /api/issues** — auth required, FormData: image file + {title?,description?,category?,severity?,lat,lng,address?}
- Run full 5-step agentic pipeline (see below)
- Return {issue, isDuplicate}

**GET /api/issues/[id]** — populate reportedBy + comments.user(name avatar level)
**PATCH /api/issues/[id]/upvote** — auth → toggle upvote → recalculate priority → if upvotes.length>=3 set status=community_verified → +5pts to upvoter
**PATCH /api/issues/[id]/verify** — auth → user cannot verify own → push to verifiedBy → +5pts
**PATCH /api/issues/[id]/status** — auth → {status} → update + push statusHistory → if resolved: set resolvedAt + +25pts to reporter
**POST /api/issues/[id]/comment** — auth → {text} → push comment → return updated issue

### AI
**POST /api/ai/classify** — {imageBase64, mimeType?} → classifyIssueImage() → return result

### Upload
**POST /api/upload** — FormData with 'image' → convert to base64 → uploadImage() → return {url}

### Dashboard
**GET /api/dashboard/stats** — MongoDB aggregation: totals by status + by category + resolvedThisMonth + activeAlerts count
**GET /api/dashboard/alerts** — active InfrastructureAlerts sorted by issueCount desc, limit 10
**GET /api/dashboard/trending** — top 5 issues by priorityScore where status != resolved

### Users
**GET /api/users/[id]** — public profile (no email no passwordHash)
**GET /api/users/leaderboard** — top 10 by points desc

### Seed
**GET /api/seed** — only in development. Seed 25 realistic issues around Ahmedabad (23.0225, 72.5714), 5 demo users with points/badges, 3 infrastructure alerts. Return {message:'Seeded successfully'}

---

## 5-STEP AGENTIC PIPELINE (inside POST /api/issues)
```typescript
// STEP 1: Upload image to Cloudinary
const imageUrl = await uploadImage(imageBase64)

// STEP 2: AI Classification via Gemini
const classification = await classifyIssueImage(imageBase64)
const finalCategory = classification.issueDetected ? classification.category : (bodyCategory || 'other')
const finalSeverity = classification.issueDetected ? classification.severity : (bodySeverity || 'low')

// STEP 3: Duplicate Detection (same category, 200m radius, last 7 days, not resolved)
const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
const duplicate = await Issue.findOne({
  location: {$near:{$geometry:{type:'Point',coordinates:[lng,lat]},$maxDistance:200}},
  category: finalCategory,
  status: {$ne:'resolved'},
  createdAt: {$gte:sevenDaysAgo}
})
if (duplicate) {
  if (!duplicate.upvotes.includes(userId)) {
    duplicate.upvotes.push(userId)
    duplicate.priorityScore = calculatePriorityScore(duplicate.upvotes.length, duplicate.severity, duplicate.createdAt)
    await duplicate.save()
  }
  return NextResponse.json({issue:duplicate, isDuplicate:true})
}

// STEP 4: Create Issue with priority score
const issue = await Issue.create({
  title: classification.title || bodyTitle,
  description: classification.description || bodyDescription,
  category: finalCategory, severity: finalSeverity,
  images: [imageUrl],
  location: {type:'Point', coordinates:[lng,lat], address},
  reportedBy: userId,
  aiClassification: {...classification, isDuplicate:false},
  priorityScore: calculatePriorityScore(0, finalSeverity, new Date()),
  statusHistory: [{status:'reported', changedAt:new Date()}]
})

// STEP 5: Infrastructure Alert Check (3+ same category in 500m in last 30 days)
const thirtyDaysAgo = new Date(Date.now()-30*24*60*60*1000)
const nearbyCount = await Issue.countDocuments({
  location:{$near:{$geometry:{type:'Point',coordinates:[lng,lat]},$maxDistance:500}},
  category:finalCategory, status:{$ne:'resolved'}, createdAt:{$gte:thirtyDaysAgo}
})
if (nearbyCount >= 3) {
  const nearbyIssues = await Issue.find({
    location:{$near:{$geometry:{type:'Point',coordinates:[lng,lat]},$maxDistance:500}},
    category:finalCategory, status:{$ne:'resolved'}
  }).limit(10).select('_id')
  const aiInsight = await generateAreaInsight(finalCategory, nearbyCount, address||'this area')
  await InfrastructureAlert.findOneAndUpdate(
    {'zone.center.coordinates':{$near:{$geometry:{type:'Point',coordinates:[lng,lat]},$maxDistance:500}}, category:finalCategory, status:'active'},
    {issueCount:nearbyCount, relatedIssues:nearbyIssues.map(i=>i._id), aiInsight, severity:finalSeverity},
    {upsert:true, new:true}
  )
}

// Update user stats + points + level + badges
await User.findByIdAndUpdate(userId, {
  $inc:{'stats.reportsSubmitted':1, points:10},
  lastActive:new Date()
})
// Then fetch user, recalculate level, award new badges, save
```

---

## MIDDLEWARE (middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const PROTECTED = ['/map','/dashboard','/report','/issues','/leaderboard','/profile']
const AUTH_ONLY = ['/login','/register']
export function middleware(req: NextRequest) {
  const token = req.cookies.get('vigil_token')?.value
  const path = req.nextUrl.pathname
  if (PROTECTED.some(r=>path.startsWith(r)) && !token)
    return NextResponse.redirect(new URL('/login', req.url))
  if (AUTH_ONLY.some(r=>path.startsWith(r)) && token)
    return NextResponse.redirect(new URL('/dashboard', req.url))
  return NextResponse.next()
}
export const config = { matcher:['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
```

---

## HOOKS

### hooks/useAuth.ts
- 'use client'
- State: user (User|null), isLoading (bool)
- On mount: read vigil_token cookie → GET /api/auth/me → set user
- login(email,pwd): POST /api/auth/login → set user → router.push('/dashboard')
- register(name,email,pwd): POST /api/auth/register → set user → router.push('/dashboard')
- logout(): DELETE cookie (POST to /api/auth/logout or just clear cookie client-side) → set user null → router.push('/')
- Export: {user, isLoading, login, register, logout}

### hooks/useIssues.ts
- 'use client'
- fetch('/api/issues') with optional query params
- State: issues, loading, error
- Return {issues, loading, error, refetch}

### hooks/useGeolocation.ts
- 'use client'
- navigator.geolocation.getCurrentPosition wrapper
- Return {lat, lng, error, loading, getLocation}

---

## MAP COMPONENT (critical pattern)

```typescript
// components/map/MapWrapper.tsx
'use client'
import dynamic from 'next/dynamic'
const IssueMap = dynamic(() => import('./IssueMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-muted"><p className="text-muted-foreground">Loading map...</p></div>
})
export default IssueMap

// components/map/IssueMap.tsx — ALL leaflet code lives here only
'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})
// Props: issues[], center:[lat,lng], zoom:number, onMarkerClick?:(id)=>void
// Color-code markers by status using L.divIcon with inline SVG circles
```

---

## DESIGN SYSTEM
Primary:     #1D4ED8 (Trust Blue)

Success:     #16A34A

Warning:     #D97706

Danger:      #DC2626

Background:  #F8FAFC

Font:        Geist (shadcn Nova — already set)

Border-radius: 0.5rem cards, 0.75rem modals

**Layout:**
- Desktop: Fixed sidebar 240px + scrollable main
- Mobile: Bottom nav 5 tabs + FAB (blue +, fixed bottom-right) for report
- Map page: height calc(100vh - 64px)

**Component rules:**
- IssueCard: category icon + colored severity badge + upvote count + status chip + thumbnail
- Map markers: L.divIcon colored circles by status (gray=reported, blue=verified, amber=in_progress, green=resolved)
- Skeleton loaders (not spinners) for all async content
- Sonner toasts for all errors + success actions
- Framer Motion: page enter (opacity 0→1, y 10→0, 0.2s). Upvote button: scale(1.2) bounce on click.

---

## PAGES — WHAT EACH MUST DO

**app/page.tsx** — Landing (unauthenticated). Hero with CTA to register/login. Stats teaser (fetch /api/dashboard/stats, show 3 numbers). No map on landing.

**app/(auth)/login/page.tsx** — Email+password form. POST to /api/auth/login. Redirect to /dashboard.

**app/(auth)/register/page.tsx** — Name+email+password. POST to /api/auth/register. Redirect to /dashboard.

**app/(main)/layout.tsx** — Sidebar (desktop) + Navbar + BottomNav (mobile). Wrap children. Must check auth via useAuth, redirect if not logged in.

**app/(main)/dashboard/page.tsx** — 4 StatsCards + CategoryChart (Recharts donut) + AlertsPanel + TrendingIssues list.

**app/(main)/map/page.tsx** — Full-height map via MapWrapper (dynamic). Filter sidebar. Click marker → issue preview popover.

**app/(main)/report/page.tsx** — ReportForm: image upload → auto-classify via Gemini → show AIClassificationResult (editable) → location picker (mini Leaflet map, dynamic) + geolocation → submit.

**app/(main)/issues/page.tsx** — Grid of IssueCards with filter/sort controls.

**app/(main)/issues/[id]/page.tsx** — Full issue detail: images, AI classification badge, upvote/verify buttons, status timeline, comments.

**app/(main)/leaderboard/page.tsx** — Top 10 users from /api/users/leaderboard.

**app/(main)/profile/[id]/page.tsx** — User stats, badges, recent issues.

---

## PRODUCTION DEPLOY (Vercel)

1. Push to GitHub (public repo)
2. Vercel → New Project → Import → Framework: Next.js
3. Add ALL env vars from .env.local + set NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
4. Deploy
5. MongoDB Atlas → Network Access → Allow 0.0.0.0/0 (Vercel uses dynamic IPs)
6. After deploy: visit /api/seed to seed demo data
7. Run `npm run build` locally first to catch all errors before pushing

---

## BUILD ORDER (follow exactly, no skipping)

**Phase 1 — Foundation**
types/index.ts → lib/constants.ts → lib/mongodb.ts → lib/auth.ts → lib/gemini.ts → lib/cloudinary.ts → lib/scoring.ts → models/User.ts → models/Issue.ts → models/InfrastructureAlert.ts

**Phase 2 — API**
auth/register → auth/login → auth/me → upload → ai/classify → issues (GET+POST with full pipeline) → issues/[id] → issues/[id]/upvote → issues/[id]/verify → issues/[id]/status → issues/[id]/comment → dashboard/stats → dashboard/alerts → dashboard/trending → users/[id] → users/leaderboard → seed

**Phase 3 — Hooks + Middleware**
useAuth → useIssues → useGeolocation → middleware.ts

**Phase 4 — Layout**
Navbar → Sidebar → BottomNav → app/(main)/layout.tsx → app/layout.tsx (add Toaster from sonner)

**Phase 5 — Map**
IssueMap.tsx → MapWrapper.tsx → IssueMarker.tsx

**Phase 6 — Issue Components**
IssueCard → AIClassificationResult → UpvoteButton → StatusTimeline → ReportForm

**Phase 7 — Dashboard Components**
StatsCard → CategoryChart → AlertsPanel → TrendingIssues

**Phase 8 — Gamification**
LevelBadge → PointsBadge → Leaderboard

**Phase 9 — Pages**
app/page.tsx → login → register → map → dashboard → report → issues → issues/[id] → leaderboard → profile/[id]

**Phase 10 — Finish**
Fix all TypeScript errors → `npm run build` must pass with 0 errors → visit /api/seed → test full flow

---

## NEVER DO
- localStorage or sessionStorage
- Google Maps API
- Import Leaflet outside 'use client' file
- /pages directory
- Skip try/catch in any API route
- Commit .env.local
- Add features not listed here