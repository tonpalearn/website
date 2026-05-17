# 🎨 TONPALEARN — Image Prompts สำหรับ Course 10 + 11 Cover

> **Use:** Placeholder cover images สำหรับ `assets/covers/course-10.jpg` และ `course-11.jpg`
> **Aspect:** 1:1 (square) · ใช้ใน Course card หน้า landing page
> **Save path:** `/06_Website/live/assets/covers/course-10.jpg` และ `course-11.jpg`
> **Recommended tool:** Midjourney v6 / Imagen 4 / Flux / DALL·E 3

---

## 🎨 Brand CI (ใช้ใน prompt ทุกตัว)

| Element | ค่า |
|---|---|
| **Background base** | Deep ink black `#08080F` → `#0D0D14` |
| **Primary accent** | Premium gold — `#F5D67A`, `#E6B84B`, `#C8A84B` |
| **Secondary accent** | Cyan-teal — `#67E8F9`, `#2DD4BF`, `#14B8A6` |
| **Tertiary accent** | Soft violet — `#A78BFA`, `#7C5CFC` |
| **Mood** | Premium · Futuristic · Sophisticated · Dark luxury |
| **Style** | Cinematic 3D render + subtle abstract geometry |
| **NO text in image** (เพราะมี text overlay จาก code อยู่แล้ว) |

---

## 📌 Universal Style Header (paste before each prompt)

```
Premium dark-themed editorial product visual, deep black background #08080F with
subtle gradient mesh of soft violet #7C5CFC, gold #E6B84B and cyan-teal #2DD4BF,
cinematic studio lighting, sharp focus, high contrast, ultra-detailed 3D render,
luxury minimalist composition, centered subject, soft volumetric god rays,
shallow depth of field, 8K resolution, square 1:1 aspect ratio, no text, no logo,
no watermark, no UI elements
```

---

## 🎼 Course 10 · AI Agentic Orchestra

> **Concept:** Multi-Agent Orchestration — AI หลายตัวทำงานเป็นทีมเหมือนวงออเคสตรา
> **Save as:** `assets/covers/course-10.jpg`

### Prompt A — Conductor metaphor (Recommended)
```
[universal style header above]

A glowing translucent crystalline conductor's baton floating in a dark void,
surrounded by 6-8 orbiting holographic spheres each representing an AI agent,
connected by thin luminous gold #E6B84B lines forming an elegant network,
soft violet #A78BFA inner glow radiating from the central baton,
small particles of cyan-teal #2DD4BF light streaming between the spheres,
geometric harmony, conducted symphony of light, sense of orchestrated motion,
cinematic depth, ultra-premium luxury aesthetic, futuristic but timeless
```

### Prompt B — Network constellation
```
[universal style header above]

An intricate 3D constellation of glowing nodes connected by golden #E6B84B
threads, central larger node pulsing with soft violet #7C5CFC light,
peripheral nodes glowing in cyan-teal #2DD4BF, all suspended in deep black space,
threads form an elegant orchestral pattern like sheet music in 3D,
soft volumetric haze, depth of field, premium sci-fi editorial aesthetic
```

### Prompt C — Abstract harmony
```
[universal style header above]

Multiple translucent gold-tinted geometric shapes (cubes, spheres, prisms)
arranged in concentric harmonious circles around a central glowing core,
each shape emitting soft light in gold, teal, or violet, connected by
thin gold ribbons of light, suggesting orchestrated collaboration,
cinematic dark luxury, dramatic side lighting from gold key + violet rim
```

**Negative prompt:** `text, letters, numbers, logos, watermark, UI elements, faces, people, low quality, blurry, oversaturated, neon colors, cartoon, illustration`

---

## 🎬 Course 11 · AI Content Creator System

> **Concept:** AI Content workflow — YouTube/TikTok creator system
> **Save as:** `assets/covers/course-11.jpg`

### Prompt A — Cinematic camera + AI flow (Recommended)
```
[universal style header above]

A premium modern cinema camera lens viewed from front-3/4 angle, glowing
from inside with warm gold #E6B84B light, surrounded by floating translucent
video frame thumbnails arranged in a flowing curved pipeline, each frame
emitting soft cyan-teal #2DD4BF edge light, subtle violet #A78BFA particles
drifting in the dark space, depth of field with bokeh, premium product
photography style, dramatic studio lighting, luxury creator aesthetic,
sense of automated content flow
```

### Prompt B — Floating play button + waveform
```
[universal style header above]

A large glass-like play button floating in deep black space, glowing with
gold #E6B84B inner light, surrounded by an orbiting audio waveform of
cyan-teal #2DD4BF light, soft violet #A78BFA glow halo behind,
small floating video thumbnail rectangles arranged in 3D space like petals,
premium glassmorphism, cinematic god rays, ultra-modern content creator vibe
```

### Prompt C — Studio lights + AI pipeline
```
[universal style header above]

Two slim modern studio softboxes glowing with warm gold #E6B84B light
illuminating a translucent glass pipeline / flow chart of content stages,
each stage marker glowing in different color (gold, teal, violet),
flowing left-to-right in elegant curve, deep black studio backdrop,
luxury product photography, cinematic depth, premium creator studio aesthetic
```

**Negative prompt:** `text, letters, numbers, logos, watermark, UI elements, faces, people, low quality, blurry, oversaturated, neon colors, cartoon, illustration, social media icons`

---

## 🛠️ Tool-specific Adjustments

### Midjourney v6
- เพิ่มที่ท้าย prompt: `--ar 1:1 --style raw --stylize 250 --quality 2`
- ใช้ `--no text, logo, watermark` แทน negative prompt

### Imagen 4 / Gemini Image
- ใช้ prompt ตรงๆ ได้ ระบุ "square 1:1" + "no text"
- เหมาะกับ photorealistic > stylized

### DALL·E 3
- เน้นรายละเอียดเชิงพรรณนา ไม่ต้องใส่ technical params
- ระบุ "1:1 square format" ในประโยค

### Flux / SDXL
- ใช้ negative prompt block แยก
- เพิ่ม `(high detail:1.3), (cinematic lighting:1.2), (premium luxury:1.1)` weights

---

## ✅ Quality Checklist (ก่อน save)

- [ ] Background ดำลึก (#08080F-ish) — ไม่ใช่เทาอ่อน
- [ ] Gold accent ชัดเจน แต่ไม่จัด — luxury ไม่ใช่ casino
- [ ] Teal + violet เป็น secondary — ไม่กลบ gold
- [ ] ไม่มี text/logo/watermark ในภาพ
- [ ] Aspect 1:1 จริง (1024x1024 ขั้นต่ำ)
- [ ] โทนกลมกลืนกับการ์ดคอร์สอื่นใน landing (เปรียบเทียบกับ course-02.jpg / course-03.jpg)
- [ ] Image weight < 300 KB หลัง compress (ใช้ TinyPNG หรือ Squoosh)

---

## 📝 Pricing Course 10 + 11 (FINALIZED · 17 พ.ค. 2569)

**Tier ใหม่: 4-hour advanced premium**

| # | คอร์ส | เวลา | VDO | Online Group | Online 1:1 | On-site |
|---|---|---|---|---|---|---|
| 10 | AI Agentic Orchestra        | 4 ชม. | ฿3,500 | ฿4,500 | ฿6,000 | ฿9,000 |
| 11 | AI Content Creator System  | 4 ชม. | ฿3,500 | ฿4,500 | ฿6,000 | ฿9,000 |

✅ Synced:
- `/AI Course/COURSES.md` v7.1
- `/AI Course/PRICING.md` v3.2
- `/AI Business/00_Reference/COURSES.md` (copy)
- `/AI Business/00_Reference/PRICING.md` (copy)
- `/AI Business/06_Website/live/index_v2.html` (landing)

⚠️ **ยังไม่ sync:**
- `PRICING.xlsx` — ต้องเปิด Excel แก้เอง แล้ว export กลับ md (เป็น Master Source)
- Notion 📦 Course Package
- Landing page เดิม `index.html` (เก็บไว้ — ใช้ v2)
