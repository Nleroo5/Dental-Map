// Meta Ad Library Integration for Competitor Intelligence
export default async function handler(req, res) {
  // CORS
  const allowed = [
    'https://www.establishedshot.com',
    'https://dental-map.vercel.app', 
    'https://map.establishedshot.com',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { practices, location, radius } = req.body;
    
    if (!practices || !location) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log(`🎯 Analyzing competitors for: ${location.lat}, ${location.lng} (${radius}mi radius)`);

    // Analyze competitor advertising with enhanced logging
    const competitorIntel = await analyzeCompetitorAdvertising(practices, location, radius);
    
    // Add success metrics to response
    const response = {
      success: true,
      ...competitorIntel,
      timestamp: new Date().toISOString(),
      apiStatus: competitorIntel.dataSource === 'Meta Ad Library API' ? 'live' : 'simulated'
    };
    
    console.log('✅ Competitor analysis complete:', {
      dataSource: competitorIntel.dataSource,
      providers: competitorIntel.invisalignProviders,
      spend: competitorIntel.competitorSpend
    });
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('💥 Competitor Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze competitors',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function analyzeCompetitorAdvertising(practices, location, radiusMiles) {
  const metaAccessToken = process.env.META_ACCESS_TOKEN;
  
  console.log('🚀 Starting competitor analysis...');
  console.log('Meta API configured:', !!metaAccessToken);
  
  // If we have Meta API access, use real data
  if (metaAccessToken && metaAccessToken.includes('|')) {
    try {
      console.log('📡 Attempting Meta Ad Library API connection...');
      const realData = await getRealMetaAdData(practices, location, metaAccessToken);
      
      if (realData && realData.totalAdsFound > 0) {
        console.log('✅ Meta API successful - using real competitor data');
        return realData;
      } else {
        console.log('⚠️ Meta API returned no data - falling back to simulation');
      }
      
    } catch (error) {
      console.error('❌ Meta API failed:', error.message);
      console.log('🔄 Falling back to competitor simulation');
    }
  } else {
    console.log('ℹ️ Meta API not configured - using simulation');
  }
  
  // Fallback to sophisticated simulation
  console.log('🎭 Using enhanced competitor simulation');
  return simulateCompetitorIntelligence(practices, location, radiusMiles);
}

async function getRealMetaAdData(practices, location, accessToken) {
  console.log('🔍 Fetching real Meta Ad Library data...');
  
  try {
    const competitorData = [];
    const searchTerms = [
      'dental invisalign',
      'orthodontist clear aligners', 
      'cosmetic dentistry',
      'smile makeover'
    ];
    
    // Rate limiting variables
    let lastApiCall = 0;
    const API_DELAY = 3500; // 3.5 seconds between calls to respect rate limits
    
    for (const searchTerm of searchTerms) {
      // Rate limiting
      const timeSinceLastCall = Date.now() - lastApiCall;
      if (timeSinceLastCall < API_DELAY) {
        console.log(`⏱️ Rate limiting: waiting ${API_DELAY - timeSinceLastCall}ms`);
        await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastCall));
      }
      
      const adLibraryUrl = `https://graph.facebook.com/v18.0/ads_archive?` +
        `search_terms=${encodeURIComponent(searchTerm)}` +
        `&ad_reached_countries=US` +
        `&access_token=${accessToken}` +
        `&fields=ad_creative_bodies,ad_delivery_start_time,ad_delivery_stop_time,spend,impressions,page_name` +
        `&limit=50`;
      
      console.log(`🔎 Searching for: ${searchTerm}`);
      lastApiCall = Date.now();
      
      try {
        const response = await fetch(adLibraryUrl);
        
        if (!response.ok) {
          console.error(`Meta API error for "${searchTerm}": ${response.status}`);
          const errorText = await response.text();
          console.error('Error details:', errorText);
          continue;
        }
        
        const data = await response.json();
        
        if (data.error) {
          console.error('Meta API returned error:', data.error);
          continue;
        }
        
        if (data.data && data.data.length > 0) {
          console.log(`✅ Found ${data.data.length} ads for "${searchTerm}"`);
          
          // Process ads and group by page/practice
          const adsData = data.data.map(ad => ({
            pageName: ad.page_name || 'Unknown Practice',
            spend: ad.spend || '$0 - $99',
            isActive: !ad.ad_delivery_stop_time,
            startDate: ad.ad_delivery_start_time,
            content: (ad.ad_creative_bodies || []).join(' '),
            searchTerm: searchTerm
          }));
          
          competitorData.push(...adsData);
        } else {
          console.log(`No ads found for "${searchTerm}"`);
        }
        
      } catch (adError) {
        console.error(`Error fetching ads for "${searchTerm}":`, adError.message);
        continue;
      }
    }
    
    if (competitorData.length === 0) {
      console.log('⚠️ No competitor ads found, falling back to simulation');
      return simulateCompetitorIntelligence(practices, location, 10);
    }
    
    // Process the real Meta data
    return processRealMetaData(competitorData, location);
    
  } catch (error) {
    console.error('❌ Meta API integration failed:', error);
    console.log('🔄 Falling back to competitor simulation');
    return simulateCompetitorIntelligence(practices, location, 10);
  }
}

function processRealMetaData(adsData, location) {
  console.log(`📊 Processing ${adsData.length} real ads from Meta Ad Library`);
  
  // Group ads by practice/page
  const practiceGroups = {};
  adsData.forEach(ad => {
    const key = ad.pageName.toLowerCase();
    if (!practiceGroups[key]) {
      practiceGroups[key] = {
        pageName: ad.pageName,
        ads: [],
        totalSpend: 0,
        activeAds: 0,
        invisalignAds: 0
      };
    }
    
    practiceGroups[key].ads.push(ad);
    
    // Parse spend range (e.g., "$1,000 - $4,999" -> 4999)
    const spendMax = parseSpendRange(ad.spend);
    practiceGroups[key].totalSpend += spendMax;
    
    if (ad.isActive) {
      practiceGroups[key].activeAds++;
    }
    
    // Check if it's Invisalign-related
    const content = ad.content.toLowerCase();
    if (content.includes('invisalign') || content.includes('clear aligner') || 
        content.includes('straighten') || ad.searchTerm.includes('invisalign')) {
      practiceGroups[key].invisalignAds++;
    }
  });
  
  // Calculate metrics
  const practices = Object.values(practiceGroups);
  const invisalignProviders = practices.filter(p => p.invisalignAds > 0).length;
  const totalCompetitorSpend = practices.reduce((sum, p) => sum + p.totalSpend, 0);
  const avgMonthlySpend = totalCompetitorSpend / Math.max(practices.length, 1) / 3; // Estimate monthly from quarterly
  
  // Calculate our market share with $2,500/month
  const ourSpend = 2500;
  const estimatedTotalMarketSpend = (avgMonthlySpend * practices.length) + ourSpend;
  const ourMarketShare = Math.round((ourSpend / estimatedTotalMarketSpend) * 100);
  
  const result = {
    invisalignProviders,
    competitorSpend: Math.round(avgMonthlySpend * practices.length),
    ourMarketShare: Math.max(15, Math.min(85, ourMarketShare)), // Keep realistic bounds
    shareOfVoice: Math.max(15, Math.min(85, ourMarketShare)),
    totalAdsFound: adsData.length,
    activePractices: practices.length,
    dataSource: 'Meta Ad Library API',
    practiceBreakdown: practices.slice(0, 5) // Top 5 competitors
  };
  
  console.log('📈 Meta API Results:', {
    invisalignProviders: result.invisalignProviders,
    totalSpend: result.competitorSpend,
    marketShare: result.ourMarketShare + '%',
    adsAnalyzed: result.totalAdsFound
  });
  
  return result;
}

function parseSpendRange(spendRange) {
  if (!spendRange || spendRange === '$0 - $99') return 50;
  
  // Parse ranges like "$1,000 - $4,999" -> 4999
  const matches = spendRange.match(/\$[\d,]+ - \$([0-9,]+)/);
  if (matches && matches[1]) {
    return parseInt(matches[1].replace(/,/g, ''));
  }
  
  // Handle single values like "$5,000+"
  const singleMatch = spendRange.match(/\$([0-9,]+)/);
  if (singleMatch && singleMatch[1]) {
    return parseInt(singleMatch[1].replace(/,/g, ''));
  }
  
  return 1000; // Default fallback
}

async function simulateCompetitorIntelligence(practices, location, radiusMiles) {
  // Sophisticated simulation based on practice characteristics
  const competitorData = [];
  
  for (const practice of practices) {
    const isInvisalignProvider = await checkInvisalignProvider(practice);
    
    if (isInvisalignProvider) {
      const spendEstimate = estimatePracticeAdSpend(practice, location);
      
      competitorData.push({
        practice: practice.name,
        placeId: practice.place_id,
        rating: practice.rating,
        reviewCount: practice.user_ratings_total,
        isInvisalignProvider: true,
        estimatedMonthlySpend: spendEstimate,
        competitionLevel: calculateCompetitionLevel(spendEstimate, practice.rating),
        adTypes: simulateAdTypes(practice)
      });
    }
  }
  
  return processSimulatedData(competitorData);
}

async function checkInvisalignProvider(practice) {
  // Check if practice name or details suggest Invisalign services
  const name = (practice.name || '').toLowerCase();
  const types = (practice.types || []).join(' ').toLowerCase();
  
  // Strong indicators
  if (name.includes('invisalign') || name.includes('clear aligner') || name.includes('orthodontic')) {
    return true;
  }
  
  // Weaker indicators (require additional checks)
  if (name.includes('cosmetic') || name.includes('smile') || types.includes('orthodontist')) {
    // Simulate checking practice website/details (70% chance they offer Invisalign)
    return Math.random() < 0.7;
  }
  
  // General dentists (30% chance they offer Invisalign)
  return Math.random() < 0.3;
}

function estimatePracticeAdSpend(practice, location) {
  let baseSpend = 800; // Base monthly ad spend
  
  // Adjust based on practice quality indicators
  const rating = practice.rating || 3.5;
  const reviewCount = practice.user_ratings_total || 10;
  
  // Rating multiplier
  if (rating >= 4.5) baseSpend *= 1.4;
  else if (rating >= 4.0) baseSpend *= 1.2;
  else if (rating < 3.5) baseSpend *= 0.7;
  
  // Review count multiplier (indicates practice size/marketing budget)
  if (reviewCount > 500) baseSpend *= 1.8;
  else if (reviewCount > 200) baseSpend *= 1.4;
  else if (reviewCount > 100) baseSpend *= 1.2;
  else if (reviewCount < 20) baseSpend *= 0.6;
  
  // Random variation
  baseSpend += (Math.random() - 0.5) * 300;
  
  return Math.max(400, Math.floor(baseSpend));
}

function calculateCompetitionLevel(spend, rating) {
  if (spend > 2000 && rating > 4.0) return 'HIGH';
  if (spend > 1200 || rating > 4.2) return 'MODERATE';
  return 'LOW';
}

function simulateAdTypes(practice) {
  return {
    invisalign: Math.floor(Math.random() * 5) + 1,
    general_dental: Math.floor(Math.random() * 8) + 2,
    cosmetic: Math.floor(Math.random() * 3) + 1,
    emergency: Math.floor(Math.random() * 2)
  };
}

function processSimulatedData(competitorData) {
  const invisalignProviders = competitorData.length;
  const totalSpend = competitorData.reduce((sum, comp) => sum + comp.estimatedMonthlySpend, 0);
  
  // Calculate our market share with $2,500/month
  const ourSpend = 2500;
  const totalMarketSpend = totalSpend + ourSpend;
  const ourMarketShare = Math.round((ourSpend / totalMarketSpend) * 100);
  
  return {
    invisalignProviders,
    competitorSpend: totalSpend,
    ourMarketShare: Math.max(15, Math.min(85, ourMarketShare)),
    shareOfVoice: Math.max(15, Math.min(85, ourMarketShare)),
    totalAdsFound: 0,
    activePractices: competitorData.length,
    dataSource: 'Enhanced Simulation',
    practiceBreakdown: competitorData.slice(0, 5)
  };
}
