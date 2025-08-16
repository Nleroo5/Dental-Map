// /api/website-scraper.js - Advanced Website Scraping for Invisalign Verification
// Features: CORS Proxy, Content Analysis, Error Handling

export default async function handler(req, res) {
  // CORS Configuration
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

    const { url } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    console.log(`🕷️ Scraping website: ${url}`);

    // Multiple scraping strategies for maximum success rate
    const scrapingResult = await attemptWebsiteScraping(url);
    
    res.status(200).json({
      success: true,
      url: url,
      content: scrapingResult.content,
      method: scrapingResult.method,
      invisalignAnalysis: analyzeContentForInvisalign(scrapingResult.content),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Website scraping failed:', error);
    res.status(500).json({ 
      error: 'Scraping failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

async function attemptWebsiteScraping(url) {
  console.log(`🔍 Attempting to scrape: ${url}`);
  
  // Strategy 1: Direct fetch with proper headers
  try {
    const result = await directFetchScraping(url);
    if (result.success) {
      return { content: result.content, method: 'direct_fetch' };
    }
  } catch (error) {
    console.log('Direct fetch failed:', error.message);
  }
  
  // Strategy 2: Use CORS proxy service
  try {
    const result = await proxyFetchScraping(url);
    if (result.success) {
      return { content: result.content, method: 'cors_proxy' };
    }
  } catch (error) {
    console.log('Proxy fetch failed:', error.message);
  }
  
  // Strategy 3: Use alternative proxy
  try {
    const result = await alternativeProxyScraping(url);
    if (result.success) {
      return { content: result.content, method: 'alternative_proxy' };
    }
  } catch (error) {
    console.log('Alternative proxy failed:', error.message);
  }
  
  // Strategy 4: Intelligent URL analysis fallback
  console.log('All scraping methods failed, using intelligent analysis...');
  return {
    content: generateIntelligentAnalysis(url),
    method: 'intelligent_fallback'
  };
}

async function directFetchScraping(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const content = await response.text();
  return { success: true, content };
}

async function proxyFetchScraping(url) {
  // Use AllOrigins proxy (free CORS proxy)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Proxy error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.contents) {
    throw new Error('No content returned from proxy');
  }
  
  return { success: true, content: data.contents };
}

async function alternativeProxyScraping(url) {
  // Use ThingProxy as alternative
  const proxyUrl = `https://thingproxy.freeboard.io/fetch/${url}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Alternative proxy error! status: ${response.status}`);
  }
  
  const content = await response.text();
  return { success: true, content };
}

function generateIntelligentAnalysis(url) {
  // When all scraping fails, generate intelligent analysis based on URL patterns
  const urlLower = url.toLowerCase();
  
  const analysis = {
    url: url,
    method: 'intelligent_url_analysis',
    indicators_found: [],
    confidence: 'low',
    note: 'Content scraping unavailable - analysis based on URL patterns'
  };
  
  // Analyze URL for dental/orthodontic indicators
  const dentalIndicators = [
    'dental', 'dentist', 'smile', 'teeth', 'orthodontic', 'orthodontist',
    'invisalign', 'braces', 'align', 'straight', 'cosmetic'
  ];
  
  const foundIndicators = dentalIndicators.filter(indicator => urlLower.includes(indicator));
  analysis.indicators_found = foundIndicators;
  
  // Generate mock content based on URL analysis
  let mockContent = `Website Analysis for ${url}\n\n`;
  
  if (foundIndicators.includes('invisalign')) {
    mockContent += 'URL contains "invisalign" - strong indicator of Invisalign services\n';
    analysis.confidence = 'high';
  } else if (foundIndicators.includes('orthodontic') || foundIndicators.includes('orthodontist')) {
    mockContent += 'URL contains orthodontic indicators - likely offers Invisalign\n';
    analysis.confidence = 'medium';
  } else if (foundIndicators.length > 0) {
    mockContent += `URL contains dental indicators: ${foundIndicators.join(', ')}\n`;
    analysis.confidence = 'low';
  } else {
    mockContent += 'No clear dental indicators in URL\n';
  }
  
  mockContent += `\nAnalysis Details: ${JSON.stringify(analysis, null, 2)}`;
  
  return mockContent;
}

function analyzeContentForInvisalign(content) {
  const contentLower = content.toLowerCase();
  
  // Comprehensive keyword analysis
  const strongKeywords = [
    'invisalign provider', 'certified invisalign', 'invisalign treatment',
    'invisalign specialist', 'invisalign certified', 'align technology provider'
  ];
  
  const moderateKeywords = [
    'invisalign', 'clear aligners', 'clear braces', 'invisible braces',
    'orthodontic treatment', 'straighten teeth', 'smile makeover'
  ];
  
  const certificationKeywords = [
    'invisalign trained', 'preferred provider', 'elite provider',
    'diamond provider', 'platinum provider', 'invisalign badge'
  ];
  
  const serviceKeywords = [
    'teeth straightening', 'bite correction', 'malocclusion treatment',
    'adult orthodontics', 'teen orthodontics'
  ];
  
  // Count matches
  const strongMatches = strongKeywords.filter(keyword => contentLower.includes(keyword));
  const moderateMatches = moderateKeywords.filter(keyword => contentLower.includes(keyword));
  const certificationMatches = certificationKeywords.filter(keyword => contentLower.includes(keyword));
  const serviceMatches = serviceKeywords.filter(keyword => contentLower.includes(keyword));
  
  // Calculate confidence score
  const score = (strongMatches.length * 4) + 
                (moderateMatches.length * 2) + 
                (certificationMatches.length * 3) + 
                (serviceMatches.length * 1);
  
  // Determine if provider
  const isProvider = score >= 4; // Threshold for positive identification
  
  // Confidence level
  let confidence = 'low';
  if (score >= 8) confidence = 'very_high';
  else if (score >= 6) confidence = 'high';
  else if (score >= 4) confidence = 'medium';
  
  return {
    isInvisalignProvider: isProvider,
    confidence: confidence,
    score: score,
    analysis: {
      strongMatches: strongMatches,
      moderateMatches: moderateMatches,
      certificationMatches: certificationMatches,
      serviceMatches: serviceMatches,
      totalKeywords: strongMatches.length + moderateMatches.length + certificationMatches.length + serviceMatches.length
    },
    details: {
      contentLength: content.length,
      analysisMethod: 'comprehensive_keyword_analysis',
      threshold: 4,
      maxPossibleScore: 20
    }
  };
}
