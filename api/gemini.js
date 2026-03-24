module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: { message: 'GEMINI_API_KEY tidak ditemukan di Vercel' }});
  }

  // gemini-2.0-flash: lebih cepat, tidak timeout di serverless
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) {}
    }
    if (!payload || !payload.contents) {
      return res.status(400).json({ error: { message: 'Request body tidak valid' }});
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!text || text.trim() === '') {
      return res.status(500).json({ error: { message: 'Empty response dari Gemini API' }});
    }

    let data;
    try { data = JSON.parse(text); }
    catch(e) { return res.status(500).json({ error: { message: 'Response Gemini bukan JSON valid' }}); }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message }});
  }
};
