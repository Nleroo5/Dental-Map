// api/yelp-search.js - Yelp Business Search Endpoint (Fixed ES6 version)

const YELP_API_BASE = 'https://api.yelp.com/v3/businesses/search';

export default async function handler(req, res) {
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
}

// Search Yelp businesses
async function searchYelpBusinesses(latitude, longitude, radiusMeters) {
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

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
            'User-Agent': 'Dental-Map-Tool/1.0'
        }
    });

    if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
        throw new Error(`Yelp API error: ${result.error.description || result.error.code}`);
    }

    return result.businesses || [];
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
        case 2: return 2; // $
        case 3: return 3; // $$
        case 4: return 4; // $$
        default: return null;
    }
}
