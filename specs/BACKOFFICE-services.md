# TONPALEARN · Backoffice · Services Proposal Builder

> **Module:** `/services/` (current static page) → v2 = proposal builder app
> **Status:** v1 = static services page · v2 = interactive proposal generator (this spec)
> **Owner:** ต้น (single-admin)
> **Updated:** May 2026

---

## 1. Problem Statement

ลูกค้า corporate มาคุยแล้วต้องการ "proposal" — ต้นต้องเปิด Keynote/Word ทำใหม่ทุกครั้ง ใช้เวลา 2-4 ชม. ต่อ proposal เนื่องจาก:
- Scope ทุกราย unique (อุตสาหกรรม, ขนาดทีม, budget, timeline)
- Solution mix-and-match: Training + Consulting + Development หลาย combination
- Phase + pricing breakdown ต้องคำนวณใหม่
- Branding ต้อง consistent ทุกใบ

**Cost of not solving:**
- ปิด deal ช้า · ลูกค้า lose interest ระหว่างรอ
- Quality เพี้ยน — บางใบลืม section, บางใบ pricing ผิด
- ต้นเสีย deep work hours แลกกับ admin work

---

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | ออก proposal ใน < 30 นาที (จาก 2-4 ชม.) | จับเวลา median per proposal |
| G2 | Mix & match modules (Training/Consult/Build × Phase × Industry) | Generate 5 distinct proposals per week without re-template |
| G3 | Auto-pricing แม่นยำ — ใส่ scope ได้ ราคาออกอัตโนมัติ | 0 errors in last 10 proposals |
| G4 | Convert proposal → quotation → invoice ใน 1 flow ต่อเนื่อง | Click-through จาก /services/builder → /billing/quotations |
| G5 | สวยงาม · brand-consistent · WOW ลูกค้า | Internal NPS หลังลูกค้าได้ proposal: > 8/10 |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Public self-service (ลูกค้าทำ proposal เอง) | ขายแบบ consultative · ไม่ใช่ self-checkout |
| AI auto-write content of proposal | v1 ใช้ template + manual override · GenAI เป็น P2 |
| Versioning หลายรอบของ proposal เดียวกัน | ทำ clone + edit แทน (simpler) |
| eSignature flow | ใช้ DocuSign external ถ้าจำเป็น (P2) |
| Multi-language proposal (EN) | Audience ไทย · EN เป็น P2 |

---

## 4. User Personas

| Persona | Description |
|---------|-------------|
| **ต้น (Admin)** | Generate proposal สำหรับ deal ที่กำลัง pitch |
| **ลูกค้า Corporate** | Receiver — open PDF · review · approve / discuss |
| **ลูกค้า SMB** | Smaller scope · need lighter proposal (1-2 services) |

---

## 5. User Stories

### Builder Flow

- **เป็น Admin** ผมอยากเริ่ม proposal จาก **template** (Training-heavy / Consulting / Full Build / Custom) → preview structure → customize
- **เป็น Admin** ผมอยากใส่ลูกค้า: company name, industry, target audience, timeline expectation, budget range
- **เป็น Admin** ผมอยาก pick service lines: ☑ Training (เลือก courses), ☑ Consulting (เลือก phases), ☑ Development (เลือก deliverables), ☑ Custom block (free text)
- **เป็น Admin** ผมอยากใส่ phase breakdown: phase name + duration + deliverables + dependencies
- **เป็น Admin** ผมอยากเห็น **auto-pricing** ตาม scope ที่เลือก + manual override per phase
- **เป็น Admin** ผมอยาก preview proposal A4 portrait แบบ live (เหมือน quotation app)
- **เป็น Admin** ผมอยาก export PDF · share link · convert → quotation

### Library / Reuse

- **เป็น Admin** ผมอยากเก็บ proposal เก่าเป็น template ไว้ใช้ใหม่
- **เป็น Admin** ผมอยาก clone proposal ของลูกค้า A เพื่อทำให้ลูกค้า B (industry คล้ายกัน)
- **เป็น Admin** ผมอยากค้น proposal เก่าโดย: customer name, industry, status, date range

### Tracking

- **เป็น Admin** ผมอยากดู proposal status: draft → sent → reviewing → accepted/declined → converted-to-quote
- **เป็น Admin** ผมอยากเห็น win rate per industry / per service mix

---

## 6. Requirements

### 6.1 Templates (P0)

Pre-built templates:

| Template | Service Mix | Typical Duration | Typical Range |
|----------|-------------|------------------|---------------|
| **Quick Training** | Training only · 1-2 courses | 1-2 weeks | 50K-200K |
| **Training + Workshop** | Training + Consulting Phase 1 | 1-2 months | 200K-500K |
| **Strategic Adoption** | Consulting 3 phases + Training | 3-6 months | 500K-1.5M |
| **Full Build** | All 3 service lines + custom Development | 6-12 months | 1M-5M |
| **Custom** | Empty — start from scratch | — | — |

Each template comes with: cover, exec summary, scope outline, phase table, pricing table, terms, signature block.

### 6.2 Service Modules (P0)

Each proposal = composition of modules:

#### Training Module
- Pick from 12 courses (`COURSES.md` v7.1)
- For each: format (Group/Private/On-site) + headcount + hours
- Auto-price: headcount × hours × per-format rate
- Output: course list + audience + outcomes

#### Consulting Module
- Phases (pick from): Discovery · Strategy · Pilot · Rollout · Support
- For each: duration (weeks) + deliverable list + owner (TPL/Client/Joint)
- Auto-price: phase rate table (configurable per phase)

#### Development Module
- Deliverable types: AI Agent · Chatbot · Internal App · Dashboard · Integration
- For each: complexity tier (Simple/Standard/Complex) → price tier
- Time estimate auto-calc

#### Custom Block
- Free-form: title + body (markdown) + price
- ใช้สำหรับ scope ที่ไม่เข้าหมวด

### 6.3 Pricing Engine (P0)

Configurable rate card (admin-editable, stored in settings):

```js
RATES = {
  training: {
    perFormat: {
      vdo: {...}, group: {...}, private: {...}, onsite: {...},
    },
    discountTiers: { '5+ courses': 0.10, '10+ courses': 0.15 },
  },
  consulting: {
    perPhase: {
      discovery: { rate: 80000, unit: 'phase' },
      strategy:  { rate: 150000, unit: 'phase' },
      pilot:     { rate: 200000, unit: 'phase' },
      rollout:   { rate: 300000, unit: 'phase' },
      support:   { rate: 50000, unit: 'month' },
    },
  },
  development: {
    perDeliverable: {
      agent_simple:     150000,
      agent_standard:   300000,
      agent_complex:    500000,
      chatbot_simple:   80000,
      // ...
    },
  },
  bundleDiscount: {
    '2 services': 0.05,
    '3 services': 0.10,
  },
}
```

Pricing summary auto-renders:
- Subtotal per service line
- Bundle discount
- Net before VAT
- VAT (if vendor นิติบุคคล + จด VAT)
- Grand total

### 6.4 Proposal PDF Structure (P0)

```
Page 1: Cover
  - "PROPOSAL" + project codename + customer logo (optional upload)
  - Date · Valid until · Prepared by

Page 2: Executive Summary
  - Problem statement (admin writes)
  - Approach (auto-summarize from modules)
  - Expected outcomes

Page 3-4: Scope (per module)
  - Training section (if any)
  - Consulting section (if any)
  - Development section (if any)
  - Custom blocks (if any)

Page 5: Phase Breakdown
  - Gantt-style timeline (months across, phases down)
  - Per-phase: deliverables, owner, duration

Page 6: Investment
  - Pricing table (line items + subtotals + total)
  - Payment schedule (e.g., 30/40/30)

Page 7: Methodology + About TONPALEARN
  - Reused from /services/ static content
  - Logo + signature block

Page 8 (optional): Appendix
  - Course descriptions (linked)
  - Team bios
  - Reference cases (admin selects)
```

A4 portrait · multi-page · brand-consistent (CI palette + fonts)

### 6.5 Convert to Quotation (P0)

- Button "→ Convert to Quotation" on accepted proposal
- Pre-fills `/billing/quotations` new doc with:
  - Customer (auto-create if not exists)
  - Items (one per proposal module)
  - Discount lines
  - Notes (link back to proposal_no)
- Status sync: proposal → `converted-to-quote`

### 6.6 Tracking (P0)

| Status | Trigger | Next action |
|--------|---------|-------------|
| `draft` | Created | Edit, preview, send |
| `sent` | Admin marks sent (after email/share) | Wait for response |
| `reviewing` | Customer engaged (manually set) | Follow up |
| `accepted` | Customer signs / verbal yes | Convert to quotation |
| `declined` | Customer no | Log reason · close |
| `expired` | Past validity date | Re-quote if needed |
| `converted` | Used to create quotation | Linked in billing |

Win/loss reasons (dropdown + custom): `Budget`, `Timing`, `Internal change`, `Lost to competitor`, `No clear ROI`, `Other` (+ free text).

### 6.7 Storage (P0)

```sql
create table proposals (
  id uuid pk,
  proposal_no text unique,        -- 'PROP-YYMM-NNN'
  status text default 'draft',    -- enum above
  customer_id uuid references customers(id),
  industry text,
  template_key text,              -- 'quick_training' | etc.
  cover_title text,
  exec_summary text,
  modules jsonb,                  -- array of module objects
  pricing_summary jsonb,
  payment_schedule jsonb,
  valid_until date,
  signature_required boolean default false,
  pdf_url text,                   -- Supabase Storage (after export)
  share_token text,               -- shareable read-only link
  win_loss_reason text,
  converted_quotation_id uuid references quotations(id),
  created_at, updated_at, sent_at, decided_at
);
```

### 6.8 Shareable Link (P1)

- After export PDF → also create shareable HTML view at `/proposals/<share_token>`
- Read-only · branded · mobile-friendly
- Track open events (P2 analytics)
- Optional: ลูกค้ากด "Accept" / "Have questions" → notify ต้น

---

## 7. UI / UX Flow

```
/services/builder/   (new — admin tool)

  Step 1: Choose template
    [card] Quick Training  [card] Strategic   [card] Full Build  [card] Custom

  Step 2: Customer
    [Pick existing customer ▾] or [New customer]
    Industry [Hotel ▾]  Budget [200K-500K ▾]  Timeline [2 months ▾]

  Step 3: Build modules
    ☑ Training → [+ Add course]
    ☑ Consulting → [Pick phases: Discovery ☑ Strategy ☑]
    ☑ Development → [+ Add deliverable]
    ☑ Custom block → [Title] [Body markdown] [Price]

  Step 4: Phase timeline
    [Visual Gantt editor — drag-to-resize]

  Step 5: Pricing review
    [Auto-table + override per line]

  Step 6: Final touches
    Cover title + exec summary + custom notes

  Step 7: Preview + Export
    [A4 portrait live preview · multi-page]
    [Export PDF · Share link · Convert to Quote]
```

---

## 8. Success Metrics

### Leading (weekly)
- Time per proposal: median **< 30 min** (vs 2-4 hr baseline)
- # proposals generated / week: track baseline → goal +50%
- Convert rate (proposal → quotation): > 50%

### Lagging (monthly/quarterly)
- Win rate (accepted / sent): > 30% goal
- Avg deal size: track over time
- Sales velocity (days from proposal sent → quote accepted): < 14 days median

---

## 9. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | Rate card finalize: ราคา per phase consulting, per deliverable dev — ตัวเลขจริง | ต้น (business) | Yes — P0 needs defaults |
| Q2 | Customer logo upload — บังคับ หรือ optional? legal concerns? | Legal | No — optional v1 |
| Q3 | Share link expire ไหม? | Eng | No — default never · admin can revoke |
| Q4 | Multi-currency (USD) สำหรับ corporate ต่างประเทศ? | ต้น | No — P2 (THB only v1) |
| Q5 | DocuSign integration? | ต้น | No — P2 |

---

## 10. Timeline

### Phase 1 (week 1-2) · P0
1. Schema: proposals table + migration
2. Builder UI: template picker + customer + module composer
3. Pricing engine
4. PDF export (re-use html-to-image + jsPDF pattern)

### Phase 2 (week 3) · P0
5. Convert to Quotation flow (depend on billing v1)
6. Tracking statuses + dashboard

### Phase 3 (week 4-6) · P1
7. Shareable link `/proposals/<token>`
8. Gantt timeline editor (drag-drop)
9. Templates from real won deals (curate)

### Phase 4 · P2
10. AI auto-write (Claude) — exec summary draft, scope language
11. Multi-language (EN proposal)
12. eSignature

---

## 11. Action Checklist

- [ ] **ต้น** finalize rate card (Q1) — blocking P0
- [ ] **Engineering** create proposals table migration
- [ ] **Design** wireframe builder UI (Step 1-7)
- [ ] **Design** A4 proposal template (8-page layout)
- [ ] **ต้น** curate 3 real deals → save as "Reference Cases" content
- [ ] **Engineering** spike Gantt component (consider `react-gantt-task` or custom)
- [ ] **ต้น** decide on share link UX (read-only HTML vs PDF only)

---

© 2026 TONPALEARN
