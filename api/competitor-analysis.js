<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dental Meta Ads Map Tool - Enhanced Practice Discovery</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --navy: #012E40;
            --gold: #F2A922;
            --teal: #05908C;
            --mint: #85C7B3;
            --foam: #EEF4D9;
            --ink: #0b1720;
            --card: #06222e;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }
        
        * { box-sizing: border-box; }
        html, body { height: 100%; }
        
        body {
            margin: 0;
            font-family: Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            color: #e9f3f3;
            background:
                radial-gradient(1200px 600px at 10% -10%, rgba(5,144,140,.35), transparent 60%),
                radial-gradient(900px 600px at 110% 40%, rgba(242,169,34,.18), transparent 60%),
                linear-gradient(180deg, #031923 0%, #03161d 100%);
        }
        
        .wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px 16px 40px;
        }
        
        header {
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo-dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--gold);
            box-shadow: 0 0 0 4px rgba(242,169,34,.2);
            animation: pulse 2s infinite;
        }
        
        .title {
            font-family: "Young Serif", serif;
            font-size: 24px;
            letter-spacing: .2px;
        }
        
        .subtitle {
            color: #b8d8d3;
            font-size: 14px;
            margin-top: -2px;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
        
        .toolbar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.07);
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 6px 16px rgba(0,0,0,.25);
        }
        
        .search-wrapper {
            position: relative;
            width: 360px;
            max-width: 80vw;
        }
        
        input[type="text"] {
            width: 100%;
            background: #081f29;
            border: 1px solid rgba(255,255,255,.12);
            color: #e6f1f1;
            padding: 12px 14px;
            border-radius: 10px;
            outline: 0;
            font-size: 14px;
        }
        
        input[type="text"]:focus {
            border-color: var(--gold);
        }
        
        input[type="text"]::placeholder {
            color: #9ca3af;
        }
        
        select, button {
            appearance: none;
            background: #092431;
            border: 1px solid rgba(255,255,255,.12);
            color: #e6f1f1;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            transition: all .2s;
            font-size: 14px;
        }
        
        button.primary {
            background: var(--gold);
            border-color: var(--gold);
            color: #0d1012;
            font-weight: 600;
        }
        
        button:hover {
            background: rgba(255,255,255,.1);
        }
        
        button.primary:hover {
            background: #e09820;
        }
        
        button:disabled {
            background: #444;
            cursor: not-allowed;
        }
        
        .autocomplete-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #081f29;
            border: 1px solid rgba(255,255,255,.12);
            border-top: none;
            border-radius: 0 0 10px 10px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        }
        
        .autocomplete-item {
            padding: 12px 14px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255,255,255,.05);
            transition: background-color 0.2s;
            color: #e6f1f1;
        }
        
        .autocomplete-item:hover {
            background: rgba(255,255,255,.1);
        }
        
        .grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 16px;
            margin-top: 12px;
        }
        
        #map {
            width: 100%;
            height: 75vh;
            min-height: 560px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,.08);
            box-shadow: 0 8px 24px rgba(0,0,0,.35);
            overflow: hidden;
            background: #05171f;
        }
        
        .panel {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        
        .card {
            background: var(--card);
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 14px;
            padding: 16px;
            box-shadow: 0 10px 24px rgba(0,0,0,.35);
            position: relative;
        }
        
        .card h3 {
            margin: 0 0 12px 0;
            font-family: "Young Serif", serif;
            font-weight: 400;
            color: #f3f7f6;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,.7);
            display: none;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            z-index: 100;
            flex-direction: column;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(242,169,34,.3);
            border-top: 3px solid var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        
        .loading-text {
            color: #e9f3f3;
            font-size: 14px;
            text-align: center;
        }
        
        .loading-progress {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .success-message, .error-message {
            padding: 16px;
            border-radius: 12px;
            margin: 16px 0;
            font-size: 14px;
        }
        
        .success-message {
            background: rgba(16,185,129,.1);
            border: 1px solid rgba(16,185,129,.3);
            color: #10b981;
        }
        
        .error-message {
            background: rgba(239,68,68,.1);
            border: 1px solid rgba(239,68,68,.3);
            color: #ef4444;
        }
        
        .data-quality {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 8px;
        }
        
        .data-quality.verified {
            background: rgba(16,185,129,.2);
            color: #10b981;
        }
        
        .data-quality.live {
            background: rgba(59,130,246,.2);
            color: #3b82f6;
        }
        
        @media (max-width: 980px) {
            .grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            #map {
                min-height: 420px;
                height: 60vh;
            }
            
            .search-wrapper {
                width: 100%;
            }
            
            .toolbar {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head>
<body>
    <div class="wrap">
        <header>
            <div class="brand">
                <div class="logo-dot"></div>
                <div>
                    <div class="title">Dental Meta Ads Map Tool</div>
                    <div class="subtitle">Enhanced Practice Discovery & Real Meta Advertising Intelligence</div>
                </div>
            </div>
        </header>

        <div class="toolbar">
            <div class="search-wrapper">
                <input id="practiceSearch" type="text" placeholder="Search for dental practice name...">
                <div class="autocomplete-dropdown" id="autocompleteDropdown"></div>
            </div>
            
            <select id="radius">
                <option value="3">3 mi radius</option>
                <option value="5">5 mi radius</option>
                <option value="10" selected>10 mi radius</option>
            </select>
            
            <button id="analyzeBtn" class="primary" disabled>🔍 Analyze Market</button>
        </div>

        <div class="grid">
            <div style="position: relative;">
                <div id="map"></div>
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="spinner"></div>
                    <div class="loading-text" id="loadingText">Analyzing market...</div>
                    <div class="loading-progress" id="loadingProgress"></div>
                </div>
            </div>

            <div class="panel">
                <div class="card">
                    <h3>📊 Analysis Results <span class="data-quality verified">✅ PLACES API</span></h3>
                    <div id="analysisResults" style="line-height: 1.6; font-size: 14px; color: #b8d8d3;">
                        Select a practice above to begin real-time market analysis using:
                        <br><br>
                        • <strong style="color: var(--gold);">Google Places API</strong> - Practice discovery
                        <br>• <strong style="color: var(--teal);">Yelp Fusion API</strong> - Additional coverage  
                        <br>• <strong style="color: var(--danger);">Meta Ad Library API</strong> - Live advertising data
                        <br><br>
                        <span style="color: #10b981; font-weight: 600;">✅ Using correct API endpoints!</span>
                    </div>
                </div>

                <div class="card">
                    <h3>🏥 Practice Details</h3>
                    <div id="practiceDetails" style="line-height: 1.6; font-size: 14px; color: #b8d8d3;">
                        Click on map markers to view detailed practice information including contact info, ratings, and current Meta advertising status.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let map;
        let selectedPractice = null;
        let practiceMarkers = [];
        let infoWindow;
        let autocompleteService;
        let placesService;

        // 🚀 FIXED VERSION - Uses correct Google Places API endpoints
        async function initApp() {
            console.log('🚀 Dental Meta Ads Map Tool Loading with FIXED APIs...');
            
            try {
                // Hardcode API key as fallback if server fails
                const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE'; // Replace with your actual key
                
                console.log('⚡ Loading Google Maps with Places library...');
                await loadGoogleMaps(API_KEY);
                
                initializeComponents();
                console.log('✅ Dental Meta Ads Map Tool Ready - Fixed API endpoints!');
                
            } catch (error) {
                console.error('❌ App initialization failed:', error);
                showMessage('Failed to initialize: ' + error.message, 'error');
            }
        }

        // Load Google Maps API with Places library
        function loadGoogleMaps(apiKey) {
            return new Promise((resolve, reject) => {
                if (window.google && window.google.maps) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                // ✅ FIXED: Include places library for autocomplete
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load Google Maps API'));
                document.head.appendChild(script);
            });
        }

        // Initialize components
        function initializeComponents() {
            initMap();
            initEventListeners();
            initPlacesAutocomplete();
        }

        // Initialize Google Maps
        function initMap() {
            const defaultCenter = { lat: 33.7490, lng: -84.3880 };
            
            map = new google.maps.Map(document.getElementById('map'), {
                center: defaultCenter,
                zoom: 12,
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                    {
                        featureType: 'poi.business',
                        stylers: [{ visibility: 'off' }]
                    },
                    {
                        featureType: 'poi.medical',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            infoWindow = new google.maps.InfoWindow();
            
            // Initialize Places services
            autocompleteService = new google.maps.places.AutocompleteService();
            placesService = new google.maps.places.PlacesService(map);
        }

        // ✅ FIXED: Proper autocomplete using Google Places library
        function initPlacesAutocomplete() {
            const searchInput = document.getElementById('practiceSearch');
            const dropdown = document.getElementById('autocompleteDropdown');
            let debounceTimeout;

            searchInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                
                clearTimeout(debounceTimeout);
                
                if (value.length < 3) {
                    dropdown.style.display = 'none';
                    return;
                }

                debounceTimeout = setTimeout(() => {
                    getPlacesAutocomplete(value);
                }, 300);
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-wrapper')) {
                    dropdown.style.display = 'none';
                }
            });
        }

        // ✅ FIXED: Use correct Places Autocomplete service
        function getPlacesAutocomplete(input) {
            const request = {
                input: input,
                types: ['establishment'],
                componentRestrictions: { country: 'us' },
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(33.4, -85.0),
                    new google.maps.LatLng(34.0, -84.0)
                )
            };

            autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    // Filter for dental practices
                    const dentalPredictions = predictions.filter(p => {
                        const desc = p.description.toLowerCase();
                        return desc.includes('dental') || 
                               desc.includes('dentist') || 
                               desc.includes('orthodont') ||
                               desc.includes('smile');
                    });
                    
                    displayAutocompleteResults(dentalPredictions.slice(0, 5));
                } else {
                    document.getElementById('autocompleteDropdown').style.display = 'none';
                }
            });
        }

        // Display autocomplete results
        function displayAutocompleteResults(predictions) {
            const dropdown = document.getElementById('autocompleteDropdown');
            dropdown.innerHTML = '';

            if (predictions.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            predictions.forEach(prediction => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `
                    <div style="font-weight: 500;">${prediction.structured_formatting.main_text}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${prediction.structured_formatting.secondary_text}</div>
                `;
                
                item.addEventListener('click', () => {
                    selectPracticeFromPrediction(prediction);
                    dropdown.style.display = 'none';
                });

                dropdown.appendChild(item);
            });

            dropdown.style.display = 'block';
        }

        // ✅ FIXED: Use correct Place Details service
        function selectPracticeFromPrediction(prediction) {
            const searchInput = document.getElementById('practiceSearch');
            searchInput.value = prediction.structured_formatting.main_text;

            const request = {
                placeId: prediction.place_id,
                fields: [
                    'place_id', 'name', 'formatted_address', 'geometry',
                    'formatted_phone_number', 'website', 'rating', 'user_ratings_total'
                ]
            };

            placesService.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    selectedPractice = place;
                    
                    map.setCenter(place.geometry.location);
                    map.setZoom(14);
                    
                    document.getElementById('analyzeBtn').disabled = false;
                    
                    clearMarkers();
                    addSelectedPracticeMarker(place);
                    
                    showMessage(`Selected: ${place.name}`, 'success');
                } else {
                    console.error('Place details request failed:', status);
                    showMessage('Error getting practice details', 'error');
                }
            });
        }

        // ✅ FIXED: Use correct Nearby Search service  
        function getNearbyPracticesFromPlaces(center, radiusMeters) {
            return new Promise((resolve, reject) => {
                const request = {
                    location: center,
                    radius: radiusMeters,
                    type: 'dentist'
                };

                placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const practices = results.map(place => ({
                            place_id: place.place_id,
                            name: place.name,
                            formatted_address: place.vicinity,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                            rating: place.rating,
                            user_ratings_total: place.user_ratings_total,
                            source: 'google_places'
                        }));
                        resolve(practices);
                    } else {
                        console.error('Nearby search failed:', status);
                        resolve([]);
                    }
                });
            });
        }

        // Get practices from Yelp API
        async function getNearbyPracticesFromYelp(center, radius) {
            try {
                console.log('🔍 Searching Yelp for additional practices...');
                
                const response = await fetch('/api/yelp-search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        latitude: center.lat(),
                        longitude: center.lng(),
                        radius: radius
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.practices || [];
                } else {
                    console.error('❌ Yelp search failed:', response.status);
                    return [];
                }
            } catch (error) {
                console.error('❌ Yelp search error:', error);
                return [];
            }
        }

        // Check Meta ads for practices
        async function checkMetaAdsForPractices(practices) {
            try {
                console.log('📱 Checking Meta advertising status...');
                
                const response = await fetch('/api/competitor-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        practices: practices
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    return practices.map(practice => {
                        const adData = data.practiceBreakdown?.find(p => p.practiceId === practice.place_id);
                        return {
                            ...practice,
                            hasActiveAds: adData ? adData.hasAds : null,
                            adVerified: adData ? adData.verified : false,
                            adConfidence: adData ? adData.confidence : 0
                        };
                    });
                } else {
                    console.error('❌ Meta ads check failed:', response.status);
                    return practices.map(practice => ({
                        ...practice,
                        hasActiveAds: null,
                        adVerified: false,
                        adConfidence: 0
                    }));
                }
            } catch (error) {
                console.error('❌ Meta ads check error:', error);
                return practices.map(practice => ({
                    ...practice,
                    hasActiveAds: null,
                    adVerified: false,
                    adConfidence: 0
                }));
            }
        }

        // Add selected practice marker
        function addSelectedPracticeMarker(place) {
            const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#f59e0b" stroke="white" stroke-width="2"/>
                            <circle cx="12" cy="12" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 12)
                }
            });

            marker.addListener('click', () => {
                showPracticeInfo(place, marker);
            });

            practiceMarkers.push(marker);
        }

        // Show practice info popup
        function showPracticeInfo(practice, marker) {
            const content = `
                <div style="background: var(--card); padding: 16px; border-radius: 12px; max-width: 300px; color: #e9f3f3;">
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${practice.name}</div>
                    ${practice.formatted_address ? `<div style="margin-bottom: 6px;">📍 ${practice.formatted_address}</div>` : ''}
                    ${practice.formatted_phone_number ? `<div style="margin-bottom: 6px;">📞 ${practice.formatted_phone_number}</div>` : ''}
                    ${practice.website ? `<div style="margin-bottom: 6px;">🌐 <a href="${practice.website}" target="_blank" style="color: var(--gold);">Website</a></div>` : ''}
                    ${practice.rating ? `<div style="margin-bottom: 6px;">⭐ ${practice.rating} (${practice.user_ratings_total || 0} reviews)</div>` : ''}
                    <div style="font-size: 12px; color: #10b981; margin-top: 8px;">✅ Google Places API</div>
                </div>
            `;

            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        }

        // Initialize event listeners
        function initEventListeners() {
            document.getElementById('analyzeBtn').addEventListener('click', analyzeMarket);
        }

        // ✅ MAIN ANALYSIS FUNCTION - Fixed to use correct APIs
        async function analyzeMarket() {
            if (!selectedPractice) {
                showMessage('Please select a practice first', 'error');
                return;
            }

            showLoading(true);
            clearMarkers();
            
            try {
                updateLoadingText('Finding nearby practices with Google Places API...');
                
                const radiusSelect = document.getElementById('radius');
                const radiusMiles = parseInt(radiusSelect.value);
                const radiusMeters = radiusMiles * 1609.34;

                // ✅ Get practices from correct Places API
                const placesPractices = await getNearbyPracticesFromPlaces(selectedPractice.geometry.location, radiusMeters);
                
                updateLoadingText('Expanding search with Yelp API...');
                
                // ✅ Get additional practices from Yelp
                const yelpPractices = await getNearbyPracticesFromYelp(selectedPractice.geometry.location, radiusMeters);
                
                updateLoadingText('Removing duplicates...');
                
                // ✅ Combine and deduplicate
                const allPractices = deduplicatePractices([...placesPractices, ...yelpPractices]);
                
                updateLoadingText('Checking Meta advertising status...', `Analyzing ${allPractices.length} practices`);
                
                // ✅ Check Meta ads (your existing API)
                const practicesWithAds = await checkMetaAdsForPractices(allPractices);
                
                // ✅ Display everything
                displayPractices(practicesWithAds);
                updateAnalysisResults(practicesWithAds);
                
                showLoading(false);
                showMessage(`✅ Analysis complete! Found ${practicesWithAds.length} practices using Google Places + Yelp + Meta Ad Library.`, 'success');
                
            } catch (error) {
                console.error('❌ Analysis error:', error);
                showLoading(false);
                showMessage(`Analysis failed: ${error.message}`, 'error');
            }
        }

        // Deduplicate practices from multiple sources
        function deduplicatePractices(practices) {
            const unique = [];
            const seenNames = new Set();
            
            practices.forEach(practice => {
                const normalizedName = practice.name.toLowerCase().trim();
                if (!seenNames.has(normalizedName)) {
                    seenNames.add(normalizedName);
                    unique.push(practice);
                }
            });
            
            return unique;
        }

        // Display practices on the map
        function displayPractices(practices) {
            clearMarkers();
            
            practices.forEach(practice => {
                const marker = createPracticeMarker(practice);
                practiceMarkers.push(marker);
            });

            // Re-add selected practice marker
            if (selectedPractice) {
                addSelectedPracticeMarker(selectedPractice);
            }
        }

        // Create marker for a practice
        function createPracticeMarker(practice) {
            let color;
            if (practice.hasActiveAds === true) {
                color = '#dc2626'; // Red for has ads
            } else if (practice.hasActiveAds === false) {
                color = '#16a34a'; // Green for no ads
            } else {
                color = '#6b7280'; // Gray for unknown
            }

            const marker = new google.maps.Marker({
                position: { lat: practice.lat, lng: practice.lng },
                map: map,
                title: practice.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="${color}" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(20, 20),
                    anchor: new google.maps.Point(10, 10)
                }
            });

            marker.addListener('click', () => {
                showPracticeInfo(practice, marker);
            });

            return marker;
        }

        // Update analysis results display
        function updateAnalysisResults(practices) {
            const total = practices.length;
            const withAds = practices.filter(p => p.hasActiveAds === true).length;
            const verified = practices.filter(p => p.adVerified === true).length;
            const placesCount = practices.filter(p => p.source === 'google_places').length;
            const yelpCount = practices.filter(p => p.source === 'yelp').length;
            
            const resultsDiv = document.getElementById('analysisResults');
            resultsDiv.innerHTML = `
                <strong style="color: var(--gold); font-size: 16px;">✅ ANALYSIS COMPLETE</strong><br><br>
                
                📊 <strong>${total}</strong> total practices found<br>
                🔍 <strong>${placesCount}</strong> from Google Places API<br>
                🔄 <strong>${yelpCount}</strong> from Yelp API<br>
                🔴 <strong>${withAds}</strong> with active Meta advertising<br>
                ✅ <strong>${verified}</strong> verified through Meta Ad Library API<br>
                📈 <strong>${total > 0 ? Math.round((verified / total) * 100) : 0}%</strong> data coverage<br><br>
                
                <div style="font-size: 12px; color: #10b981; margin-top: 12px;">
                    ✅ Using correct Google Places API endpoints!
                </div>
            `;
        }

        // Clear all markers
        function clearMarkers() {
            practiceMarkers.forEach(marker => {
                marker.setMap(null);
            });
            practiceMarkers = [];
        }

        // Show/hide loading
        function showLoading(show) {
            const overlay = document.getElementById('loadingOverlay');
            overlay.style.display = show ? 'flex' : 'none';
        }

        // Update loading text
        function updateLoadingText(text, progress = '') {
            document.getElementById('loadingText').textContent = text;
            document.getElementById('loadingProgress').textContent = progress;
        }

        // Show message to user
        function showMessage(message, type = 'info') {
            const existing = document.querySelector('.error-message, .success-message');
            if (existing) {
                existing.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
            messageDiv.textContent = message;

            const toolbar = document.querySelector('.toolbar');
            toolbar.insertAdjacentElement('afterend', messageDiv);

            if (type === 'success') {
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 5000);
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);
    </script>
</body>
</html>
