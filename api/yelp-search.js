export default async function handler(req, res) {
  // CORS
  const allowed = [
    'https://www.establishedshot.com',
    'https://dental-map.vercel.app',
    'https://map.establishedshot.com',
    'https://dental-map-git-main-nicolas-projects-d1a13165.vercel.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { latitude, longitude, radius, categories } = req.body;
    const yelpApiKey = process.env.YELP_API_KEY;
    
    if (!yelpApiKey) {
      return res.status(500).json({ error: 'Yelp API key not configured' });
    }

    const response = await fetch(`https://api.yelp.com/v3/businesses/search?` +
      `latitude=${latitude}&longitude=${longitude}&radius=${radius}&categories=${categories}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert Yelp format to match Google Places format
    const normalizedBusinesses = data.businesses.map(business => ({
      place_id: `yelp_${business.id}`,
      name: business.name,
      geometry: {
        location: {
          lat: () => business.coordinates.latitude,
          lng: () => business.coordinates.longitude
        }
      },
      rating: business.rating,
      user_ratings_total: business.review_count,
      vicinity: business.location.display_address.join(', '),
      website: business.url,
      source: 'yelp'
    }));

    res.status(200).json({
      businesses: normalizedBusinesses,
      total: data.total
    });

  } catch (error) {
    console.error('Yelp search error:', error);
    res.status(500).json({ error: 'Yelp search failed' });
  }
}
