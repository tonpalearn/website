// /api/sb-admin-config — returns Supabase admin config to /admin page
// Gated by `x-admin-pass` header against process.env.ADMIN_PASS
//
// Vercel env vars required:
//   - SUPABASE_URL          (already set for /booking)
//   - SUPABASE_SERVICE_KEY  (already set for /booking)
//   - ADMIN_PASS            (NEW — set this for tonpalearn admin auth)

export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const expectedPass = process.env.ADMIN_PASS;
  const providedPass = req.headers['x-admin-pass'] || req.query.pass;

  if (!expectedPass) {
    return res.status(503).json({
      error: 'server_not_configured',
      message: 'ADMIN_PASS env var not set in Vercel'
    });
  }

  if (!providedPass || providedPass !== expectedPass) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    return res.status(503).json({
      error: 'supabase_not_configured',
      message: 'SUPABASE_URL or SUPABASE_SERVICE_KEY missing in Vercel env'
    });
  }

  // Add CORS headers (same-origin only is fine here, but explicit doesn't hurt)
  res.setHeader('Cache-Control', 'no-store');
  res.json({ url, serviceKey });
}
