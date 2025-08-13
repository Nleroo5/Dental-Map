export default async function handler(req, res) {
  // CORS Configuration
  const allowed = [
    'https://www.establishedshot.com',
    'https://dental-map.vercel.app',
    'https://map.establishedshot.com',
    'http://localhost:3000' // For development
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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { territory_analysis, prompt_type } = req.body || {};
    
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable' });
    }
    
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Enhanced system prompt for territory intelligence
    const system = `You are an elite dental market strategist and territory analyst for Established Shot's Territory Intelligence & ROI Engine™.

Your role is to provide compelling, data-driven territory analysis that:
1. Creates urgency around territory locking and competitive threats
2. Demonstrates clear ROI and profit potential with specific numbers
3. Builds credibility through detailed market insights
4. Uses confident, authoritative language that closes deals
5. Emphasizes the exclusive competitive advantage of territory protection

Response format: 4-6 paragraphs, professional yet persuasive tone.

Key messaging themes:
- Market opportunity sizing with specific prospect numbers
- Competitive landscape and share-of-voice analysis  
- ROI projections and profit forecasting
- Strategic timing and territory scarcity
- Exclusive access advantage once locked
- Actionable next steps for territory protection

Always include specific numbers from the analysis data and emphasize the strategic value of immediate action.`;

    // Build comprehensive analysis prompt
    const practice = territory_analysis?.practice || {};
    const demographics = territory_analysis?.demographics || {};
    const competitors = territory_analysis?.competitors || {};
    const roi = territory_analysis?.roi || {};
    const demand = territory_analysis?.demand || {};

    const user = [
      `TERRITORY INTELLIGENCE ANALYSIS REQUEST`,
      ``,
      `PRACTICE TARGET:`,
      `• Name: ${practice.name || 'Selected Practice'}`,
      `• Location: ${practice.address || 'N/A'}`,
      `• Coordinates: ${practice.location?.lat || 'N/A'}, ${practice.location?.lng || 'N/A'}`,
      ``,
      `DEMOGRAPHIC INTELLIGENCE:`,
      `• Total Population: ${demographics.totalPopulation?.toLocaleString() || 'N/A'}`,
      `• Qualified Prospects: ${demographics.qualifiedAudience?.toLocaleString() || 'N/A'}`,
      `• Median Income: $${demographics.medianIncome ? Math.floor(demographics.medianIncome / 1000) + 'k' : 'N/A'}`,
      `• Market Penetration: ${demographics.qualifiedPercent ? (demographics.qualifiedPercent * 100).toFixed(1) + '%' : 'N/A'}`,
      `• Population Density: ${demographics.populationDensity?.toFixed(0) || 'N/A'} per sq mile`,
      ``,
      `COMPETITIVE LANDSCAPE:`,
      `• Direct Invisalign Competitors: ${competitors.invisalignProviders || 0}`,
      `• Total Competitor Ad Spend: $${competitors.competitorSpend?.toLocaleString() || 0}/month`,
      `• Projected Market Share: ${competitors.ourMarketShare || 0}% with $2,500/month`,
      `• Share of Voice: ${competitors.shareOfVoice || 0}% of total advertising`,
      ``,
      `DEMAND ANALYSIS:`,
      `• Annual Demand Ceiling: ${demand.annualDemand?.toLocaleString() || 'N/A'} cases`,
      `• Adoption Rate: ${demand.adoptionRate ? (demand.adoptionRate * 100).toFixed(1) + '%' : 'N/A'}`,
      `• Seasonal Adjustment: ${demand.seasonalDemand ? 'Active' : 'Standard'}`,
      `• Confidence Level: ${demand.confidence || 85}%`,
      ``,
      `ROI PROJECTIONS:`,
      `• Monthly Ad Spend: $2,500`,
      `• Expected Clicks: ${roi.expectedClicks?.toLocaleString() || 'N/A'}`,
      `• Qualified Leads: ${roi.qualifiedLeads || 'N/A'}`,
      `• Consultations: ${roi.consultations || 'N/A'}`,
      `• New Cases: ${roi.newCases || 'N/A'} Invisalign starts/month`,
      `• Gross Revenue: $${roi.grossRevenue?.toLocaleString() || 'N/A'}/month`,
      `• Net Profit: $${roi.netProfit?.toLocaleString() || 'N/A'}/month`,
      `• ROI Multiple: ${roi.roiMultiple?.toFixed(1) || 'N/A'}x return`,
      ``,
      `STRATEGIC CONTEXT:`,
      `• Territory Status: Available for immediate locking`,
      `• Competitive Threat Level: ${competitors.invisalignProviders > 5 ? 'HIGH' : competitors.invisalignProviders > 2 ? 'MODERATE' : 'LOW'}`,
      `• Market Opportunity: ${demographics.qualifiedPercent > 0.3 ? 'EXCEPTIONAL' : demographics.qualifiedPercent > 0.25 ? 'STRONG' : 'MODERATE'}`,
      ``,
      `Provide a comprehensive territory analysis focusing on market opportunity, competitive positioning, ROI projections, and the strategic importance of immediate territory protection. Emphasize specific numbers and create urgency around the exclusive competitive advantage.`
    ].join('\n');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 500,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      return res.status(500).json({ 
        error: 'OpenAI API error', 
        details: errorText 
      });
    }

    const data = await response.json();
    const insight = data?.choices?.[0]?.message?.content?.trim();
    
    if (!insight) {
      return res.status(500).json({ 
        error: 'No insight generated',
        details: 'OpenAI returned empty response'
      });
    }
    
    res.status(200).json({ 
      insight,
      analysis_data: territory_analysis, // Return for debugging
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Territory Analysis Error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error?.message || String(error)
    });
  }
}
