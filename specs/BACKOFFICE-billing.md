# TONPALEARN · Backoffice · Billing & Accounting

> **Module:** `/billing/` (+ schema `supabase-schema-billing.sql`)
> **Status:** v0.x — basic billing live · v1 scope = full TFRS-compliant accounting
> **Owner:** ต้น (single-admin)
> **Updated:** May 2026

---

## 1. Problem Statement

ต้นออกเอกสารการเงินด้วยมือ (Word/Excel) — `quotation/index.html` ช่วย quotation อย่างเดียว แต่ไม่ได้เก็บ data, ไม่ track payment, ไม่ออก tax invoice / receipt / credit note, ไม่มีบัญชีรับ-จ่ายแบบรายงานได้ ทำให้:

- เสีย 30+ นาทีต่อใบ + ผิดพลาดสูง (ตัวเลข, เลขรัน, VAT, WHT)
- ไม่รู้ยอดค้างชำระจริง · aging invoice ไม่มี
- ปลายปียื่นภาษีต้องรวบรวมเอกสารจาก 3-4 ที่
- กำลังจะจดบริษัท → ต้องการระบบที่รองรับทั้ง **บุคคลธรรมดา** และ **นิติบุคคล** ตั้งแต่ day 1

**Cost of not solving:**
- เสียโอกาส (ลูกค้ารอ quotation นานเกินไป)
- Risk ภาษี (ออกใบกำกับภาษีผิดรูปแบบหลังจดบริษัท)
- Scale ไม่ได้ (ทุก deal ใช้เวลา admin หนัก)

---

## 2. Goals

| # | Goal | Measurable Outcome |
|---|------|--------------------|
| G1 | ออกเอกสารการเงินครบ flow (Q→I→R) ในใบเดียวกัน ใน < 3 นาที | จับเวลา median per doc < 3 min |
| G2 | รองรับ **บุคคลธรรมดา + นิติบุคคล** พร้อม VAT/WHT ที่ถูกต้องตามกฎหมายไทย | ผ่าน checklist ของผู้สอบบัญชี (5 case test) |
| G3 | Track AR แบบ real-time — รู้ยอดค้างชำระ, aging, overdue ทันที | Dashboard มี aging bucket + overdue alert |
| G4 | บัญชี TFRS compliant — สามารถ export GL + trial balance + P&L + Balance sheet ไปให้สำนักบัญชีได้ | Reports export เป็น xlsx/PDF |
| G5 | ตามหลักฐาน e-Tax Invoice ของ RD (P2) — ตั้ง architecture รองรับ | Schema มี field รองรับ e-tax id, sign digest |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Multi-tenant SaaS | Solo founder · ใช้เอง |
| Real-time bank sync (open banking) | Bot of Thailand ยังไม่เปิด API · ใช้ slip upload + manual reconcile |
| ระบบเงินเดือน / payroll | ยังไม่มีพนักงาน · ใช้ outsource ถ้าจ้าง |
| Inventory / stock module | ขายบริการ ไม่ได้ขายสินค้า |
| Multi-currency | Audience ไทย · revenue 100% THB |
| Mobile native app | Web ดีพอ · responsive |

---

## 4. User Personas

| Persona | Description | Frequency |
|---------|-------------|-----------|
| **ต้น (Admin)** | Founder, single user, ออกเอกสาร + reconcile + report | Daily |
| **ลูกค้าบุคคล** | คนทั่วไป — เรียน course เอง · ไม่ต้องการใบกำกับภาษี | 1-3/week |
| **ลูกค้านิติบุคคล** | บริษัท / องค์กร — ต้องใบกำกับภาษี, อาจหัก WHT 3% | 1-2/week |
| **สำนักบัญชี (อนาคต)** | ผู้สอบบัญชีภายนอก — ขอ GL + supporting docs ปลายปี | Quarterly |

---

## 5. User Stories

### Vendor Identity (Entity Switch) [P0]

- **เป็น Admin** ผมอยากตั้งค่าได้ว่าเอกสารชุดนี้ออกในนาม **บุคคลธรรมดา** หรือ **นิติบุคคล** เพื่อให้เลข tax id, format ใบกำกับ, การคิด VAT ถูกต้องตามสถานะปัจจุบัน
- **เป็น Admin** ผมอยาก switch entity ระหว่างปีได้ (เช่นจดบริษัทเดือน 6 → ของก่อนหน้ายังเป็นบุคคล, ตั้งแต่เดือน 7 เป็นบริษัท) โดยไม่กระทบเอกสารเก่า
- **เป็น Admin** ผมอยากตั้งเลขรัน (quotation, invoice, receipt) แยกตาม entity เพื่อไม่ปนกัน

### Quotation [P0]

- **เป็น Admin** ผมอยากสร้าง quotation จาก course catalog (12 courses × 4 formats) + custom row, ปิดส่วนลดได้หลายแถว, ระบุ validity, terms, notes
- **เป็น Admin** ผมอยาก clone quotation เก่า เพื่อใช้กับลูกค้าใหม่ที่ scope ใกล้กัน
- **เป็น Admin** ผมอยาก convert quotation → invoice ได้ใน 1 click โดย copy items + customer
- **เป็น Admin** ผมอยากเห็น lifecycle: draft → sent → accepted → invoiced หรือ declined / expired

### Invoice (ใบวางบิล) [P0]

- **เป็น Admin** ผมอยากออกใบวางบิล ระบุ due date (default issue+30) และเชื่อม quotation
- **เป็น Admin (นิติบุคคล)** ผมอยากให้ระบบคิด VAT 7% + WHT 3% (ถ้า apply) อัตโนมัติ และแสดง: subtotal, discount, net, VAT, grand total, WHT, amount to pay
- **เป็น Admin** ผมอยาก track payment: pending → sent → paid → overdue → cancelled
- **เป็น Admin** ผมอยาก upload slip การโอน + record payment ref + ผูกกับ invoice

### Receipt / Tax Invoice [P0]

- **เป็น Admin (บุคคลธรรมดา)** ผมอยากออก **ใบรับเงิน** (Receipt) — ไม่มี VAT, รูปแบบเรียบ
- **เป็น Admin (นิติบุคคล + จด VAT)** ผมอยากออก **ใบกำกับภาษี/ใบเสร็จรับเงิน** (Tax Invoice + Receipt รวมใบเดียว) — มี VAT 7%, มี "ฉบับลูกค้า/ORIGINAL", สำเนาเก็บไว้
- **เป็น Admin** ผมอยากออก receipt อัตโนมัติเมื่อ mark invoice ว่า paid

### Credit/Debit Note [P1]

- **เป็น Admin (นิติบุคคล)** ผมอยากออก **ใบลดหนี้** (Credit Note) เมื่อ refund / discount ภายหลัง
- **เป็น Admin (นิติบุคคล)** ผมอยากออก **ใบเพิ่มหนี้** (Debit Note) เมื่อเรียกเก็บเพิ่ม

### Customer (CRM lite) [P0]

- **เป็น Admin** ผมอยากเก็บข้อมูลลูกค้า — name, tax_id, type (บุคคล/บริษัท), address, contact — และดู deal history ของลูกค้าแต่ละราย
- **เป็น Admin** ผมอยาก tag customer (VIP, alumni, corporate) และ search ได้ทุก field

### Expense / AP (จ่ายเงิน) [P1]

- **เป็น Admin** ผมอยากบันทึก expense (ค่าโฆษณา, ค่า hosting, ค่าเดินทาง) — category + amount + supplier + receipt photo
- **เป็น Admin** ผมอยากแยก expense ที่ deduct ภาษีได้ (ลดหย่อน/ค่าใช้จ่าย) ออกจากที่ deduct ไม่ได้

### Accounting & Reports (TFRS) [P0 partial · P1 full]

- **เป็น Admin** ผมอยากเห็น **Chart of Accounts** ที่กำหนดเองได้ (ใช้ default + เพิ่ม account)
- **เป็น Admin** ผมอยากให้ระบบ post journal เข้า GL **อัตโนมัติ** เมื่อ:
  - ออก Invoice → Dr. ลูกหนี้ / Cr. รายได้ + ภาษีขาย
  - รับชำระ → Dr. เงินสด/ธนาคาร / Cr. ลูกหนี้
  - บันทึก expense → Dr. ค่าใช้จ่าย / Cr. เงินสด หรือเจ้าหนี้
- **เป็น Admin** ผมอยาก export **Trial Balance**, **P&L**, **Balance Sheet** สิ้นเดือน/ไตรมาส/ปี
- **เป็น Admin** ผมอยาก export GL + supporting docs zip ส่งสำนักบัญชี

### Dashboard [P0]

- **เป็น Admin** ผมอยากเห็น KPI ทันทีที่เปิด: revenue MTD/YTD, AR outstanding, overdue count, top customers, top courses

### Settings [P0]

- **เป็น Admin** ผมอยากตั้งค่า: vendor identity (2 sets — personal + corporate), bank info, signature image, VAT registration toggle, default WHT %, Supabase credentials

---

## 6. Requirements

### 6.1 Entity Configuration (P0)

| Req | Description | Acceptance Criteria |
|-----|-------------|---------------------|
| ENT-1 | 2 vendor profiles in settings | `vendorPersonal {...}` + `vendorCompany {...}` ใน settings JSON |
| ENT-2 | Active entity toggle | UI dropdown: "ออกในนาม [บุคคล▾]" — เลือกแล้ว document ใช้ vendor info ของ entity นั้น |
| ENT-3 | Per-doc entity snapshot | Document แต่ละใบเก็บ `vendor_snapshot jsonb` — เปลี่ยน entity ในอนาคตไม่กระทบเอกสารเก่า |
| ENT-4 | Separate numbering per entity | Personal: `TPL-YYMM-NNN` · Corporate: `TPLC-YYMM-NNN` (configurable prefix) |
| ENT-5 | VAT auto-disable for personal | บุคคลธรรมดาที่ไม่จด VAT → has_vat = false forced |
| ENT-6 | Document title auto-switch | นิติบุคคล + has_vat → "ใบกำกับภาษี/ใบเสร็จรับเงิน" · อื่นๆ → "ใบรับเงิน" |

### 6.2 Document Types (P0)

| Doc | Thai | Prefix | Required Fields |
|-----|------|--------|-----------------|
| Quotation | ใบเสนอราคา | `QO-` หรือ `TPL-` | issue, valid_until, items, customer |
| Invoice | ใบวางบิล/ใบแจ้งหนี้ | `INV-` | issue, due, items, customer, VAT/WHT |
| Tax Invoice | ใบกำกับภาษี (full) | `TIV-` | issue, items, customer with tax_id, VAT |
| Receipt | ใบเสร็จรับเงิน / ใบรับเงิน | `RCP-` | issue, items, customer, payment_method, payment_ref |
| Credit Note (P1) | ใบลดหนี้ | `CN-` | original_invoice_id, reason, items, VAT adjustment |
| Debit Note (P1) | ใบเพิ่มหนี้ | `DN-` | original_invoice_id, reason, items, VAT |

**Combined Tax Invoice + Receipt** (นิติบุคคลรวมใบ): doc_type = `tax_invoice_receipt` — มี VAT, มี payment info, มี "ฉบับลูกค้า/ต้นฉบับ" + "สำเนา"

### 6.3 Tax Rules (P0 — Thai law)

| Rule | Apply when | Calculation |
|------|------------|-------------|
| VAT 7% (output) | Vendor นิติบุคคล จด VAT + Invoice/Tax Invoice | VAT = (subtotal - discount) × 7% |
| WHT 3% (withholding) | Customer นิติบุคคล + service revenue | WHT = (subtotal - discount) × 3% — หักก่อนจ่ายให้ vendor |
| WHT 5% (rental/professional) | กรณีเฉพาะ | Configurable rate per invoice |
| Amount to pay | = grand_total - WHT | สิ่งที่ลูกค้าโอนจริง |
| Receipt amount | = grand_total (รวม VAT, ก่อน WHT) | ที่เขียนลงใบเสร็จ |

### 6.4 Chart of Accounts (P0 default · P1 customizable)

Default COA (ย่อ — Thai TFRS for SMEs):

```
1xxx Assets (สินทรัพย์)
  1010 Cash · เงินสด
  1020 Bank · เงินฝากธนาคาร (kasikorn 745-2-61376-4)
  1030 PromptPay · พร้อมเพย์
  1100 AR · ลูกหนี้การค้า
  1110 AR — Affiliate · ลูกหนี้บริษัทในเครือ (P2)
  1500 Equipment · อุปกรณ์ (notebook, mic)
  1600 Accum. Depreciation (P1)

2xxx Liabilities (หนี้สิน)
  2100 AP · เจ้าหนี้การค้า
  2200 Output VAT Payable · ภาษีขายค้างจ่าย
  2210 Input VAT Receivable · ภาษีซื้อรอใช้
  2300 WHT Payable · ภาษีหัก ณ ที่จ่าย ค้างนำส่ง

3xxx Equity (ส่วนของเจ้าของ)
  3100 Owner's Capital · ทุนเจ้าของ (บุคคล) / ทุนจดทะเบียน (บริษัท)
  3900 Retained Earnings · กำไรสะสม

4xxx Revenue (รายได้)
  4100 Course Revenue — Public · รายได้ค่าสอน รายบุคคล
  4200 Course Revenue — Corporate · รายได้ค่าสอน องค์กร
  4300 Consulting Revenue · รายได้ที่ปรึกษา
  4400 Development Revenue · รายได้ implement
  4900 Other Revenue

5xxx COGS (ต้นทุนขาย)
  5100 Outsource Cost · ค่าจ้าง outsource
  5200 Course Materials · ค่าวัสดุ

6xxx OpEx (ค่าใช้จ่ายดำเนินงาน)
  6100 Marketing — Ads (Facebook, Google)
  6200 Hosting & Software (Vercel, Supabase, Claude API)
  6300 Travel
  6400 Office (rent if needed)
  6900 Other Expenses
```

User เพิ่ม/แก้ COA ได้ (P1)

### 6.5 Auto Journal Entry Rules (P0)

| Event | Journal Entry |
|-------|---------------|
| Issue Invoice (no VAT) | Dr. 1100 AR / Cr. 4xxx Revenue |
| Issue Invoice (with VAT) | Dr. 1100 AR / Cr. 4xxx Revenue + Cr. 2200 Output VAT |
| Receive Payment (bank, no WHT) | Dr. 1020 Bank / Cr. 1100 AR |
| Receive Payment (with WHT) | Dr. 1020 Bank + Dr. 1700 WHT Asset / Cr. 1100 AR |
| Record Expense (cash, no VAT) | Dr. 6xxx Expense / Cr. 1010 Cash |
| Record Expense (with input VAT) | Dr. 6xxx Expense + Dr. 2210 Input VAT / Cr. 1020 Bank |
| Issue Credit Note (P1) | Dr. 4xxx Revenue + Dr. 2200 Output VAT (reversal) / Cr. 1100 AR |

All journal entries are **immutable** — adjustments use new entries (per TFRS).

### 6.6 Reports (P1)

| Report | Period | Format |
|--------|--------|--------|
| Sales Journal | Custom range | xlsx + PDF |
| AR Aging | As of date | 0-30 / 31-60 / 61-90 / >90 buckets |
| Trial Balance | As of date | PDF (Dr/Cr columns) |
| P&L Statement | Month / Quarter / Year | PDF + xlsx |
| Balance Sheet | As of date | PDF + xlsx |
| Cash Flow | Month / Quarter / Year | PDF + xlsx |
| VAT Filing (ภ.พ.30) | Monthly | xlsx — sales + purchase VAT |
| WHT Filing (ภ.ง.ด.53/3) | Monthly | xlsx — WHT paid by customers |

### 6.7 Storage & Sync (P0)

- Supabase PostgreSQL (existing project `lhrzjkizxjigqeuyposw`)
- 5 existing tables + new: `vendor_profiles`, `chart_of_accounts`, `journal_entries`, `expenses`, `credit_notes`, `debit_notes`
- localStorage: settings + draft + history (latest 50 per doc type)
- File attachments (slip, expense receipt): Supabase Storage bucket `billing-attachments` (RLS: service_role only)

### 6.8 PDF Export (P0)

- Re-use existing `html-to-image` + `jsPDF` pattern from `/quotation/`
- A4 portrait for Q/I/R · A4 landscape (P2) for reports
- Multi-page support (already done)
- ⚠️ **Fixed:** `mx-auto` clipping issue resolved (commit a30e12f, May 2026)
- PromptPay QR code on invoice (P1 · use `qrcode.js`)
- Thai font embedded (Sarabun)

### 6.9 Security (P0)

| Surface | Auth | Mitigation |
|---------|------|------------|
| All billing CRUD | service_role key (localStorage) | Admin-only browser · rotate on suspicion |
| Receipts public read | anon role | RLS: SELECT only — for verify use case |
| Supabase Storage (slips) | service_role only | Not public — generate signed URL when share |

### 6.10 P2 (Future)

- **e-Tax Invoice integration with RD** — XML schema, digital signature (cert จาก TIDA), upload to RD server, status callback
- **PromptPay QR per invoice** — encoded amount + reference
- **Recurring billing** — สำหรับ corporate ที่จองคอร์สรายไตรมาส
- **Notion DB sync** — mirror customer + invoice list to Notion for cross-tool access
- **Email auto-delivery** — Supabase Edge Function + Resend, ส่ง invoice PDF + payment link
- **Multi-installment tracking** — 50/50, 30/40/30 schemes — split invoice into milestones
- **Affiliate / Reseller commission** — ค่า commission อัตโนมัติเมื่อจอง course
- **Web hook for payment** — Promptpay slip OCR (LINE bot integration)

---

## 7. Data Model (new + modified tables)

### vendor_profiles (NEW)
```sql
create table vendor_profiles (
  id uuid pk,
  entity_type text,         -- 'individual' | 'company'
  active boolean,
  name text,
  tax_id text,
  address text, phone text, email text,
  bank_name text, bank_account text, bank_account_name text,
  vat_registered boolean,
  vat_rate numeric default 7,
  signature_image_url text,
  signer_name text,
  doc_prefix_quotation text,  -- 'TPL-' or 'TPLC-'
  doc_prefix_invoice text,
  doc_prefix_receipt text,
  doc_prefix_tax_invoice text,
  created_at, updated_at
);
```

### chart_of_accounts (NEW)
```sql
create table chart_of_accounts (
  code text pk,             -- '1010', '4100', etc.
  name_th text, name_en text,
  type text,                -- 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_code text,
  is_active boolean default true,
  created_at
);
```

### journal_entries (NEW)
```sql
create table journal_entries (
  id uuid pk,
  je_no text unique,        -- 'JE-YYMM-NNN'
  entry_date date,
  description text,
  source_type text,         -- 'invoice' | 'payment' | 'expense' | 'manual' | 'credit_note'
  source_id uuid,           -- ref to invoice/expense/etc
  lines jsonb,              -- [{ account_code, debit, credit, description }]
  posted boolean default true,
  created_at, created_by text
);
-- Constraint: sum(debit) = sum(credit) per entry (enforced via trigger)
```

### expenses (NEW)
```sql
create table expenses (
  id uuid pk,
  expense_no text unique,   -- 'EXP-YYMM-NNN'
  expense_date date,
  category text,            -- COA code (e.g., '6100')
  supplier_name text,
  description text,
  amount numeric,
  has_input_vat boolean default false,
  vat_amount numeric default 0,
  payment_method text,
  payment_ref text,
  attachment_url text,
  is_deductible boolean default true,
  notes text,
  created_at
);
```

### credit_notes / debit_notes (P1, NEW — same structure as invoice)

### Modified existing tables
- `customers`: + `entity_type` already there ✓
- `invoices`: + `vendor_profile_id` ref, + `original_invoice_id` (for CN/DN linkage)
- `receipts`: + `doc_type` enum extended

---

## 8. UI Architecture

```
/billing/
├── Sidebar
│   ├── 📊 Dashboard
│   ├── 👥 Customers
│   ├── 📝 Quotations
│   ├── 🧾 Invoices
│   ├── ✅ Receipts
│   ├── ↩  Credit/Debit Notes (P1)
│   ├── 💸 Expenses (P1)
│   ├── 📚 Accounting (P1)
│   │   ├── Chart of Accounts
│   │   ├── Journal Entries
│   │   └── Reports (TB, P&L, BS, CF, VAT, WHT)
│   └── ⚙ Settings
│
└── Top bar
    └── Vendor entity switcher: [บุคคล ▾] / [บริษัท ▾]
```

---

## 9. Success Metrics

### Leading (1-4 weeks post-launch)
- Time to issue Q/I/R: **median < 3 min**, p95 < 5 min
- # docs issued per week: baseline → +50%
- % invoices with auto journal posted: **100%**
- 0 manual journal corrections in first month

### Lagging (3-12 months)
- AR Days outstanding: < 30 days median
- Overdue % of outstanding: < 10%
- Time to produce monthly P&L: < 1 hour (vs ~1 day manual)
- Accounting firm review: ≤ 2 rounds of correction

---

## 10. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | บริษัทที่จะจดทะเบียน ใช้ชื่ออะไร? ทุนจดทะเบียน? | ต้น (business) | Yes — config defaults |
| Q2 | ใช้สำนักบัญชีไหน? เขาต้องการ export format อะไร? | ต้น (admin) | No — default xlsx แล้ว iterate |
| Q3 | เริ่มจด VAT ตั้งแต่วันแรกของบริษัทไหม? (รายได้ > 1.8 ลบ.บังคับจด) | ต้น (business) | Yes — affect doc title logic |
| Q4 | e-Tax Invoice cert ตัวไหน? (TIDA, INET, etc.) | ต้น | No — P2 |
| Q5 | Recurring billing pattern จริงๆ มีกี่ลูกค้า? | Marketing | No — P2 |
| Q6 | จะ migrate ข้อมูลจาก quotation/index.html เก่าไหม? (~3-5 quotation เก่าใน localStorage) | Engineering | No — manual re-entry สั้น |

---

## 11. Timeline & Phasing

### Phase 1 — Foundation (week 1-2) · P0 critical path
1. Schema: vendor_profiles, modified customers/invoices/receipts
2. Entity switcher UI + vendor_snapshot in docs
3. Tax Invoice template (separate from Receipt)
4. PDF clipping fix (✅ done — commit a30e12f)
5. Invoice → Receipt auto-conversion

### Phase 2 — Accounting Core (week 3-4) · P0 partial
6. chart_of_accounts table + UI
7. journal_entries table + auto-post triggers (Invoice / Payment / Expense)
8. expenses table + UI
9. Trial Balance + P&L report (xlsx export)

### Phase 3 — Reports & Compliance (week 5-6) · P1
10. Balance Sheet, Cash Flow report
11. VAT filing (ภ.พ.30) export
12. WHT filing (ภ.ง.ด.53/3) export
13. Credit Note / Debit Note

### Phase 4 — Advanced (P2 · future)
14. e-Tax Invoice (RD integration)
15. PromptPay QR on invoice
16. Recurring billing
17. Email auto-delivery

---

## 12. Action Checklist (สิ่งที่ต้องตัดสินใจ/ทำต่อ)

- [ ] **ต้น** ตอบ Q1 (ชื่อบริษัท + ทุน) — blocking
- [ ] **ต้น** ตอบ Q3 (จะจด VAT day 1 ของบริษัทไหม) — blocking
- [ ] **Engineering** ออกแบบ SQL DDL สำหรับ vendor_profiles + journal_entries (สร้างเป็น migration file)
- [ ] **Engineering** spike: html-to-image + Thai font embed (verify ภาษาไทยใน PDF reports ไม่เพี้ยน)
- [ ] **Design** PDF template สำหรับ Tax Invoice (มี "ฉบับลูกค้า/ORIGINAL", สำเนา)
- [ ] **ต้น** confirm Chart of Accounts default ก่อนกำหนดเป็น schema seed
- [ ] **Engineering** ตรวจสอบ Supabase free tier limits — table size, row count (current free 500MB)

---

© 2026 TONPALEARN · Spec maintained alongside `/billing/index.html`
