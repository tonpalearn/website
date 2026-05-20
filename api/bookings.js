// /api/bookings — Create + retrieve booking
//
// POST   /api/bookings           — create new booking
// GET    /api/bookings?id=xxx    — get by id
// PATCH  /api/bookings?id=xxx    — update (admin: confirm/reject)
//
// Setup env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, LINE_NOTIFY_TOKEN (optional)

import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key, { auth: { persistSession: false } });
}

function genBookingNo(existing = 0) {
  const now = new Date();
  const yymm = String(now.getFullYear()).slice(2) + String(now.getMonth()+1).padStart(2,'0');
  return `BOOK-${yymm}-${String(existing + 1).padStart(3,'0')}`;
}

async function notifyLine(message) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) return;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    });
  } catch (e) {
    console.warn('[line-notify]', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sb = getClient();

    // GET by id
    if (req.method === 'GET') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { data, error } = await sb.from('bookings').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(data);
    }

    // POST — create new
    if (req.method === 'POST') {
      const body = req.body || {};

      // Generate booking number
      const { count } = await sb.from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      const bookingNo = genBookingNo(count || 0);

      const payload = {
        booking_no:      bookingNo,
        status:          'pending_payment',
        customer_name:   body.customer_name,
        customer_email:  body.customer_email || null,
        customer_phone:  body.customer_phone,
        customer_company: body.customer_company || null,
        course_num:      body.course_num,
        course_name:     body.course_name,
        format:          body.format,
        format_label:    body.format_label,
        hours:           body.hours,
        num_attendees:   body.num_attendees || 1,
        preferred_date:  body.preferred_date,
        preferred_time:  body.preferred_time,
        duration_mins:   body.duration_mins || 240,
        amount:          body.amount,
      };

      const { data, error } = await sb.from('bookings').insert(payload).select().single();
      if (error) throw error;

      await notifyLine(
        `🆕 Booking ใหม่: ${bookingNo}\n` +
        `${body.customer_name} (${body.customer_phone})\n` +
        `${body.course_name} · ${body.format_label}\n` +
        `📅 ${body.preferred_date} ${body.preferred_time}\n` +
        `💰 ฿${body.amount?.toLocaleString()}\n` +
        `Status: pending_payment`
      );

      return res.status(200).json(data);
    }

    // PATCH — update (slip upload, admin confirm/reject)
    if (req.method === 'PATCH') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const updates = { ...req.body, updated_at: new Date().toISOString() };

      const { data, error } = await sb.from('bookings').update(updates).eq('id', id).select().single();
      if (error) throw error;

      // Notify on slip upload
      if (updates.slip_url) {
        await notifyLine(
          `📎 Slip uploaded: ${data.booking_no}\n` +
          `${data.customer_name} · ฿${data.amount?.toLocaleString()}\n` +
          `Review: https://tonpalearn.com/booking/admin?id=${data.id}`
        );
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[bookings]', err);
    return res.status(500).json({ error: err.message });
  }
}
