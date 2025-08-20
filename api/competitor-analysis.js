// api/competitor-analysis.js - Meta Ads Detection Endpoint
const https = require('https');
const querystring = require('querystring');

// Rate limiting configuration
const RATE_LIMITS = {
    maxApiCallsPerPractice: 2,
    maxTotalApiCalls: 100,
    delayBetweenCalls: 1000,
    delayBetweenBatches: 2000,
    batchSize: 3,
    maxPracticesPerAnalysis: 50
};

// Meta Ad Library API configuration
const META_API_BASE = 'https://graph.facebook.com/v18.0/ads_archive';

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed',
            noSimulation: true
        });
    }

    try {
        const { practices } = req.body;

        if (!practices || !Array.isArray(practices)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid practices data',
                noSimulation: true
            });
        }

        if (!process.env.META_ACCESS_TOKEN) {
            return res.status(500).json({
                success: false,
                error: 'Meta API configuration missing',
                noSimulation: true
            });
        }

        // Limit number of practices
        const limitedPractices = practices.slice(0, RATE_LIMITS.maxPracticesPerAnalysis);
        
        console.log(`Starting Meta ads analysis for ${limitedPractices.length} practices`);

        // Process practices in batches
        const results = [];
        let totalApiCalls = 0;

        for (let i = 0; i < limitedPractices.length; i += RATE_LIMITS.batchSize) {
            const batch = limitedPractices.slice(i, i + RATE_LIMITS.batchSize);
            
            const batchPromises = batch.map(async (practice) => {
                if (totalApiCalls >= RATE_LIMITS.maxTotalApiCalls) {
                    return {
                        practiceId: practice.place_id,
                        practiceName: practice.name,
                        hasAds: null,
                        verified: false,
                        confidence: 0,
                        reason: 'rate_limit_exceeded'
                    };
                }

                try {
                    const adStatus = await checkMetaAds(practice, totalApiCalls);
                    totalApiCalls += adStatus.apiCallsUsed;
                    
                    return {
                        practiceId: practice.place_id,
                        practiceName: practice.name,
                        hasAds: adStatus.hasAds,
                        verified: adStatus.verified,
                        confidence: adStatus.confidence,
                        reason: adStatus.reason,
                        source: practice.source || 'google_places'
                    };
                } catch (error) {
                    console.error(`Error checking ads for ${practice.name}:`, error.message);
                    return {
                        practiceId: practice.place_id,
                        practiceName: practice.name,
                        hasAds: null,
                        verified: false,
                        confidence: 0,
                        reason: 'api_error',
                        source: practice.source || 'google_places'
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Delay between batches
            if (i + RATE_LIMITS.batchSize < limitedPractices.length) {
                await delay(RATE_LIMITS.delayBetweenBatches);
            }
        }

        // Calculate summary statistics
        const summary = calculateSummary(results, totalApiCalls);

        return res.status(200).json({
            success: true,
            ...summary,
            practiceBreakdown: results,
            metadata: {
                apiCallsUsed: totalApiCalls,
                maxApiCalls: RATE_LIMITS.maxTotalApiCalls,
                averageConfidence: Math.round(
                    results.filter(r => r.verified).reduce((sum, r) => sum + r.confidence, 0) / 
                    Math.max(results.filter(r => r.verified).length, 1)
                ),
                analysisTime: new Date().toISOString(),
                noSimulation: true
            }
        });

    } catch (error) {
        console.error('Analysis error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
            noSimulation: true,
            timestamp: new Date().toISOString()
        });
    }
};

// Check Meta ads for a single practice
async function checkMetaAds(practice, currentApiCalls) {
    if (currentApiCalls >= RATE_LIMITS.maxTotalApiCalls) {
        return {
            hasAds: null,
            verified: false,
            confidence: 0,
            reason: 'rate_limit_exceeded',
            apiCallsUsed: 0
        };
    }

    // Generate search variations
    const searchTerms = generateSearchTerms(practice.name);
    let totalAdsFound = 0;
    let apiCallsUsed = 0;
    let bestMatch = null;

    for (const term of searchTerms) {
        if (apiCallsUsed >= RATE_LIMITS.maxApiCallsPerPractice || 
            currentApiCalls + apiCallsUsed >= RATE_LIMITS.maxTotalApiCalls) {
            break;
        }

        try {
            await delay(RATE_LIMITS.delayBetweenCalls);
            
            const ads = await searchMetaAds(term);
            apiCallsUsed++;

            if (ads && ads.length > 0) {
                // Filter ads by name similarity
                const filteredAds = ads.filter(ad => 
                    calculateNameSimilarity(practice.name, ad.page_name) > 0.7
                );

                if (filteredAds.length > 0) {
                    totalAdsFound += filteredAds.length;
                    if (!bestMatch || filteredAds.length > bestMatch.length) {
                        bestMatch = filteredAds;
                    }
                }
            }
        } catch (error) {
            console.error(`Meta API error for term "${term}":`, error.message);
            apiCallsUsed++;
        }
    }

    // Determine result
    const hasAds = totalAdsFound > 0;
    const confidence = calculateConfidence(totalAdsFound, searchTerms.length, bestMatch);

    return {
        hasAds: hasAds,
        verified: true,
        confidence: confidence,
        reason: hasAds ? 'ads_found' : 'no_ads_found',
        apiCallsUsed: apiCallsUsed,
        metaAdDetails: {
            searchesPerformed: apiCallsUsed,
            matchingAds: totalAdsFound,
            bestMatch: bestMatch ? bestMatch[0]?.page_name : null
        }
    };
}

// Search Meta Ad Library API
async function searchMetaAds(searchTerm) {
    return new Promise((resolve, reject) => {
        const params = querystring.stringify({
            search_terms: searchTerm,
            ad_reached_countries: 'US',
            fields: 'id,page_name,ad_delivery_start_time,ad_delivery_stop_time',
            limit: 20,
            access_token: process.env.META_ACCESS_TOKEN
        });

        const url = `${META_API_BASE}?${params}`;

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (result.error) {
                        reject(new Error(`Meta API error: ${result.error.message}`));
                        return;
                    }

                    resolve(result.data || []);
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });
    });
}

// Generate search term variations for a practice name
function generateSearchTerms(practiceName) {
    const terms = [];
    
    // Original name
    terms.push(practiceName);
    
    // Remove common dental terms
    const cleaned = practiceName
        .replace(/\b(dental|dentistry|dentist|dds|dmd|family|care|clinic|center|associates?|group|practice|office|pc|llc|inc)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (cleaned && cleaned !== practiceName) {
        terms.push(cleaned);
    }

    return terms.slice(0, 2); // Limit to 2 variations
}

// Calculate name similarity using Levenshtein distance
function calculateNameSimilarity(name1, name2) {
    const s1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;
    
    const distance = levenshteinDistance(s1, s2);
    return 1 - (distance / maxLen);
}

// Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Calculate confidence score
function calculateConfidence(adsFound, searchesPerformed, bestMatch) {
    let confidence = 70; // Base confidence

    if (adsFound > 0) {
        confidence += Math.min(adsFound * 10, 20); // Up to +20 for multiple ads
        if (bestMatch && bestMatch.length > 0) {
            confidence += 10; // +10 for having a best match
        }
    }

    // Adjust based on number of searches performed
    if (searchesPerformed >= 2) {
        confidence += 5;
    }

    return Math.min(confidence, 95); // Cap at 95%
}

// Calculate summary statistics
function calculateSummary(results, totalApiCalls) {
    const practicesWithAds = results.filter(r => r.hasAds === true).length;
    const practicesWithVerifiedData = results.filter(r => r.verified === true).length;
    const practicesWithNoData = results.filter(r => r.hasAds === null).length;

    // Count by source
    const sources = results.reduce((acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1;
        return acc;
    }, {});

    return {
        practicesWithAds: practicesWithAds,
        totalPractices: results.length,
        practicesWithVerifiedData: practicesWithVerifiedData,
        practicesWithNoData: practicesWithNoData,
        dataSources: {
            googlePlaces: sources.google_places || 0,
            yelp: sources.yelp || 0,
            both: sources.both || 0,
            duplicatesRemoved: 0 // Handled in practice discovery
        }
    };
}

// Utility function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
