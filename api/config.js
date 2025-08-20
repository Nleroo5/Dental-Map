// api/config.js - Serve Google Maps API key securely
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        // Return the Google Maps API key from environment variables
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'Google Maps API key not configured'
            });
        }

        return res.status(200).json({
            success: true,
            googleMapsApiKey: apiKey
        });

    } catch (error) {
        console.error('Config API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
