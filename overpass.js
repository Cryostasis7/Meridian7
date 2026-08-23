/* Server-side Overpass relay.
   The browser can't call Overpass directly any more — it sits behind
   Cloudflare and its CORS headers are unreliable. This runs on Vercel,
   same origin as the page, so no CORS check applies. */

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.osm.jp/api/interpreter'
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const q = (req.query && req.query.data) || (req.body && req.body.data) || '';
  if (!q) { res.status(400).json({ error: 'Missing the data parameter.' }); return; }
  if (q.length > 4000) { res.status(413).json({ error: 'Query too long.' }); return; }

  const tried = [];
  for (const mirror of MIRRORS) {
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), 45000);
    try {
      const r = await fetch(mirror, {
        method: 'POST',
        signal: stop.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Meridian wallpaper press (single-user, low volume)'
        },
        body: 'data=' + encodeURIComponent(q)
      });
      const text = await r.text();
      clearTimeout(timer);
      if (!r.ok) { tried.push(`${mirror} → HTTP ${r.status}`); continue; }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.status(200).send(text);
      return;
    } catch (e) {
      clearTimeout(timer);
      tried.push(`${mirror} → ${e.name === 'AbortError' ? 'timed out' : e.message}`);
    }
  }
  res.status(502).json({ error: 'Every Overpass mirror refused or timed out.', tried });
};

module.exports.config = { maxDuration: 60 };
