// /api/calendar-slots — Returns free/busy slots for a date range
// Uses Google Calendar API + service account
//
// Query: ?from=2026-06-01&to=2026-06-30
//
// Response: { slots: [{ start, end, available: boolean }, ...] }
//
// Setup env vars: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID
//   (see /booking/SETUP.md Step 1)

import { google } from 'googleapis';

// Available slot template — Mon-Fri × 2 sessions
const SLOT_TEMPLATE = [
  { hour: 10, minute: 0, duration: 240 }, // 10:00-14:00 (morning)
  { hour: 14, minute: 0, duration: 240 }, // 14:00-18:00 (afternoon)
];

const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri (0=Sun)

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/calendar.readonly']
  );
}

function generateSlots(from, to) {
  const slots = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    if (WEEKDAYS.includes(cur.getDay())) {
      for (const s of SLOT_TEMPLATE) {
        const slotStart = new Date(cur);
        slotStart.setHours(s.hour, s.minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + s.duration * 60 * 1000);
        slots.push({
          date: slotStart.toISOString().slice(0, 10),
          time: `${String(s.hour).padStart(2,'0')}:${String(s.minute).padStart(2,'0')}`,
          start: slotStart.toISOString(),
          end:   slotEnd.toISOString(),
          duration: s.duration,
          available: true,
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return slots;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const to   = req.query.to   || new Date(Date.now() + 60*24*60*60*1000).toISOString().slice(0, 10);

    const slots = generateSlots(from, to);

    // If no credentials yet — return all slots as available (mock mode)
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return res.status(200).json({
        mode: 'mock',
        note: 'GOOGLE_SERVICE_ACCOUNT_JSON not set — returning all slots as available',
        slots,
      });
    }

    // Query Google Calendar busy times
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    const calId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(from).toISOString(),
        timeMax: new Date(to + 'T23:59:59').toISOString(),
        items: [{ id: calId }],
      },
    });

    const busyPeriods = (freebusy.data.calendars?.[calId]?.busy) || [];

    // Mark slots as busy if overlap with any busy period
    for (const slot of slots) {
      const sStart = new Date(slot.start).getTime();
      const sEnd   = new Date(slot.end).getTime();
      for (const b of busyPeriods) {
        const bStart = new Date(b.start).getTime();
        const bEnd   = new Date(b.end).getTime();
        if (sStart < bEnd && sEnd > bStart) {
          slot.available = false;
          break;
        }
      }
    }

    // Filter past slots
    const now = Date.now();
    const futureSlots = slots.filter(s => new Date(s.start).getTime() > now);

    return res.status(200).json({
      mode: 'live',
      from, to,
      total: futureSlots.length,
      available: futureSlots.filter(s => s.available).length,
      slots: futureSlots,
    });
  } catch (err) {
    console.error('[calendar-slots]', err);
    return res.status(500).json({ error: err.message });
  }
}
