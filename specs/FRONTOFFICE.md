# TONPALEARN · Frontoffice · Public Website

> **Modules:** `/` (landing) · `/chaiwat/` (profile) · `/demos/` (NEW — gallery)
> **Status:** Landing v2 + chaiwat live · Demos folder = new spec
> **Owner:** ต้น
> **Updated:** May 2026

---

## 1. Problem Statement

ลูกค้าใหม่เจอ TONPALEARN ครั้งแรก — ต้อง **WOW** ภายใน 10 วินาที ไม่งั้นปิด tab

ปัญหาปัจจุบัน:
- Landing เน้น text + course list — ดี แต่ "ไม่ WOW เพียงพอ"
- ลูกค้าไม่เห็นว่า AI Agentic ทำได้จริง — ฟังต้นพูดเฉยๆ ใน video
- ไม่มี artifact gallery — proof of work หายไปในการประชุม / proposal · ไม่เก็บไว้ที่ public ให้คนเห็น

**Cost of not solving:**
- Conversion rate ต่ำ (landing → LINE OA inquiry)
- Trust ไม่สูงพอสำหรับ corporate (เขาดู portfolio ก่อนตัดสินใจ)
- ลูกค้าเก่าไม่มี channel กลับมาดูผลงาน · ไม่ refer ออก

---

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | ทำให้ visitor "WOW" ภายใน 10 วินาที | First scroll + LINE click rate > 5% (baseline) |
| G2 | Show, don't tell — AI Agentic ทำได้อะไร · มี live mini-app เล่นได้ | Demo interaction count tracking |
| G3 | Showcase ผลงาน 20+ artifacts ในรูปแบบ visual gallery | Visitor stays > 2 min on /demos page |
| G4 | Corporate prospect สามารถ navigate ไป /services → proposal builder ได้ smooth | Click-through landing → services > 10% |
| G5 | Mobile-perfect (40% traffic from mobile) | Lighthouse mobile score > 85 |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Blog / content marketing platform | ใช้ Facebook + LINE OA สำหรับ content |
| Self-service course purchase | ขายผ่าน LINE consultation |
| Customer login / dashboard | Course content delivery ผ่าน Zoom ไม่ผ่านเว็บ |
| Real-time chat widget | LINE OA ทำหน้าที่นี้ |
| SEO advanced (multi-page blog) | TONPALEARN brand-first · ไม่ใช่ content-led |

---

## 4. User Personas

| Persona | Visiting from | Wants |
|---------|---------------|-------|
| **คนทั่วไปสนใจ AI** | FB ads / referral | ดูว่ามี course อะไร · ราคาเท่าไหร่ · เรียนยังไง |
| **HR / L&D corporate** | LinkedIn / referral | ดู portfolio · ดู instructor profile · เห็นว่าเคยทำอะไรให้บริษัทอื่น |
| **CEO / decision maker** | Referral / corporate intro | Trust signals · proof of expertise · scope ที่รับทำ |
| **Alumni / repeat customer** | Direct | ดู course ใหม่ · ดู artifact อัพเดท · refer ออก |

---

## 5. Pages & Modules

### 5.1 Landing — `/` (existing, refine)

**Current sections** (from SPEC.md):
- Nav + scroll progress
- Hero (AI terminal demo) + headline + CTA
- Stats strip + trust marquee
- Why Choose (bento)
- About (portrait)
- Process (4-step)
- Courses (12 × filter × format toggle)
- Discount strip
- Testimonials (marquee)
- FAQ
- CTA (3 channels)
- Footer

**Refinements (v2.1):**
- Hero: replace static "AI demo terminal" with **live mini-AI demo** (P0) — see /demos
- "Featured Demos" section between Process and Courses (NEW)
- "Recent Artifacts" carousel (NEW · pulls from /demos)
- Sticky LINE CTA bottom-right on mobile (P0)

### 5.2 Chaiwat Profile — `/chaiwat/` (existing, light refine)

**Current sections:**
- Nav · Hero · Stats · Quote · Journey · WhatIDo · Stack · Currently · Contact · Footer

**Refinements:**
- "Latest Work" section linking to /demos (P0)
- Inline mini-demo: "ลองคุยกับ AI ของผม" (P1)

### 5.3 Demos / Artifact Gallery — `/demos/` (NEW · this spec's focus)

**Purpose:** Single page that showcases TONPALEARN's AI Agentic work — **both live mini-apps to play with AND visual artifact grid for browsing**.

**Layout:**
```
Hero
  "ดู AI Agentic ที่เราสร้าง — เล่นได้เลย ไม่ต้อง install"
  CTA: ลองเล่น

Section A: Live Mini-Apps (3-5 embed)
  Grid 2-col on desktop · stacked mobile
  Each card:
    - Title + 1-line description
    - Live embed (iframe sandboxed OR direct widget)
    - "ที่ต้นใช้สร้าง" tag (Claude + MCP + Supabase)
    - "ดู Code / ฟังเรื่อง" link (Github / blog)

Section B: Artifact Gallery (20+ images)
  Masonry grid · lightbox on click
  Filter chips: All · Dashboard · Slide · Infographic · Landing · App · Agent
  Each artifact:
    - Cover image
    - Title
    - Industry / use case tag
    - Tools used (Claude · Cursor · n8n · Supabase · ฯลฯ)

Section C: Process Timeline
  "จาก idea → artifact ใน 1 วัน"
  Step-by-step ของ workflow จริง (3-4 steps with screenshots)

CTA at bottom
  "อยากให้สร้างของแบบนี้ให้บริษัทคุณบ้าง?" → /services
```

#### 5.3.1 Live Mini-Apps Requirements (P0)

Pick 3-5 demos based on **highest WOW + safe to embed publicly**:

| Demo idea | Embed Type | Risk | Priority |
|-----------|-----------|------|----------|
| **Mini chatbot** "ถาม AI เกี่ยวกับ TONPALEARN" (RAG with knowledge base) | iframe · Claude API (rate-limited) | Cost (API calls), prompt injection | P0 |
| **Course recommender** — answer 3 questions → get course suggestion | Inline React widget (rule-based + Claude) | Low | P0 |
| **PDF Quote generator (sample)** — fill form → see live PDF preview | Inline iframe to `/quotation` in read-only sample mode | None — already exists | P0 |
| **AI-generated landing page** — pick industry → AI generates landing in 30 sec | Inline · LLM streaming | Higher cost · cool factor | P1 |
| **Live brand identity generator** — enter business name → generates logo + color palette | Inline · Claude vision + DALL-E (if budget) | Cost | P2 |

**Safety:**
- All demos have rate-limiting (per-IP, per-day)
- Prompt injection mitigation: sanitize user input · scoped system prompt
- Free-tier first: Claude haiku · max 5 calls/day per IP

#### 5.3.2 Artifact Gallery Requirements (P0)

Sources of artifacts:
- Past corporate work (anonymized)
- Personal projects (slide decks, dashboards, agents built for ต้นเอง)
- TONPALEARN courses (cover images, sample outputs)
- Pipeline & infographics (`/pipeline/`)
- Brandboost demos (`/brandboost/`)

**Image specs:**
- 1200×900 cover (4:3) for grid
- 1920×1200 full-size for lightbox
- WebP + JPG fallback · <100KB per cover
- Lazy load below fold

**Metadata per artifact:**
```yaml
- id: "agent-orchestra-dashboard-2025"
  title: "Multi-agent Orchestra · Marketing Dashboard"
  cover: "/demos/covers/agent-orchestra.webp"
  full: "/demos/full/agent-orchestra.png"
  category: "Dashboard"
  tools: ["Claude Sonnet", "Supabase", "Next.js"]
  industry: "FMCG"
  date: "2025-Q4"
  description: "..."
  external_link: optional URL
```

Store as static JSON · admin-edit via repo.

#### 5.3.3 Filtering & Search (P0)

- Filter chips: `All · Dashboard · Slide · Infographic · Landing · App · Agent · Workflow`
- Search box (P1): match title + description + tools
- URL state: `/demos?category=Dashboard&tool=Claude` (shareable)

#### 5.3.4 Performance (P0)

- Initial bundle < 200KB
- Hero image lazy + blur placeholder
- Mini-app embeds: lazy-mount on scroll into view
- Lighthouse: Mobile > 85, Desktop > 95
- Time-to-interactive < 3s on 4G

---

## 6. WOW Patterns (design playbook)

### Hero (any page)
- Auto-typing demo text — "สวัสดี ผมเป็น AI agent ที่ต้นสร้าง..."
- Particle background (subtle · dark base + gold/teal sparks · no flicker)
- Smooth scroll cue — bouncing arrow + animated underline

### Cards
- Hover: gold accent border + slight lift
- "WOW" cards: hover → reveal secondary detail (price, tools, role)
- Skeleton load with shimmer

### Transitions
- Section reveal on scroll (intersection observer · fade + translate)
- Marquee for testimonials + trust logos (existing)
- Number count-up for stats

### Mobile-specific
- Sticky bottom CTA (LINE button always visible)
- Swipeable card carousels for courses / demos
- 1-tap to LINE OA · no friction

---

## 7. Data Architecture

### Static artifacts (P0)
- `/demos/data/artifacts.json` — list of artifact metadata
- `/demos/covers/*.webp` — cover images
- `/demos/full/*.png` — full-size

### Live mini-apps (P0)
- Embedded as iframes from API endpoints (`/api/chat`, `/api/recommend`)
- API routes use **Vercel Edge Functions** (free tier 100K invocations/month)
- Rate-limit table in Supabase: `demo_rate_limits (ip, demo_id, count, window_start)`

### Analytics (P1)
- Simple Plausible / Umami self-hosted free
- Track: page views, demo interactions, click → LINE, click → /services

---

## 8. Success Metrics

### Leading (weekly)
- Landing → /demos click-through > 15%
- /demos session duration: median > 2 min
- Demo interaction count: > 50/week
- /demos → LINE OA click > 5%

### Lagging (monthly)
- Total LINE OA inquiries from web: +50% vs baseline
- Corporate inquiry rate (LinkedIn, email): +30%
- /services proposal builder usage from /demos referral: track

### Quality signals
- Lighthouse Mobile > 85
- Bounce rate on /demos < 40%
- Mobile vs desktop interaction ratio: monitor for parity

---

## 9. Content Plan

### Initial Launch (Week 1)
- 5 artifacts in gallery (high-quality, hand-picked)
- 2 live mini-apps (chatbot + course recommender)

### Ongoing (monthly)
- +3-5 new artifacts/month
- +1 new live demo/quarter
- Refresh hero copy + featured items based on performance

---

## 10. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | Chatbot demo — เปิด Claude API free tier ก่อน หรือใช้ rule-based พอ v1? | Eng/ต้น | Yes — API cost decision |
| Q2 | Artifact sources — ของลูกค้า corporate ต้องขออนุญาตก่อน publish ไหม? | Legal/ต้น | Yes — gate v1 content |
| Q3 | Course recommender — ใช้ LLM หรือ rule decision tree? | Design | No — start rule-based, upgrade later |
| Q4 | Embedded demos vs popup modal? Performance trade-off | Design | No — start embed, A/B test |
| Q5 | /demos URL: keep /demos หรือ /work หรือ /portfolio? | ต้น | No — /demos clear |
| Q6 | จะ migrate /brandboost + /pipeline เป็น part of /demos ไหม? | Eng | No — keep standalone + cross-link |

---

## 11. Timeline

### Phase 1 — Demos Page MVP (week 1-2) · P0
1. /demos route + skeleton
2. Hero + Artifact gallery (5 artifacts curated)
3. Filter chips + lightbox
4. 2 live mini-apps (chatbot + recommender) — rule-based version

### Phase 2 — Landing + Cross-links (week 2-3) · P0
5. Landing: "Featured Demos" section + cross-link
6. Chaiwat profile: "Latest Work" section
7. Mobile sticky LINE CTA

### Phase 3 — Live LLM demos (week 3-4) · P1
8. Upgrade chatbot to Claude API (rate-limited)
9. Course recommender with Claude reasoning
10. Analytics integration (Plausible self-host)

### Phase 4 (P2)
11. AI-generated landing demo
12. Brand identity generator
13. SEO refinements + structured data

---

## 12. Action Checklist

- [ ] **ต้น** decide Q1 (Claude API budget for demos) — blocking P0 chatbot
- [ ] **ต้น** clear Q2 (legal · corporate artifact permissions) — blocking gallery launch
- [ ] **ต้น** select first 5 artifacts (cover image + metadata)
- [ ] **Design** mock /demos page (hero, gallery, demos section)
- [ ] **Eng** scaffold /demos/index.html (clone /services structure)
- [ ] **Eng** spike chat demo — rate-limiting via Supabase
- [ ] **Eng** Lighthouse audit current landing — baseline
- [ ] **Content** write 5 short captions for first 5 artifacts (Thai + EN)

---

© 2026 TONPALEARN
