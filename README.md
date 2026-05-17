# TONPALEARN · Website

เว็บไซต์หลักของ **TONPALEARN** — สอน AI ใช้งานได้จริงสำหรับคนทั่วไป
สอนโดยต้น (Toni) · วิศวกรคอมพิวเตอร์ · PM 15 ปี

🌐 **Live:** https://tonpalearn.vercel.app
🚀 **Deploy:** Vercel · auto-deploy on push to `main`

---

## 📁 Structure

```
.
├── index.html                       # Main landing page (v2 — May 2026)
├── index-v1.html                    # Previous version (Apr 2026, archive)
├── assets/                          # Images, covers, brand
├── quotation/                       # Quotation generator (A4 PDF/PNG)
├── amway-2026/                      # Amway 2026 event page
├── chaiwat/                         # Personal page (ต้น)
├── name-list/                       # Name list utility
├── IMAGE_PROMPTS_COURSE_10_11.md    # AI image prompts สำหรับ Course 10+11 cover
└── README.md                        # นี่
```

---

## 🎓 Courses (11)

| # | Course | เวลา | Pre-req |
|---|---|---|---|
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

**Formats:** VDO · Online Group · Online 1:1 · On-site

---

## 🎨 Brand Identity

- **Palette:** Dark ink (`#08080F`) + Gold (`#E6B84B`) + Teal (`#2DD4BF`) + Violet (`#A78BFA`)
- **Fonts:** Space Grotesk (display) + IBM Plex Sans Thai / Sarabun (body)
- **Tagline:** "AI ง่ายขึ้น เมื่อมีต้นพาไป"

---

## 🛠️ Sub-apps

### Quotation Generator (`/quotation/`)
Web app สร้างใบเสนอราคา A4 — pick จาก course catalog, edit ราคา, export PDF/PNG
- ใส่ข้อมูลผู้เสนอใน Settings ก่อนใช้ครั้งแรก (เก็บ localStorage)
- ยังไม่ deploy production — เปิดผ่าน local file หรือ static host

---

## 🚀 Deploy

**Vercel** auto-deploy จาก branch `main` — ทุก push → build + publish ภายใน ~2 นาที
Production: https://tonpalearn.vercel.app

```bash
# Local preview
python3 -m http.server 8000
# → http://localhost:8000
```

---

## 📝 License

© 2026 TONPALEARN · All rights reserved
Course materials and brand assets are not for redistribution.
