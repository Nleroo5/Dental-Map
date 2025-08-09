export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { name, address, lat, lon, competitor_info, density, radius } = req.body || {};
    const system = 'You are a dental market strategist. Write a concise, 3–5 sentence insight for a dental practice based on location, competitor counts, density, reviews and Invisalign status if provided. Keep it friendly, positive, and client-facing.';
    const user = `Practice: ${name}\nAddress: ${address}\nLocation: (${lat}, ${lon})\nRadius: ${radius} miles\nCompetitors: ${competitor_info}\nDensity: ${density}`;

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
      return;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.4,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      const err = await response.text();
      res.status(500).json({ error: 'OpenAI error', details: err });
      return;
    }

    const data = await response.json();
    const insight = data?.choices?.[0]?.message?.content?.trim() ?? 'No insight generated.';
    res.status(200).json({ insight });
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e?.message || e });
  }
}
