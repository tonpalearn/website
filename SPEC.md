# TONPALEARN · Website Specification

> **Single doc for the whole site** — landing, sub-apps, brand, data, deployment
> **Production:** https://tonpalearn.com (Vercel · auto-deploy from `main`)
> **Repo:** https://github.com/tonpalearn/website (public)
> **Updated:** May 2026

---

## 1. Overview

TONPALEARN เป็นธุรกิจสอน AI ของต้น (ชัยวัฒน์ ภูวนนท์จิรกวิน · Founder · CEO UP Wellness · PM 15 ปี · Computer Engineering).

Website นี้คือ **public face + operations toolkit** ใน 1 repo:

- **Public face** — landing + ประวัติ + course catalog
- **Operations apps** — quotation generator, certificate generator + verify
- **Sub-pages** — Amway 2026, Name list, อื่น ๆ ที่อาจเพิ่มภายหลัง

ทุก page ใช้ **CI เดียวกัน** (TONPALEARN brand) — ดูเป็นระบบเดียว ไม่ใช่กลุ่มของ static pages กระจัดกระจาย.

---

## 2. Goals

| # | Goal | Measurable Outcome |
|---|------|--------------------|
| G1 | ลูกค้าใหม่เจอ landing → เข้าใจ course catalog → ทักมา LINE OA | LINE inquiries เพิ่ม · bounce rate ต่ำลง |
| G2 | ลด admin overhead — quotation + certificate ออกได้ใน 5 นาที ต่อใบ | Manual time จาก ~30 นาที → < 5 นาที |
| G3 | ใบรับรองทุกใบ verify ได้จริง (ไม่ใช่กระดาษเฉย ๆ) | tonpalearn.com/verify ทำงาน · 100% ของใบใหม่ลง Supabase |
| G4 | Brand consistent ทุก touchpoint (landing → cert → invoice) | ใช้ CI palette + fonts เดียวกันทั้ง site |
| G5 | Zero recurring cost ในการ run | Vercel free tier + Supabase free tier เท่านั้น |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Multi-tenant (admin ที่ไม่ใช่ต้น) | Solo founder · ไม่จำเป็น v1 |
| E-commerce / payment flow บนเว็บ | ใช้ LINE OA + bank transfer manual แทน |
| LMS / course content delivery | คอร์สสอนสด/VDO ผ่าน Zoom + อื่น ๆ — เว็บไม่ host content |
| Multi-language (EN-only) | Audience ไทย + ENG mixed อยู่แล้ว · ไม่ต้อง full i18n |
| Server-side rendering / SEO advanced | Static + Vercel CDN + React CSR เพียงพอ |
| Mobile app | Web-first · PWA ก็ยังไม่จำเป็น |

---

## 4. Architecture

### Stack
- **Frontend:** React 18 (via CDN UMD) + Tailwind CSS (CDN) + Babel Standalone (in-browser JSX transform)
- **Single-file pattern:** ทุก page เป็น 1 HTML ไฟล์ — ไม่มี build step, ไม่มี bundler
- **Database:** Supabase (PostgreSQL + REST API + RLS)
- **Hosting:** Vercel (free tier · static + serverless edge)
- **Domain:** tonpalearn.com (DNS → Vercel)
- **CI/CD:** Git push `main` → Vercel auto-deploy (~2 นาที)

### Trade-offs
- ✅ **No build step** = แก้ HTML → push → live · ใครก็แก้ได้
- ✅ **React via CDN** = ได้ component pattern + state · ไม่ต้อง webpack/vite
- ⚠️ **Babel in-browser** = first paint ช้าลงนิด · acceptable สำหรับ traffic ปัจจุบัน
- ⚠️ **CDN dependency** = ถ้า unpkg/cdnjs down → site แตก · risk ต่ำ
- ✅ **Supabase RLS** = anon key embed in HTML ปลอดภัย (read-only)
- ⚠️ **Service role key in localStorage** = ถ้า browser โดน compromise → registry write leak · admin-only browser mitigation

---

## 5. Pages & Features

### 5.1 Landing Page — `/`

**File:** `index.html` (~85 KB)

**Sections:**
- Sticky nav + scroll progress bar
- Hero — animated AI demo "terminal" + headline + CTA
- Stats strip — 15+ ปี · 12 courses · 4 formats · 5.0 reviews
- Trust strip — marquee logos (Claude, ChatGPT, MCP, etc.)
- Why Choose — Bento grid 6 cells (pain points + solution)
- About — portrait + bio + industry chips
- Process — 4-step timeline "ใช้ AI ใน 4 ก้าว"
- Courses — 12 courses · filter tabs · **Format toggle** (Online Group / 1:1 / On-site) · price chips · ribbons (ยอดนิยม / NEW)
- Discount strip — Early Bird / Group / Alumni
- Testimonials — 2-row marquee (5 reviews × 2 directions)
- FAQ — accordion (9 questions)
- CTA — 3-channel (LINE / Corporate / ดูคอร์ส)
- Footer — multi-column links

**Course Data Source:** Synced from `/AI Course/COURSES.md` v7.1 (12 courses) + `/AI Course/PRICING.md` v3.3
**Format options:** VDO ถูกตัดออก — ยังไม่มี VDO products

---

### 5.2 Quotation Generator — `/quotation/`

**File:** `quotation/index.html` (~43 KB)

**Purpose:** สร้างใบเสนอราคา A4 portrait — pick จาก course catalog + edit + export PDF/PNG

**Features:**
- Form panel (left) · Live A4 preview (right) · Zoom slider 50–120%
- Course picker (12 courses × 4 formats) → auto-fill name/desc/price
- Custom row support (free-form item)
- Multiple discount lines (% or fixed amount)
- WHT 3% toggle (auto-on เมื่อเลือก "นิติบุคคล")
- Quote No. auto-gen `TPL-YYMM-NNN` (editable)
- 50/50 payment terms (default)
- Bank info: กสิกร 745-2-61376-4 (configurable ใน Settings)
- Export: PDF (jsPDF + html-to-image) · PNG · Print
- localStorage: Settings (vendor info) + Draft (auto-save) + History (50 latest)

**Note:** Default vendor info = empty after PII removal — admin ใส่เองครั้งแรกใน Settings

---

### 5.3 Certificate Generator — `/certificate/`

**File:** `certificate/index.html` (~50 KB)

**Purpose:** สร้างใบรับรองการเรียนรู้ A4 landscape + บันทึกลง Supabase ให้ verify ได้

**Features:**
- A4 landscape (1123 × 794 px @ 96dpi)
- Form: student name (TH + EN) · course picker (12 courses) · custom course option · format · hours · achievement · dates · custom message
- Name style toggle: Script (Great Vibes, EN only) / Serif (Sarabun, supports Thai)
- Cert No. auto-gen `TPL-CERT-YYMM-NNN`
- **Signature:** real handwritten image (`assets/signature-ton.png` · 800×440 · 63 KB · transparent PNG)
- Decorative frame (gold double-border + corner ornaments + watermark seal)
- **Issue button** — POST to Supabase `certificates` table → cert verifiable at `/verify?id=...`
- Settings: signer info + Supabase URL + Service Role Key (private, localStorage)
- Export: PDF/PNG/Print (html-to-image + jsPDF)

---

### 5.4 Verify Page — `/verify/`

**File:** `verify/index.html` (~12 KB)

**Purpose:** Public verification — ใครก็ตรวจสอบใบรับรองได้

**Flow:**
1. User visits `tonpalearn.com/verify?id=TPL-CERT-2605-001`
2. Page reads `?id=...` from URL · auto-fetch from Supabase via anon key
3. Display:
   - ✅ **Verified** — student name, course, dates, achievement, signer, registered date
   - ❌ **Not found** — "ใบรับรองไม่พบในระบบ"

**Auth:** Anon key (embedded in source · safe by design · RLS = SELECT only)

---

### 5.5 Profile Page — `/chaiwat/`

**File:** `chaiwat/index.html` (~22 KB · was 1.9 MB Claude artifact bundle)

**Purpose:** ประวัติต้น — cinematic editorial portfolio

**Sections:** Nav · Hero (split portrait + name) · Stats · Quote · Journey timeline · What I Do (2×2 grid) · Stack (marquee + tag groups) · Currently · Contact · Footer

---

### 5.6 Sub-pages

| Route | Content | Status |
|-------|---------|--------|
| `/amway-2026/` | Amway 2026 event page | One-off · keep as-is |
| `/name-list/` | Name list utility | One-off · keep as-is |

---

## 6. Brand Identity (CI)

### Palette
| Role | Hex | Use |
|------|-----|-----|
| Ink (dark base) | `#08080F`, `#0D0D14`, `#12121E`, `#1A1A2A` | Backgrounds, primary surface |
| Gold (primary accent) | `#F5D67A`, `#E6B84B`, `#C8A84B`, `#9A7A2B` | CTAs, headings, brand highlight |
| Teal (secondary accent) | `#67E8F9`, `#2DD4BF`, `#14B8A6`, `#0D9488` | Tertiary CTAs, info |
| Violet (tertiary accent) | `#A78BFA`, `#7C5CFC` | Decorative, gradient depth |

### Typography
- **Display:** Space Grotesk (logo, headers in modern context)
- **Serif:** Cormorant Garamond (cert "CERTIFICATE OF COMPLETION", profile name)
- **Body:** IBM Plex Sans Thai (landing, profile, quotation form) / Sarabun (cert paper, document)
- **Script:** Great Vibes (cert student name — EN only)
- **Mono:** JetBrains Mono (cert numbers, code-style elements)

### Tagline
> "AI ง่ายขึ้น เมื่อมีต้นพาไป"

---

## 7. Data Model — Supabase

### Table: `certificates`

| Column | Type | Purpose |
|--------|------|---------|
| `cert_no` | text (PK) | `TPL-CERT-YYMM-NNN` |
| `student_name`, `student_name_th` | text | Student names (both languages) |
| `course_num`, `course_name`, `course_topic` | text | Course details |
| `format`, `format_label` | text | Delivery format |
| `hours` | int | Course hours |
| `achievement`, `achievement_label` | text | Pass / Merit / Distinction / Honors |
| `completion_date`, `issue_date` | date | When student finished + when cert issued |
| `custom_message` | text | Optional tagline |
| `is_custom_course` | bool | Whether course was custom or from catalog |
| `signer_name`, `signer_name_th`, `signer_title` | text | Issuer details (snapshot) |
| `created_at`, `updated_at` | timestamptz | Audit fields |

### RLS (Row Level Security)
- **anon role:** SELECT only — for public verify page
- **service_role:** Full CRUD — for certificate generator
- Service role key MUST stay private (localStorage only, never in repo)

### Schema location
- DDL: [`supabase-schema.sql`](supabase-schema.sql) — committed in repo
- Project: `https://lhrzjkizxjigqeuyposw.supabase.co`

---

## 8. Security Model

| Surface | Auth | Risk | Mitigation |
|---------|------|------|------------|
| Verify page (`/verify/`) | Supabase **anon key** embedded in HTML | Public reads — by design | RLS: SELECT only · no PII exposure beyond cert content |
| Certificate generator Issue button | Supabase **service_role key** in localStorage | If admin browser compromised → attacker can write fake certs | Admin uses dedicated trusted browser · rotate key on suspicion |
| Quotation app | None (localStorage only) | localStorage leakage if shared device | Default vendor info empty · admin paste manually |
| GitHub repo public | n/a | Anyone reads source | No secrets in repo · only anon key (designed for public) |

### Key Rotation Procedure
1. Supabase Dashboard → Settings → API
2. Reset `service_role` key
3. Update in certificate Settings (paste new key)
4. (Anon key: no need to rotate · rotate only if RLS misconfigured)

---

## 9. Deployment

### Vercel Auto-Deploy
- Connected to `github.com/tonpalearn/website` `main` branch
- Push to `main` → build (static · no build step needed) → publish ~2 min
- Production URL: `tonpalearn.com` (DNS managed in Vercel)

### Git Push Quirk (documented)
macOS keychain stores `upwellness` GitHub token as default — pushing to `tonpalearn/website` fails with 403.

**Workaround:** Use tonpalearn token in URL:
```bash
TOKEN=$(gh auth token -u tonpalearn)
git push "https://tonpalearn:${TOKEN}@github.com/tonpalearn/website.git" main
```

Or run `gh auth setup-git` once globally.

---

## 10. URL Structure (Sitemap)

```
tonpalearn.com/
├── /                          → Landing (12 courses, FAQ, contact)
├── /chaiwat/                  → Profile page
├── /quotation/                → Quotation generator (admin tool)
├── /certificate/              → Certificate generator (admin tool)
├── /verify?id=TPL-CERT-...    → Public verify page
├── /amway-2026/               → Sub-page (one-off)
└── /name-list/                → Sub-page (one-off)
```

---

## 11. Repository Layout

```
website/                              (github.com/tonpalearn/website)
├── index.html                        # Landing (12 courses)
├── index-v1.html                     # Archive — original landing v1
├── README.md                         # Repo overview
├── SPEC.md                           # นี่ — full system spec
├── supabase-schema.sql               # DB schema + RLS
├── .gitignore                        # .DS_Store, .netlify/, .claude/, *.bak
│
├── assets/
│   ├── ton-london.jpg                # Portrait (landing About section)
│   ├── signature-ton.png             # Handwritten signature (transparent PNG, 63 KB)
│   └── covers/
│       └── course-01..12.{jpg,png}   # Course covers
│
├── quotation/
│   └── index.html                    # Quotation generator
│
├── certificate/
│   └── index.html                    # Certificate generator (Supabase-backed)
│
├── verify/
│   └── index.html                    # Public verify page
│
├── chaiwat/
│   ├── index.html                    # Profile page
│   ├── PROJECT.md
│   └── assets/portrait-crop.jpg
│
├── amway-2026/index.html
├── name-list/index.html
│
├── IMAGE_PROMPTS_COURSE_10_11.md     # AI image generation prompts
└── IMAGE_PROMPTS_COURSE_12.md
```

---

## 12. Course Catalog Reference

**Source of truth:** `/AI Course/COURSES.md` v7.1 (12 courses) — synced to `/AI Business/00_Reference/COURSES.md` + landing page

| # | Course | Hours | Pre-req |
|---|--------|-------|---------|
| 01 | AI Basic | 2 ชม. | — |
| 02 | AI Agentic | 4 ชม. | — |
| 03 | MCP Connector | 5 ชม. | 02 |
| 04 | LINE ChatBot | 3 ชม. | 02 |
| 05 | AI for Kids | 3 ชม. | — |
| 06 | AI for Personal Assistant | 3 ชม. | — |
| 07 | AI for ABOs | 3 ชม. | — |
| 08 | AI Agentic Web Builder | 5 ชม. | rec. 01 |
| 09 | AI Agentic App Builder | 5 ชม. | 08 |
| 10 | AI Agentic Orchestra | 4 ชม. | rec. 02+03 |
| 11 | AI Content Creator System | 4 ชม. | rec. 01 |
| 12 | AI Agentic for IT Audit & Consult | 4 ชม. | IT Audit/Consult background |

**Pricing tiers** (PRICING.md v3.3):
- 2-hr entry (01): 990–3,000
- 3-hr standard (05, 06): 990–3,000
- 4-hr standard (02, 11) / 5-hr standard (03, 04, 08, 09): 2,500–7,000
- 4-hr advanced premium (10, 11): 3,500–9,000
- Quote-based: 07 ABOs, 12 IT Audit/Consult, all Corporate

---

## 13. Future Considerations (P2)

ของที่ออกแบบไว้รองรับ ไม่ทำใน v1 แต่อย่าตัด architecture ที่ block ไป:

- **Cert verify with QR code** — Already has verify URL · เพิ่ม QR generation ในใบได้ง่าย (qrcode.js)
- **Admin dashboard** — รวม quotation + certificate history + Supabase analytics
- **Email delivery** — ส่งใบรับรองอัตโนมัติเมื่อ issue (Supabase Edge Function + Resend)
- **Course 12 cover image generation** — Prompt มีแล้ว · ยังไม่ generate
- **VDO products** — ถ้าเปิด VDO format · เพิ่ม VDO toggle กลับใน Format selector ของ landing
- **Multi-signer** — ถ้ามี co-instructor · เพิ่ม secondary signature
- **Bilingual landing** — switch EN/TH version
- **Notion sync** — Certificate registry mirror ไป Notion DB

---

## 14. Open Items

- [ ] **Course 12 pricing** — ปัจจุบัน Quote-based · finalize เมื่อพร้อม + update `PRICING.xlsx` + propagate
- [ ] **Service role key rotation** — Key ที่ใช้ตอนนี้เคยปรากฏใน chat session history · ควร rotate
- [ ] **PRICING.xlsx** — Master Excel ยังไม่ sync course 10/11/12 · ต้อง update เพื่อให้ md และ xlsx ตรงกัน
- [ ] **Sync Notion 📦 Course Package DB** (`34644b85340581c89819ce6985376b2d`) — 12 courses
- [ ] **Course 12 cover image** — Generate ผ่าน prompt ใน `IMAGE_PROMPTS_COURSE_12.md` แล้ว save `assets/covers/course-12.jpg` (file exists แต่ verify ว่าถูก style)
- [ ] **Backup strategy for Supabase** — ถ้า cert registry เติบโต · พิจารณา point-in-time recovery (Pro tier)

---

## 15. Success Metrics

### Leading (weeks)
- LINE OA inquiries per week (target: increase from baseline)
- Time-to-quote average (target: < 5 min per quote)
- Certificate issuance rate (target: 100% of trainees within 7 days post-class)
- Verify page load count (proxy: trust signal usage)

### Lagging (months)
- Course revenue (Quote-to-cash cycle)
- Repeat customer rate (alumni discount usage)
- Corporate deals closed (high LTV segment)
- SEO ranking for "TONPALEARN" + "AI สอน"

---

## 16. Change Log

| Date | Change |
|------|--------|
| 2026-05-17 | v1 — Repo created · landing v2 · quotation · chaiwat redesign |
| 2026-05-17 | Add `/certificate/` + initial verify URL (stub) |
| 2026-05-17 | Switch deploy: Netlify → Vercel |
| 2026-05-19 | Add Course 12 · sync 11 → 12 courses · domain → tonpalearn.com |
| 2026-05-19 | Real signature image (handwritten, transparent PNG, 63 KB) |
| 2026-05-19 | Supabase-backed verify system live · `/verify?id=...` works |
| 2026-05-19 | SPEC.md created (this document) |

---

© 2026 TONPALEARN · Built by ต้น (Toni) with Claude
