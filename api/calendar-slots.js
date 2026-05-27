// /api/calendar-slots — Returns hourly free/busy slots for booking
// Uses Google Calendar API + service account
//
// Query params:
//   ?from=YYYY-MM-DD&to=YYYY-MM-DD            range mode (default: today → +60 days)
//   ?date=YYYY-MM-DD                          single day (overrides from/to)
//   &duration=N                               desired duration in hours (default 4)
//   &mode=hourly|block                        slot granularity (default 'hourly')
//   &buffer_hours=N                           buffer required between bookings (default 1)
//
// Response: { mode, from, to, total, available, slots: [{ date, time, start, end, duration, available }] }
//
// Env vars: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID
// (see /booking/SETUP.md Step 1)

import { google } from 'googleapis';

// Daily availability window — when ต้น can teach
const DAY_START_HOUR = 9;   // 09:00
const DAY_END_HOUR   = 19;  // 19:00 (last slot end)
const WEEKDAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat (0=Sun)

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

/**
 * Generate candidate slots — hourly start times in each day's window
 * @param {string} from YYYY-MM-DD
 * @param {string} to   YYYY-MM-DD
 * @param {number} durationHours
 * @param {'hourly'|'block'} mode
 */
function generateSlots(from, to, durationHours, mode) {
  const slots = [];
  const cur = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (cur <= end) {
    if (WEEKDAYS.includes(cur.getDay())) {
      let startHours;
      if (mode === 'block') {
        // Legacy: 10:00 and 14:00 only
        startHours = [10, 14];
      } else {
        // Hourly: every hour from DAY_START to (DAY_END - duration)
        const lastStart = DAY_END_HOUR - durationHours;
        startHours = [];
        for (let h = DAY_START_HOUR; h <= lastStart; h++) startHours.push(h);
      }

      for (const h of startHours) {
        const slotStart = new Date(cur);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationHours * 3600 * 1000);
        slots.push({
          date: cur.toISOString().slice(0, 10),
          time: `${String(h).padStart(2,'0')}:00`,
          start: slotStart.toISOString(),
          end:   slotEnd.toISOString(),
          duration: durationHours * 60,
          duration_hours: durationHours,
          available: true,
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return slots;
}

/**
 * Mark slot unavailable if it overlaps OR sits within `bufferMs` of any busy period
 */
function applyBusyAndBuffer(slots, busyPeriods, bufferMs) {
  for (const slot of slots) {
    const sStart = new Date(slot.start).getTime();
    const sEnd   = new Date(slot.end).getTime();
    for (const b of busyPeriods) {
      const bStart = new Date(b.start).getTime();
      const bEnd   = new Date(b.end).getTime();

      // Direct overlap
      if (sStart < bEnd && sEnd > bStart) {
        slot.available = false;
        slot.reason = 'overlap';
        break;
      }
      // Buffer violation — slot ends too close to busy.start
      if (sEnd > bStart - bufferMs && sStart < bStart) {
        slot.available = false;
        slot.reason = 'buffer_before';
        break;
      }
      // Buffer violation — slot starts too close to busy.end
      if (sStart < bEnd + bufferMs && sEnd > bEnd) {
        slot.available = false;
        slot.reason = 'buffer_after';
        break;
      }
    }
  }
  return slots;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Parse query
    const date = req.query.date;
    const from = date || req.query.from || new Date().toISOString().slice(0, 10);
    const to   = date || req.query.to   || new Date(Date.now() + 60*24*60*60*1000).toISOString().slice(0, 10);
    const durationHours = Math.max(1, Math.min(8, parseInt(req.query.duration) || 4));
    const mode = req.query.mode === 'block' ? 'block' : 'hourly';
    const bufferHours = Math.max(0, Math.min(4, parseFloat(req.query.buffer_hours) ?? 1));
    const bufferMs = bufferHours * 3600 * 1000;

    const slots = generateSlots(from, to, durationHours, mode);

    // Mock mode if no credentials
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const future = slots.filter(s => new Date(s.start).getTime() > Date.now());
      return res.status(200).json({
        slot_mode: mode,
        mode: 'mock',
        duration_hours: durationHours,
        buffer_hours: bufferHours,
        note: 'GOOGLE_SERVICE_ACCOUNT_JSON not set — all slots shown as available',
        from, to, total: future.length, available: future.length,
        slots: future,
      });
    }

    // Query Google Calendar for busy periods
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    const calId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(from + 'T00:00:00').toISOString(),
        timeMax: new Date(to + 'T23:59:59').toISOString(),
        items: [{ id: calId }],
      },
    });
    const busyPeriods = (freebusy.data.calendars?.[calId]?.busy) || [];

    // Apply busy + 1-hour buffer rule
    applyBusyAndBuffer(slots, busyPeriods, bufferMs);

    // Filter past slots (≥ now + 30 min so user has time to book)
    const cutoff = Date.now() + 30 * 60 * 1000;
    const futureSlots = slots.filter(s => new Date(s.start).getTime() > cutoff);

    return res.status(200).json({
      slot_mode: mode,
      mode: 'live',
      duration_hours: durationHours,
      buffer_hours: bufferHours,
      from, to,
      total: futureSlots.length,
      available: futureSlots.filter(s => s.available).length,
      busy_periods: busyPeriods.length,
      slots: futureSlots,
    });
  } catch (err) {
    console.error('[calendar-slots]', err);
    return res.status(500).json({ error: err.message });
  }
}
