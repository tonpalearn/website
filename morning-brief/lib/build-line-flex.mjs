#!/usr/bin/env node
// Build a LINE Flex *carousel* (full brief) from the morning-brief data JSON.
// Usage: node build-line-flex.mjs /tmp/mb-data.json  > /tmp/mb-line-flex.json
// Deterministic transform — no model authoring needed at run time, so the whole
// publish+notify step stays a single allow-listed command (no permission prompts).

import { readFileSync } from "node:fs";

const DARK = "#08080F";
const GOLD = "#F5D67A";
const CYAN = "#67E8F9";
const ORANGE = "#C2410C";
const MUTE = "#888888";
const INK = "#1A1A1A";

const path = process.argv[2];
if (!path) {
  console.error("usage: build-line-flex.mjs <data.json>");
  process.exit(1);
}
const d = JSON.parse(readFileSync(path, "utf8"));

const THAI_DOW = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
const THAI_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
function thaiDate(iso) {
  const [y, m, day] = (iso || "").split("-").map(Number);
  if (!y) return iso || "";
  const dt = new Date(Date.UTC(y, m - 1, day));
  return `${THAI_DOW[dt.getUTCDay()]} · ${day} ${THAI_MON[m - 1]} ${y}`;
}

const txt = (text, o = {}) => ({ type: "text", text: String(text), wrap: true, ...o });
const sep = (o = {}) => ({ type: "separator", ...o });
const header = (title, subtitle) => ({
  type: "box", layout: "vertical", backgroundColor: DARK, paddingAll: "16px",
  contents: [
    txt(title, { color: GOLD, size: "sm", weight: "bold" }),
    ...(subtitle ? [txt(subtitle, { color: CYAN, size: "xs", margin: "xs" })] : []),
  ],
});
const bubble = (head, bodyContents) => ({
  type: "bubble", size: "mega",
  header: head,
  body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "16px", contents: bodyContents },
});

const events = d.today_events || [];
const emails = d.emails || [];
const taskGroups = d.task_groups || [];
const news = d.news || {};
const bubbles = [];

// ---- Card 1: Today ---------------------------------------------------------
const firstLeave = events.find((e) => e.travel && e.travel.leave_at)?.travel?.leave_at;
const wx = d.weather ? `${d.weather.icon || ""} ${d.weather.summary || ""}`.trim() : "";
const todayBody = [
  txt(`${events.length} นัดวันนี้${firstLeave ? ` · ออกบ้าน ${firstLeave}` : ""}`, { weight: "bold", size: "sm", color: INK }),
  sep(),
];
if (events.length === 0) {
  todayBody.push(txt("วันนี้ไม่มีนัด — ใช้เคลียร์งานที่ค้างได้เต็มที่", { size: "sm", color: MUTE }));
}
for (const e of events) {
  const time = e.time_end ? `${e.time_start}–${e.time_end}` : e.time_start;
  const line = [txt(`${time} · ${e.title}`, { size: "sm", weight: "bold" })];
  if (e.location) line.push(txt(`📍 ${e.location}`, { size: "xs", color: MUTE }));
  if (e.travel && e.travel.leave_at) line.push(txt(`🚗 ออก ${e.travel.leave_at}${e.travel.from_label ? ` จาก${e.travel.from_label}` : ""}`, { size: "xs", color: ORANGE }));
  else if (e.notes) line.push(txt(e.notes, { size: "xs", color: MUTE }));
  todayBody.push({ type: "box", layout: "vertical", spacing: "xs", contents: line });
}
todayBody.push(sep({ margin: "sm" }));
todayBody.push(txt(emails.length ? `📧 ${emails.length} email สำคัญ — ดูการ์ดถัดไป` : "📧 ไม่มี email สำคัญค้าง", { size: "xs", color: MUTE }));
bubbles.push(bubble(header("🌅 MORNING BRIEF", `${thaiDate(d.date)}${wx ? ` · ${wx}` : ""}`), todayBody));

// ---- Card 2: Emails (only if any) -----------------------------------------
if (emails.length) {
  const eb = [];
  for (const m of emails.slice(0, 4)) {
    eb.push({ type: "box", layout: "vertical", spacing: "xs", contents: [
      txt(`${m.from_name || m.from || ""}${m.importance === "high" ? " 🔴" : ""}`, { size: "xs", color: ORANGE, weight: "bold" }),
      txt(m.subject || "(no subject)", { size: "sm", weight: "bold" }),
      ...(m.snippet ? [txt(m.snippet, { size: "xs", color: MUTE })] : []),
    ]});
    eb.push(sep({ margin: "sm" }));
  }
  eb.pop();
  bubbles.push(bubble(header("📧 EMAIL สำคัญ", `${emails.length} ฉบับ · มีร่างตอบในเว็บ`), eb));
}

// ---- Card 3: Reminders + next days ----------------------------------------
const rb = [];
const reminders = d.reminders || [];
if (reminders.length) {
  rb.push(txt("🔔 เตือนล่วงหน้า", { weight: "bold", size: "sm", color: INK }));
  for (const r of reminders) rb.push(txt(`• [${r.when_label || r.due || ""}] ${r.title}`, { size: "sm" }));
}
for (const nd of d.next_days || []) {
  rb.push(sep({ margin: "sm" }));
  rb.push(txt(nd.date_label || nd.date, { weight: "bold", size: "sm", color: INK }));
  if (!(nd.events || []).length) rb.push(txt("• ว่าง", { size: "sm", color: MUTE }));
  for (const e of nd.events || []) rb.push(txt(`• ${e.time_start} ${e.title}${e.location ? ` @ ${e.location}` : ""}`, { size: "sm" }));
}
if (rb.length) bubbles.push(bubble(header("🔔 เตือน · ล่วงหน้า", "พรุ่งนี้ → มะรืน"), rb));

// ---- Card 4: Tasks ---------------------------------------------------------
const STATUS_ICON = { "In Progress": "🟡", "Waiting": "⏸️", "Pending": "⏸️", "To Do": "⬜", "Done": "✅" };
const tb = [];
let taskCount = 0;
for (const g of taskGroups) {
  const tasks = g.tasks || [];
  if (!tasks.length) continue;
  tb.push(txt(g.source_label || g.source || "Tasks", { weight: "bold", size: "xs", color: ORANGE }));
  for (const t of tasks) {
    taskCount++;
    const icon = t.overdue ? "🔴" : (STATUS_ICON[t.status] || "⬜");
    tb.push(txt(`${icon} ${t.title}${t.due ? ` (${t.due})` : ""}`, { size: "sm" }));
  }
  tb.push(sep({ margin: "sm" }));
}
if (tb.length) { tb.pop(); bubbles.push(bubble(header(`✅ TASKS ค้าง · ${taskCount}`, "งานที่ยังไม่ปิด"), tb)); }

// ---- Cards 5-7: News -------------------------------------------------------
const newsCard = (key, emoji, label) => {
  const items = news[key] || [];
  if (!items.length) return null;
  const nb = [];
  for (const n of items.slice(0, 3)) {
    nb.push({ type: "box", layout: "vertical", spacing: "xs", contents: [
      txt(`${n.source ? `[${n.source}] ` : ""}${n.title}`, { size: "sm", weight: "bold" }),
      ...(n.why_matters ? [txt(`↳ ${n.why_matters}`, { size: "xs", color: MUTE })]
        : n.summary ? [txt(n.summary, { size: "xs", color: MUTE })] : []),
    ]});
  }
  return { nb, label, emoji };
};
const aiCard = newsCard("ai", "📰", "ข่าว AI");
const healthCard = newsCard("health", "🧬", "ข่าว Health / Longevity");
const worldCard = newsCard("world", "🌏", "ข่าวโลก / เศรษฐกิจ");
if (aiCard) bubbles.push(bubble(header(`${aiCard.emoji} ${aiCard.label}`, "AI / เทคโนโลยี"), aiCard.nb));
if (healthCard) bubbles.push(bubble(header(`${healthCard.emoji} ${healthCard.label}`, "สุขภาพ / ชะลอวัย"), healthCard.nb));
if (worldCard) {
  worldCard.nb.push(sep({ margin: "md" }));
  worldCard.nb.push({ type: "button", style: "primary", color: "#E6B84B", height: "sm",
    action: { type: "uri", label: "เปิด Full Brief บนเว็บ", uri: "https://tonpalearn.com/morning-brief/" } });
  bubbles.push(bubble(header(`${worldCard.emoji} ${worldCard.label}`, "โลก / ตลาด / ไทย"), worldCard.nb));
} else {
  // ensure the web button exists somewhere
  const last = bubbles[bubbles.length - 1];
  last.body.contents.push(sep({ margin: "md" }));
  last.body.contents.push({ type: "button", style: "primary", color: "#E6B84B", height: "sm",
    action: { type: "uri", label: "เปิด Full Brief บนเว็บ", uri: "https://tonpalearn.com/morning-brief/" } });
}

// LINE carousel hard limit = 12 bubbles
const carousel = { type: "carousel", contents: bubbles.slice(0, 12) };

let alt = `🌅 Morning Brief — ${thaiDate(d.date)} · ${events.length} นัด${firstLeave ? ` · ออก ${firstLeave}` : ""} · ${emails.length} email · ${taskCount} tasks`;
if (alt.length > 395) alt = alt.slice(0, 395) + "…";

process.stdout.write(JSON.stringify({ type: "flex", altText: alt, contents: carousel }));
