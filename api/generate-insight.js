export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { name, address, lat, lon, competitor_info, density, radius } = req.body || {};
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
      return;
    }
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const system = `You are a concise, upbeat dental market strategist.
Return 3–5 sentences, plain English, client-friendly.
Avoid scare language. Focus on opportunity and differentiation.
Mention Invisalign presence if provided, and suggest a positioning angle.`;

    const user = [
      `Practice: ${name || 'N/A'}`,
      `Address: ${address || 'N/A'}`,
      `Location: (${lat}, ${lon})`,
      `Radius: ${radius} miles`,
      `Competitors: total=${competitor_info?.total ?? 0}, dentists=${competitor_info?.dentists ?? 0}, orthodontists=${competitor_info?.orthodontists ?? 0}`,
      `Invisalign mentions (within set): ${competitor_info?.invisalign_mentions ?? 0}`,
      `Nearest: ${competitor_info?.nearest || 'N/A'}`,
      `Density: ${density}/mi^2`
    ].join('\n');

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.4, max_tokens: 220 })
    });

    if (!r.ok) {
      const err = await r.text();
      res.status(500).json({ error: 'OpenAI error', details: err });
      return;
    }

    const data = await r.json();
    const insight = data?.choices?.[0]?.message?.content?.trim() ?? 'No insight generated.';
    res.status(200).json({ insight });
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e?.message || e });
  }
}

