// api/yelp-search.js - Yelp Business Search Endpoint
const https = require('https');

const YELP_API_BASE = 'https://api.yelp.com/v3/businesses/search';

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
            error: 'Method not allowed' 
        });
    }

    try {
        const { latitude, longitude, radius } = req.body;

        if (!latitude || !longitude || !radius) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: latitude, longitude, radius'
            });
        }

        if (!process.env.YELP_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Yelp API configuration missing'
            });
        }

        console.log(`Searching Yelp for dental practices at ${latitude}, ${longitude} within ${radius}m`);

        const yelpBusinesses = await searchYelpBusinesses(latitude, longitude, radius);
        
        // Transform Yelp data to match our internal format
        const transformedPractices = yelpBusinesses.map(transformYelpBusiness);

        return res.status(200).json({
            success: true,
            practices: transformedPractices,
            total: transformedPractices.length,
            source: 'yelp',
            searchParams: {
                latitude: latitude,
                longitude: longitude,
                radius: radius
            }
        });

    } catch (error) {
        console.error('Yelp search error:', error);
        return res.status(500).json({
            success: false,
            error: 'Yelp search failed',
            details: error.message,
            fallbackUsed: false
        });
    }
};

// Search Yelp businesses
async function searchYelpBusinesses(latitude, longitude, radiusMeters) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            term: 'dentist',
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: Math.min(radiusMeters, 40000).toString(), // Yelp max radius is 40km
            categories: 'dentists,orthodontists',
            limit: '50',
            sort_by: 'distance'
        });

        const url = `${YELP_API_BASE}?${params}`;

        const options = {
            headers: {
                'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
                'User-Agent': 'Dental-Map-Tool/1.0'
            }
        };

        https.get(url, options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (result.error) {
                        reject(new Error(`Yelp API error: ${result.error.description || result.error.code}`));
                        return;
                    }

                    resolve(result.businesses || []);
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });
    });
}

// Transform Yelp business data to our internal format
function transformYelpBusiness(yelpBusiness) {
    // Generate a place_id for Yelp businesses (since they don't have Google place_ids)
    const place_id = `yelp_${yelpBusiness.id}`;

    // Format address
    const address = yelpBusiness.location.display_address ? 
        yelpBusiness.location.display_address.join(', ') :
        `${yelpBusiness.location.address1 || ''}, ${yelpBusiness.location.city || ''}, ${yelpBusiness.location.state || ''} ${yelpBusiness.location.zip_code || ''}`.replace(/^,\s*/, '');

    // Format phone number
    const phone = yelpBusiness.display_phone || yelpBusiness.phone || null;

    return {
        place_id: place_id,
        name: yelpBusiness.name,
        formatted_address: address,
        formatted_phone_number: phone,
        website: yelpBusiness.url, // Yelp page URL
        rating: yelpBusiness.rating || null,
        user_ratings_total: yelpBusiness.review_count || 0,
        lat: yelpBusiness.coordinates?.latitude || null,
        lng: yelpBusiness.coordinates?.longitude || null,
        price_level: mapYelpPriceLevel(yelpBusiness.price),
        types: ['dentist', 'doctor', 'health', 'point_of_interest'],
        opening_hours: {
            open_now: yelpBusiness.hours?.[0]?.is_open_now || null
        },
        photos: yelpBusiness.image_url ? [yelpBusiness.image_url] : [],
        source: 'yelp',
        yelp_data: {
            id: yelpBusiness.id,
            alias: yelpBusiness.alias,
            categories: yelpBusiness.categories?.map(cat => ({
                alias: cat.alias,
                title: cat.title
            })) || [],
            transactions: yelpBusiness.transactions || [],
            distance: yelpBusiness.distance || null
        }
    };
}

// Map Yelp price levels to Google-style price levels (1-4)
function mapYelpPriceLevel(yelpPrice) {
    if (!yelpPrice) return null;
    
    switch (yelpPrice.length) {
        case 1: return 1; // $
        case 2: return 2; // $$
        case 3: return 3; // $$$
        case 4: return 4; // $$$$
        default: return null;
    }
}

// Helper function to calculate distance between two points (for deduplication)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
}

// Validate if business is actually a dental practice
function isDentalPractice(business) {
    const name = business.name.toLowerCase();
    const categories = business.categories?.map(cat => cat.alias.toLowerCase()) || [];
    
    // Check if it's explicitly dental
    const dentalKeywords = ['dental', 'dentist', 'orthodont', 'oral', 'teeth', 'smile'];
    const hasDentalKeyword = dentalKeywords.some(keyword => 
        name.includes(keyword) || categories.some(cat => cat.includes(keyword))
    );

    // Exclude non-dental medical practices
    const excludeKeywords = ['medical', 'physician', 'hospital', 'urgent care', 'pharmacy'];
    const hasExcludeKeyword = excludeKeywords.some(keyword => 
        name.includes(keyword)
    );

    return hasDentalKeyword && !hasExcludeKeyword;
}
