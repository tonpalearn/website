// /api/confirm-booking — Admin confirms booking → create Calendar event
//
// POST /api/confirm-booking
// Body: { id, action: 'confirm' | 'reject', admin_notes?, rejection_reason? }
//
// On confirm: create Google Calendar event + update booking status
// On reject:  just update status

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function getCalendarAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );
}

async function createCalendarEvent(booking) {
  const auth = getCalendarAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const [hh, mm] = booking.preferred_time.split(':').map(Number);
  const start = new Date(booking.preferred_date);
  start.setHours(hh, mm, 0, 0);
  const end = new Date(start.getTime() + (booking.duration_mins || 240) * 60 * 1000);

  const event = {
    summary: `[BOOKED] ${booking.course_name} · ${booking.customer_name}`,
    description:
      `Booking: ${booking.booking_no}\n` +
      `ลูกค้า: ${booking.customer_name}\n` +
      `โทร: ${booking.customer_phone}\n` +
      `Email: ${booking.customer_email || '-'}\n` +
      `บริษัท: ${booking.customer_company || '-'}\n` +
      `Format: ${booking.format_label}\n` +
      `จำนวน: ${booking.num_attendees} คน\n` +
      `ยอด: ฿${booking.amount?.toLocaleString()}\n` +
      `Slip: ${booking.slip_url || '-'}\n`,
    start: { dateTime: start.toISOString(), timeZone: 'Asia/Bangkok' },
    end:   { dateTime: end.toISOString(),   timeZone: 'Asia/Bangkok' },
    colorId: '11', // red — booked/paid
  };

  const result = await calendar.events.insert({
    calendarId: calId,
    requestBody: event,
  });
  return result.data.id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id, action, admin_notes, rejection_reason } = req.body || {};
    if (!id || !action) return res.status(400).json({ error: 'Missing id or action' });

    const sb = getSupabase();
    const { data: booking, error: fetchErr } = await sb
      .from('bookings').select('*').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    let updates = { admin_notes, updated_at: new Date().toISOString() };

    if (action === 'confirm') {
      // Create Calendar event
      let eventId = null;
      try {
        eventId = await createCalendarEvent(booking);
      } catch (e) {
        console.warn('[calendar-create]', e.message);
      }
      updates.status = 'confirmed';
      updates.confirmed_at = new Date().toISOString();
      updates.calendar_event_id = eventId;
    } else if (action === 'reject') {
      updates.status = 'rejected';
      updates.rejected_at = new Date().toISOString();
      updates.rejection_reason = rejection_reason;
    } else {
      return res.status(400).json({ error: 'action must be confirm or reject' });
    }

    const { data, error } = await sb.from('bookings').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('[confirm-booking]', err);
    return res.status(500).json({ error: err.message });
  }
}
