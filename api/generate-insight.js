export default async function handler(req, res) {
  const allowed = [
    'https://www.establishedshot.com',
    'https://dental-map.vercel.app',
    'https://map.establishedshot.com'
  ];
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { 
      name, 
      address, 
      lat, 
      lon, 
      radius, 
      territory_analysis 
    } = req.body || {};
    
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const system = `You are an elite dental market strategist and territory analyst for Established Shot's Territory Intelligence & ROI Engine™.

Your role is to provide compelling, data-driven territory analysis that:
1. Builds credibility through specific market insights
2. Creates urgency around territory locking
3. Demonstrates clear ROI and competitive advantage
4. Uses confident, authoritative language that closes deals

Keep responses to 4-6 sentences. Focus on opportunity, competitive positioning, and the strategic value of locking this specific territory.

Key messaging themes:
- Market opportunity and profit potential
- Competitive landscape and market share capture
- Strategic timing and territory scarcity
- Exclusive access advantage once locked
- ROI confidence and growth trajectory

Avoid generic advice. Be specific about this territory's unique advantages.`;

    const user = [
      `TERRITORY ANALYSIS REQUEST`,
      `Practice: ${name || 'Target Practice'}`,
      `Location: ${address || 'N/A'}`,
      `Coordinates: (${lat}, ${lon})`,
      `Protected Radius: ${radius} miles`,
      ``,
      `COMPETITIVE INTELLIGENCE:`,
      `• Total Competitors: ${territory_analysis?.total_competitors ?? 0}`,
      `• Dentists: ${territory_analysis?.dentists ?? 0}`,
      `• Orthodontists: ${territory_analysis?.orthodontists ?? 0}`,
      `• Active Invisalign Advertisers: ${territory_analysis?.invisalign_ads ?? 0}`,
      `• Market Density: ${territory_analysis?.market_density ?? 0}/mi²`,
      `• Projected Market Share: ${territory_analysis?.market_share ?? 0}%`,
      `• Competitor Ad Spend: $${territory_analysis?.competitor_spend?.toLocaleString() ?? 0}/month`,
      ``,
      `ROI PROJECTIONS:`,
      `• Estimated Monthly Cases: ${territory_analysis?.estimated_monthly_cases ?? 0}`,
      `• Estimated Monthly Profit: ${territory_analysis?.estimated_monthly_profit ?? 'N/A'}`,
      `• ROI Multiple: ${territory_analysis?.roi_multiple ?? 'N/A'}`,
      ``,
      `Provide strategic territory analysis focusing on market opportunity, competitive positioning, and the value of exclusive territory protection.`
    ].join('\n');

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${openaiKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        model, 
        messages: [
          { role: 'system', content: system }, 
          { role: 'user', content: user }
        ], 
        temperature: 0.3, 
        max_tokens: 300 
      })
    });

    if (!r.ok) {
      return res.status(500).json({ 
        error: 'OpenAI error', 
        details: await r.text() 
      });
    }

    const data = await r.json();
    const insight = data?.choices?.[0]?.message?.content?.trim() ?? 'Territory analysis unavailable.';
    
    res.status(200).json({ insight });
    
  } catch (e) {
    res.status(500).json({ 
      error: 'Server error', 
      details: e?.message || e 
    });
  }
}
