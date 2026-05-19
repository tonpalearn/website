# 🎨 TONPALEARN — Image Prompt สำหรับ Course 12 Cover

> **Use:** Placeholder cover image สำหรับ `assets/covers/course-12.jpg`
> **Aspect:** 1:1 (square) · ใช้ใน Course card หน้า landing page
> **Save path:** `/06_Website/live/assets/covers/course-12.jpg`
> **Recommended tool:** Midjourney v6 / Imagen 4 / Flux / DALL·E 3

---

## 🎨 Brand CI

| Element | ค่า |
|---|---|
| **Background base** | Deep ink black `#08080F` → `#0D0D14` |
| **Primary accent** | Premium gold — `#F5D67A`, `#E6B84B`, `#C8A84B` |
| **Secondary accent** | Cyan-teal — `#67E8F9`, `#2DD4BF`, `#14B8A6` |
| **Tertiary accent** | Soft violet — `#A78BFA`, `#7C5CFC` |
| **Mood** | Premium · Authoritative · Analytical · Trustworthy · Corporate |
| **Style** | Cinematic 3D render + clean geometric · executive aesthetic |
| **NO text in image** (เพราะมี text overlay จาก code อยู่แล้ว) |

---

## 📌 Universal Style Header (paste before each prompt)

```
Premium dark-themed corporate editorial visual, deep black background #08080F
with subtle gradient mesh of soft violet #7C5CFC, gold #E6B84B and cyan-teal
#2DD4BF, cinematic studio lighting, sharp focus, high contrast, ultra-detailed
3D render, luxury executive aesthetic, centered subject, soft volumetric glow,
shallow depth of field, 8K resolution, square 1:1 aspect ratio, no text, no
logo, no watermark, no UI labels
```

---

## 🔍 Course 12 · AI Agentic for IT Audit & Consult

> **Concept:** AI Agent ช่วยงาน IT Auditor / Consultant — ตรวจสอบ, วิเคราะห์, สร้าง dashboard
> **Save as:** `assets/covers/course-12.jpg`
> **Mood:** trust + analytical + executive — น่าเชื่อถือสไตล์ Big4

### Prompt A — Magnifying intelligence (Recommended)
```
[universal style header above]

A premium translucent glass magnifying glass floating in a dark void,
its lens revealing a glowing network of data nodes and audit checkmarks
inside (cyan-teal #2DD4BF lines connecting verified gold #E6B84B
checkmark icons). Outside the lens, soft violet #A78BFA particles
drift like floating documents. The magnifying glass has a polished
gold #C8A84B rim that catches the studio light. Cinematic depth,
executive luxury aesthetic, sense of intelligent inspection,
trustworthy authority — feels like a Big4 audit firm's brand visual
```

### Prompt B — Verified shield + AI core
```
[universal style header above]

A translucent geometric shield floating in deep black space, its surface
made of interlocking hexagonal cells each glowing with a tiny gold
#E6B84B checkmark. At the center of the shield, a soft pulsing violet
#7C5CFC orb representing the AI core. Cyan-teal #2DD4BF data streams
flow into the shield from all sides like audit evidence being verified.
Premium 3D render, governance + compliance feel, dramatic key light
from upper-left, executive trust aesthetic
```

### Prompt C — Audit dashboard transformation
```
[universal style header above]

Three floating translucent glass panels arranged in a fanned curve in
dark space — leftmost panel shows messy raw data lines (chaotic, cyan
#2DD4BF tangles), center panel shows organized charts and bar graphs
glowing gold #E6B84B, rightmost panel shows a clean dashboard with
green checkmarks and violet #A78BFA insight callouts. A soft gold light
beam connects all three panels left-to-right showing transformation
from raw → analyzed → reported. Premium executive aesthetic, sense of
AI-powered audit workflow
```

**Negative prompt:** `text, letters, numbers, logos, watermark, UI elements, faces, people, low quality, blurry, oversaturated, neon colors, cartoon, illustration, paper documents, office desk, cliché magnifying glass on paper`

---

## 🛠️ Tool-specific Adjustments

### Midjourney v6
```
[Prompt A] --ar 1:1 --style raw --stylize 250 --quality 2 --no text logo watermark
```

### Imagen 4 / Gemini Image
- ใช้ prompt ตรง ๆ ได้ — ระบุ "square 1:1" + "no text" ในประโยค
- เหมาะ photorealistic > stylized

### DALL·E 3
- เน้นรายละเอียดเชิงพรรณนา ไม่ต้องใส่ technical params
- ระบุ "1:1 square format" ในประโยค

### Flux / SDXL
- ใช้ negative prompt block แยก
- เพิ่ม `(high detail:1.3), (cinematic lighting:1.2), (premium executive:1.1)` weights

---

## ✅ Quality Checklist (ก่อน save)

- [ ] Background ดำลึก (#08080F-ish) — ไม่ใช่เทาอ่อน
- [ ] Gold accent ชัดเจน แต่ไม่จัด — premium ไม่ใช่ flashy
- [ ] Teal + violet เป็น secondary — ไม่กลบ gold
- [ ] **Mood: executive/analytical/trustworthy** — ไม่ใช่ playful หรือ techy เกินไป
- [ ] ไม่มี text/logo/watermark ในภาพ
- [ ] Aspect 1:1 จริง (1024x1024 ขั้นต่ำ)
- [ ] กลมกลืนกับการ์ดคอร์สอื่น (เปรียบเทียบกับ course-10.jpg / course-11.jpg)
- [ ] Image weight < 300 KB หลัง compress (ใช้ TinyPNG หรือ Squoosh)

---

## 📝 Pricing Course 12 (ปัจจุบัน)

**Quote-based ทุก format** — niche audience (IT Auditor + Consultant) เน้นขาย Corporate

| # | คอร์ส | เวลา | VDO | Online Group | Online 1:1 | On-site |
|---|---|---|---|---|---|---|
| 12 | AI Agentic for IT Audit & Consult | 4 ชม. | Quote | Quote | Quote | Quote |

> ตัดสินใจราคา + อัปเดต `/AI Course/PRICING.xlsx` master เมื่อพร้อม (ปัจจุบัน synced ใน PRICING.md v3.3)
