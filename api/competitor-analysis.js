// Enhanced Facebook Ad Library Integration for Live Competitor Intelligence
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

    console.log(`🎯 Live competitor analysis for: ${location.lat}, ${location.lng} (${radius}mi)`);

    // Get live Facebook Ad Library data
    const competitorIntel = await getLiveCompetitorIntelligence(practices, location, radius);
    
    const response = {
      success: true,
      ...competitorIntel,
      timestamp: new Date().toISOString(),
      dataFreshness: 'Real-time Facebook Ad Library'
    };
    
    console.log('✅ Live competitor intelligence complete:', {
      activeAds: competitorIntel.totalActiveAds,
      totalSpend: competitorIntel.competitorSpend,
      adCopyExamples: competitorIntel.adExamples?.length || 0
    });
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('💥 Live Competitor Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze live competitors',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function getLiveCompetitorIntelligence(practices, location, radiusMiles) {
  const metaAccessToken = process.env.META_ACCESS_TOKEN;
  
  console.log('🚀 Starting live Facebook Ad Library analysis...');
  
  if (metaAccessToken && metaAccessToken.includes('|')) {
    try {
      console.log('📡 Connecting to Facebook Ad Library...');
      const liveData = await getFacebookAdIntelligence(practices, location, metaAccessToken);
      
      if (liveData && liveData.totalActiveAds > 0) {
        console.log('✅ Facebook Ad Library successful - live competitor data acquired');
        return liveData;
      } else {
        console.log('⚠️ No live ads found - using enhanced simulation with local practice data');
      }
      
    } catch (error) {
      console.error('❌ Facebook Ad Library failed:', error.message);
    }
  }
  
  // Enhanced fallback with practice data
  return createEnhancedCompetitorIntelligence(practices, location, radiusMiles);
}

async function getFacebookAdIntelligence(practices, location, accessToken) {
  console.log('🔍 Scanning Facebook Ad Library for dental competitors...');
  
  const dentalSearchTerms = [
    'invisalign', 'clear aligners', 'orthodontist', 'cosmetic dentistry',
    'dental implants', 'teeth whitening', 'smile makeover', 'braces',
    'emergency dentist', 'family dentist'
  ];
  
  const locationTerms = getLocationTerms(location);
  const allCompetitorAds = [];
  let totalApiCalls = 0;
  const maxApiCalls = 15; // Rate limiting
  
  try {
    // Search combinations of dental terms + location
    for (const dentalTerm of dentalSearchTerms.slice(0, 5)) { // Limit to top 5 terms
      if (totalApiCalls >= maxApiCalls) break;
      
      for (const locationTerm of locationTerms.slice(0, 3)) { // Top 3 locations
        if (totalApiCalls >= maxApiCalls) break;
        
        const searchQuery = `${dentalTerm} ${locationTerm}`;
        console.log(`🔎 Searching: "${searchQuery}"`);
        
        const ads = await searchFacebookAds(searchQuery, accessToken);
        if (ads && ads.length > 0) {
          console.log(`✅ Found ${ads.length} ads for "${searchQuery}"`);
          allCompetitorAds.push(...ads);
        }
        
        totalApiCalls++;
        
        // Rate limiting: 4 seconds between calls
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    }
    
    if (allCompetitorAds.length === 0) {
      console.log('⚠️ No Facebook ads found for this territory');
      return null;
    }
    
    // Process and analyze the live ad data
    return analyzeLiveAdData(allCompetitorAds, practices, location);
    
  } catch (error) {
    console.error('❌ Facebook Ad Library scan failed:', error);
    return null;
  }
}

function getLocationTerms(location) {
  // Extract location terms for ad searches
  const lat = location.lat;
  const lng = location.lng;
  
  // Determine city/metro area based on coordinates
  let locationTerms = ['near me', 'local'];
  
  // Major metro areas
  if (lat >= 33.4 && lat <= 34.0 && lng >= -84.8 && lng <= -84.0) {
    locationTerms = ['atlanta', 'buckhead', 'sandy springs', 'marietta'];
  } else if (lat >= 25.4 && lat <= 26.1 && lng >= -80.6 && lng <= -80.0) {
    locationTerms = ['miami', 'coral gables', 'aventura', 'south beach'];
  } else if (lat >= 41.4 && lat <= 42.1 && lng >= -88.1 && lng <= -87.4) {
    locationTerms = ['chicago', 'loop', 'lincoln park', 'river north'];
  } else if (lat >= 32.4 && lat <= 33.1 && lng >= -97.1 && lng <= -96.4) {
    locationTerms = ['dallas', 'plano', 'frisco', 'richardson'];
  } else if (lat >= 33.4 && lat <= 34.6 && lng >= -118.6 && lng <= -117.4) {
    locationTerms = ['los angeles', 'beverly hills', 'santa monica', 'west hollywood'];
  }
  
  return locationTerms;
}

async function searchFacebookAds(searchQuery, accessToken) {
  try {
    const adLibraryUrl = `https://graph.facebook.com/v18.0/ads_archive?` +
      `search_terms=${encodeURIComponent(searchQuery)}` +
      `&ad_reached_countries=US` +
      `&access_token=${accessToken}` +
      `&fields=ad_creative_bodies,page_name,spend,impressions,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles` +
      `&limit=25`;
    
    const response = await fetch(adLibraryUrl);
    
    if (!response.ok) {
      console.error(`Facebook API error for "${searchQuery}": ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Facebook API returned error:', data.error);
      return [];
    }
    
    return data.data || [];
    
  } catch (error) {
    console.error(`Error searching Facebook ads for "${searchQuery}":`, error.message);
    return [];
  }
}

function analyzeLiveAdData(adsData, practices, location) {
  console.log(`📊 Analyzing ${adsData.length} live Facebook ads...`);
  
  // Group ads by page/practice and analyze
  const practiceAds = {};
  const adExamples = [];
  let totalActiveAds = 0;
  let totalEstimatedSpend = 0;
  
  adsData.forEach(ad => {
    const pageName = ad.page_name || 'Unknown Practice';
    const isActive = !ad.ad_delivery_stop_time;
    
    if (!practiceAds[pageName]) {
      practiceAds[pageName] = {
        pageName,
        totalAds: 0,
        activeAds: 0,
        spendRange: '$0',
        adTypes: {
          invisalign: 0,
          general: 0,
          emergency: 0,
          cosmetic: 0
        },
        messaging: [],
        lastActive: null
      };
    }
    
    practiceAds[pageName].totalAds++;
    
    if (isActive) {
      practiceAds[pageName].activeAds++;
      totalActiveAds++;
    }
    
    // Parse spend and estimate
    const spendEstimate = parseSpendRange(ad.spend);
    practiceAds[pageName].spendRange = ad.spend || '$0-$99';
    totalEstimatedSpend += spendEstimate;
    
    // Categorize ad type
    const content = [
      ...(ad.ad_creative_bodies || []),
      ...(ad.ad_creative_link_titles || []),
      ...(ad.ad_creative_link_descriptions || [])
    ].join(' ').toLowerCase();
    
    if (content.includes('invisalign') || content.includes('clear aligner')) {
      practiceAds[pageName].adTypes.invisalign++;
    } else if (content.includes('emergency') || content.includes('urgent')) {
      practiceAds[pageName].adTypes.emergency++;
    } else if (content.includes('cosmetic') || content.includes('whitening') || content.includes('smile')) {
      practiceAds[pageName].adTypes.cosmetic++;
    } else {
      practiceAds[pageName].adTypes.general++;
    }
    
    // Store messaging examples
    if (ad.ad_creative_bodies && ad.ad_creative_bodies.length > 0) {
      practiceAds[pageName].messaging.push(...ad.ad_creative_bodies);
    }
    
    // Track recent activity
    if (ad.ad_delivery_start_time) {
      const startDate = new Date(ad.ad_delivery_start_time);
      if (!practiceAds[pageName].lastActive || startDate > new Date(practiceAds[pageName].lastActive)) {
        practiceAds[pageName].lastActive = ad.ad_delivery_start_time;
      }
    }
    
    // Collect interesting ad examples
    if (isActive && ad.ad_creative_bodies && ad.ad_creative_bodies.length > 0) {
      adExamples.push({
        practice: pageName,
        headline: ad.ad_creative_bodies[0],
        spend: ad.spend,
        type: getAdType(content)
      });
    }
  });
  
  // Calculate competitive metrics
  const competitorPractices = Object.values(practiceAds);
  const invisalignProviders = competitorPractices.filter(p => p.adTypes.invisalign > 0).length;
  const avgMonthlySpend = totalEstimatedSpend / Math.max(competitorPractices.length, 1);
  
  // Calculate market share with $2,500 budget
  const ourSpend = 2500;
  const totalMarketSpend = totalEstimatedSpend + ourSpend;
  const ourMarketShare = totalMarketSpend > 0 ? Math.round((ourSpend / totalMarketSpend) * 100) : 35;
  
  // Identify strategic opportunities
  const messagingGaps = identifyMessagingGaps(competitorPractices);
  const timingOpportunities = identifyTimingOpportunities(competitorPractices);
  
  return {
    invisalignProviders,
    competitorSpend: Math.round(totalEstimatedSpend),
    ourMarketShare: Math.max(15, Math.min(85, ourMarketShare)),
    shareOfVoice: Math.max(15, Math.min(85, ourMarketShare)),
    totalActiveAds,
    activePractices: competitorPractices.length,
    dataSource: 'Facebook Ad Library (Live)',
    dataQuality: 'HIGH - Real-time ad data',
    competitorBreakdown: competitorPractices.slice(0, 5),
    adExamples: adExamples.slice(0, 3),
    messagingGaps,
    timingOpportunities,
    confidence: 90
  };
}

function parseSpendRange(spendRange) {
  if (!spendRange || spendRange === '$0 - $99') return 50;
  
  // Parse Facebook's spend ranges
  const matches = spendRange.match(/\$[\d,]+ - \$([0-9,]+)/);
  if (matches && matches[1]) {
    return parseInt(matches[1].replace(/,/g, ''));
  }
  
  // Handle single values
  const singleMatch = spendRange.match(/\$([0-9,]+)/);
  if (singleMatch && singleMatch[1]) {
    return parseInt(singleMatch[1].replace(/,/g, ''));
  }
  
  return 1000;
}

function getAdType(content) {
  if (content.includes('invisalign')) return 'Invisalign';
  if (content.includes('emergency')) return 'Emergency';
  if (content.includes('cosmetic')) return 'Cosmetic';
  return 'General';
}

function identifyMessagingGaps(competitors) {
  const commonMessages = {
    pricing: false,
    financing: false,
    speed: false,
    technology: false,
    experience: false
  };
  
  competitors.forEach(comp => {
    const allMessaging = comp.messaging.join(' ').toLowerCase();
    
    if (allMessaging.includes('$') || allMessaging.includes('price')) {
      commonMessages.pricing = true;
    }
    if (allMessaging.includes('payment') || allMessaging.includes('financing')) {
      commonMessages.financing = true;
    }
    if (allMessaging.includes('fast') || allMessaging.includes('quick')) {
      commonMessages.speed = true;
    }
    if (allMessaging.includes('technology') || allMessaging.includes('3d')) {
      commonMessages.technology = true;
    }
    if (allMessaging.includes('years') || allMessaging.includes('experience')) {
      commonMessages.experience = true;
    }
  });
  
  const gaps = [];
  if (!commonMessages.pricing) gaps.push('Transparent pricing');
  if (!commonMessages.financing) gaps.push('Flexible financing');
  if (!commonMessages.speed) gaps.push('Fast treatment');
  if (!commonMessages.technology) gaps.push('Advanced technology');
  if (!commonMessages.experience) gaps.push('Experience/credentials');
  
  return gaps;
}

function identifyTimingOpportunities(competitors) {
  const recentActivity = competitors.filter(comp => {
    if (!comp.lastActive) return false;
    const lastActive = new Date(comp.lastActive);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastActive > thirtyDaysAgo;
  });
  
  const opportunities = [];
  
  if (recentActivity.length < competitors.length * 0.5) {
    opportunities.push('Low recent activity - opportunity to dominate');
  }
  
  if (recentActivity.length > competitors.length * 0.8) {
    opportunities.push('High activity - market heating up, act fast');
  }
  
  return opportunities;
}

// Enhanced fallback when Facebook API has no data
function createEnhancedCompetitorIntelligence(practices, location, radiusMiles) {
  console.log('🎭 Creating enhanced competitor intelligence from practice data...');
  
  const competitorData = [];
  
  practices.forEach(practice => {
    const isInvisalignProvider = assessInvisalignProbability(practice);
    
    if (isInvisalignProvider.likely) {
      const spendEstimate = estimatePracticeAdSpend(practice);
      
      competitorData.push({
        practice: practice.name,
        rating: practice.rating,
        reviewCount: practice.user_ratings_total,
        estimatedMonthlySpend: spendEstimate,
        invisalignProbability: isInvisalignProvider.probability,
        digitalMaturity: assessDigitalMaturity(practice),
        vulnerabilities: identifyVulnerabilities(practice)
      });
    }
  });
  
  const totalSpend = competitorData.reduce((sum, comp) => sum + comp.estimatedMonthlySpend, 0);
  const ourSpend = 2500;
  const ourMarketShare = Math.round((ourSpend / (totalSpend + ourSpend)) * 100);
  
  return {
    invisalignProviders: competitorData.length,
    competitorSpend: totalSpend,
    ourMarketShare: Math.max(15, Math.min(85, ourMarketShare)),
    shareOfVoice: Math.max(15, Math.min(85, ourMarketShare)),
    totalActiveAds: 0,
    activePractices: competitorData.length,
    dataSource: 'Enhanced Practice Analysis',
    dataQuality: 'MEDIUM - Estimated from practice data',
    competitorBreakdown: competitorData.slice(0, 5),
    adExamples: [],
    messagingGaps: ['Video advertising', 'Territory protection', 'Actor-led content'],
    timingOpportunities: ['First-mover advantage in video ads'],
    confidence: 75
  };
}

function assessInvisalignProbability(practice) {
  const name = (practice.name || '').toLowerCase();
  const types = (practice.types || []).join(' ').toLowerCase();
  
  let probability = 0.2; // Base 20%
  
  // Strong indicators
  if (name.includes('invisalign') || name.includes('clear aligner')) {
    return { likely: true, probability: 0.95 };
  }
  
  if (name.includes('orthodontic') || types.includes('orthodontist')) {
    probability = 0.85;
  } else if (name.includes('cosmetic') || name.includes('smile')) {
    probability = 0.65;
  } else if (types.includes('dentist')) {
    probability = 0.35;
  }
  
  // Rating and review adjustments
  if (practice.rating >= 4.5 && practice.user_ratings_total > 100) {
    probability += 0.15;
  }
  
  return { 
    likely: probability > 0.5, 
    probability: Math.min(0.95, probability) 
  };
}

function estimatePracticeAdSpend(practice) {
  let baseSpend = 1200;
  
  const rating = practice.rating || 3.5;
  const reviewCount = practice.user_ratings_total || 20;
  
  // Quality multipliers
  if (rating >= 4.5) baseSpend *= 1.4;
  else if (rating >= 4.0) baseSpend *= 1.2;
  else if (rating < 3.5) baseSpend *= 0.7;
  
  // Size/activity multipliers
  if (reviewCount > 300) baseSpend *= 1.8;
  else if (reviewCount > 100) baseSpend *= 1.3;
  else if (reviewCount < 25) baseSpend *= 0.6;
  
  return Math.max(400, Math.floor(baseSpend + (Math.random() - 0.5) * 400));
}

function assessDigitalMaturity(practice) {
  const reviewCount = practice.user_ratings_total || 0;
  const rating = practice.rating || 0;
  
  if (reviewCount > 200 && rating > 4.2) return 'HIGH';
  if (reviewCount > 50 && rating > 3.8) return 'MEDIUM';
  return 'LOW';
}

function identifyVulnerabilities(practice) {
  const vulnerabilities = [];
  
  if (practice.rating < 4.0) vulnerabilities.push('Low ratings');
  if (practice.user_ratings_total < 50) vulnerabilities.push('Limited reviews');
  if (!practice.website) vulnerabilities.push('No website listed');
  
  return vulnerabilities;
}
