# TONPALEARN · Backoffice · Certificate Generator

> **Module:** `/certificate/` + `/verify/` (paired)
> **Status:** v1 live (May 2026) · ~50KB single file + Supabase-backed
> **Owner:** ต้น (single-admin)
> **Updated:** May 2026

---

## 1. Problem Statement

ผู้เรียนเสร็จคอร์สแล้วต้องการ "ใบรับรอง" เพื่อ:
- ใช้เป็นหลักฐานความรู้ที่เรียนกับ TONPALEARN
- ใส่ใน LinkedIn / portfolio
- แสดงให้นายจ้างเห็น (โดยเฉพาะ corporate ที่ส่งพนักงานมาเรียน)

ปัญหาที่แก้แล้วบางส่วน (v1):
- ✅ ออกใบ A4 landscape สวยงาม · brand consistent
- ✅ Verify ออนไลน์ผ่าน `/verify?id=...`

ปัญหาที่ยังเหลือ:
- ✗ ออกใบทีละใบ — ถ้า corporate batch 20 คน ต้องกดทีละใบ
- ✗ ไม่มี QR code บนใบ — ลูกค้าต้องพิมพ์ URL เอง
- ✗ ไม่ link กับ enrollment ของ billing module (ออกใบไม่ได้ติด customer)
- ✗ ไม่มี email auto-send

---

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | ออกใบรับรอง 1 ใบ ใน < 1 นาที | Median time to issue |
| G2 | ออกแบบ batch สำหรับ corporate (1 คอร์ส → หลายคน) | Batch ≥ 10 ใบใน < 5 นาที |
| G3 | ใบทุกใบ verify ได้จริง 100% (Supabase) | 0 ใบที่ verify ไม่เจอ |
| G4 | QR code on cert → ลูกค้า scan แล้วไป verify ทันที | UX: ไม่ต้องพิมพ์ URL |
| G5 | Link cert ↔ enrollment ↔ customer (CRM) | 100% cert มี customer_id |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Digital signature ตาม PKI | Trust ใช้ Supabase verify เพียงพอ — ไม่ใช่เอกสารราชการ |
| Blockchain-anchored cert | Overkill · cost+complexity ไม่คุ้ม |
| Auto-issue เมื่อ enrollment completed | ต้องการ admin review ก่อนเสมอ (อาจมี edge case) |
| Cert revocation list (CRL) | Edge case · เพิ่มเมื่อจำเป็น |

---

## 4. User Stories

### Admin (ต้น)

- **เป็น Admin** ผมอยากเลือก enrollment ที่ completed → กดออกใบเดียวจบ (auto-fill student, course, dates)
- **เป็น Admin** ผมอยาก batch ออกใบให้ทั้ง class ได้ — upload xlsx ของ student names → preview ทุกใบ → confirm → issue ทั้งหมด
- **เป็น Admin** ผมอยากแก้ student name ก่อน issue (กรณีพิมพ์ผิด)
- **เป็น Admin** ผมอยากเก็บ draft ก่อน issue (Supabase status: draft → issued)
- **เป็น Admin** ผมอยาก reissue ใบที่เคยออกแล้ว (เปลี่ยน format/name — keep history)

### Recipient (ผู้เรียน)

- **เป็นผู้เรียน** ผมอยากได้ PDF ใบรับรองทาง email หลังจบคอร์ส
- **เป็นผู้เรียน** ผมอยาก scan QR บนใบ แล้วไป verify ได้ทันที
- **เป็นผู้เรียน** ผมอยาก share verify URL ใน LinkedIn / resume

### Third Party (HR / employer)

- **เป็น HR** ผมอยากตรวจสอบใบรับรองที่ผู้สมัครแนบมา ว่าจริงไหม → เปิด `/verify?id=...`
- **เป็น HR** ผมอยากเห็นข้อมูล: ชื่อผู้เรียน, course, format, hours, achievement, date, signer

---

## 5. Requirements

### 5.1 Single Cert Issuance (P0 — done)

- ✅ A4 landscape design (1123×794 @ 96dpi)
- ✅ Form: student name TH+EN, course picker, format, hours, achievement, dates, custom message
- ✅ Name style toggle: Script (Great Vibes EN) / Serif (Sarabun supports Thai)
- ✅ Cert No auto-gen `TPL-CERT-YYMM-NNN`
- ✅ Signature image (`assets/signature-ton.png`)
- ✅ Issue button → Supabase upsert
- ✅ Verify at `/verify?id=...`

### 5.2 QR Code on Cert (P0 new)

- เพิ่ม QR code มุมล่างซ้าย (12×12mm) encode `https://tonpalearn.com/verify?id=<cert_no>`
- ใช้ library `qrcode.js` (already in CDN ecosystem)
- Style: gold border รอบ QR ให้ match brand
- Acceptance: scan ด้วย iOS Camera + Android → เปิด verify page ได้

### 5.3 Batch Issuance (P1)

- Upload xlsx with columns: `name_th, name_en, email (optional)`
- Auto-validate row count, required fields, dup check
- Preview grid: thumbnail ของแต่ละใบ
- Bulk action: Issue All / Issue Selected
- Progress bar + cancel mid-batch
- After issue: bulk ZIP download (all PDFs)

### 5.4 Enrollment Link (P0 new — depend on billing v1)

- Form picker: "เลือกจาก enrollment" → autocomplete from `course_enrollments` table
- Auto-fill: student_name, course_num, format, hours, completion_date
- Cert record stores `enrollment_id` + `customer_id` (FK to billing schema)
- Display in customer profile: "ใบรับรอง 3 ใบ" + links

### 5.5 Email Delivery (P1)

- Cert form: input email (auto-fill from customer record)
- "Send via email" toggle on Issue button
- Backend: Supabase Edge Function + Resend (free tier 100 emails/day)
- Email template: brand-consistent · PDF attached + verify link
- Track in `cert_emails` log table

### 5.6 Reissuance (P1)

- "Reissue" button on existing cert
- Original cert kept (status = `superseded`)
- New cert: new cert_no, link `replaces_cert_no` field
- Verify page shows both: "ใบนี้ถูกออกใหม่แทนใบ TPL-CERT-2604-001"

### 5.7 Verify Page Enhancement (P0 partial)

- ✅ Current: read `?id=...`, fetch, display
- New: display QR code that re-encodes the same URL (for sharing)
- New: show TONPALEARN brand identity (logo, palette)
- New: anti-fraud disclaimer — "หลักฐานนี้ออกโดย Supabase database · ปลอมแปลงไม่ได้ผ่าน URL"
- P2: shareable image (download verified card as PNG/JPG)

### 5.8 Admin Dashboard (P1)

- Recent cert issuances (last 30 days)
- Per-course cert count
- Cert verification count (P2 — need analytics)
- Search by student name / cert_no / course

---

## 6. Data Model

### Existing: `certificates` table (no change needed for P0)
- Already has all needed fields (cert_no, student_name, course details, signer info, dates)

### New fields (Phase 2)
```sql
alter table certificates add column enrollment_id uuid references course_enrollments(id);
alter table certificates add column customer_id uuid references customers(id);
alter table certificates add column email_sent_at timestamptz;
alter table certificates add column replaces_cert_no text;       -- for reissuance
alter table certificates add column status text default 'issued'; -- draft|issued|superseded|revoked
alter table certificates add column qr_data text;                -- pre-computed QR payload
```

### New: `cert_emails` (P1)
```sql
create table cert_emails (
  id uuid pk,
  cert_no text references certificates(cert_no),
  to_email text,
  sent_at timestamptz,
  status text,           -- pending|sent|bounced|failed
  resend_id text,        -- Resend message ID
  notes text
);
```

---

## 7. UI Flow

### Single Issue
```
[Form panel]            [Preview panel]
  ↓                       ↑ live update
1. Pick enrollment        Show A4 landscape preview
   OR fill manually       (zoom 50-120%)
2. Verify all fields
3. Click "Issue"
   → POST Supabase
   → Show success toast + verify URL
   → Download PDF
```

### Batch Issue
```
1. Upload xlsx
2. Preview grid (thumbnail × N)
3. Validate (highlight errors)
4. "Issue All" → Progress bar
5. On done: ZIP download + email log
```

---

## 8. Success Metrics

### Leading
- Cert issue time: median < 1 min single, < 5 min for batch of 10
- % of issued certs with valid verify: 100%
- Email delivery rate (P1): > 95%

### Lagging
- Verify page visits per cert: track over 90 days
- Re-engagement (verify visitor → LINE inquiry): track
- Re-enrollment rate (had cert → bought another course): 30%+

---

## 9. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | Batch cert: ใครเป็นคน upload xlsx? format เป็นยังไง? | ต้น/admin | No — design generic |
| Q2 | Email cert: ใช้ Resend ฟรี (100/day) พอไหม? ถ้าไม่พอ → upgrade or alt provider | Eng | No — start free |
| Q3 | QR code: encode cert_no อย่างเดียว หรือ embed hash signature? | Security | No — start simple |
| Q4 | Revocation: scenario คือยังไง? เคยมีไหม? | ต้น | No — P2 |

---

## 10. Timeline

### Phase 1 (week 1)
1. ✅ Single cert (done)
2. Add QR code to cert layout
3. Link to enrollment (depends on billing v1)

### Phase 2 (week 2-3)
4. Batch issuance
5. Reissuance flow
6. Email delivery

### Phase 3 (P2)
7. Shareable verify card
8. Analytics on verify page

---

## 11. Action Checklist

- [ ] **Engineering** เพิ่ม `qrcode.js` ใน CDN + วาง QR ที่มุมล่างซ้าย
- [ ] **Design** กำหนดตำแหน่ง+ขนาด QR ให้ไม่ชน frame
- [ ] **Engineering** add 6 new columns to `certificates` table (migration)
- [ ] **ต้น** เตรียม xlsx template สำหรับ batch (ตัวอย่าง)
- [ ] **Engineering** spike Resend integration (Edge Function)
- [ ] **Design** PDF email template

---

© 2026 TONPALEARN
