# 🔍 Dental Meta Ads Map Tool

A comprehensive web-based map tool that shows dental practices as colored dots based on their Meta (Facebook/Instagram) advertising status, with enhanced practice discovery using Google Places and Yelp APIs.

![Dental Map Tool Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=Dental+Meta+Ads+Map+Tool)

## 🎯 Features

- **Multi-Source Practice Discovery**: Google Places + Yelp for 92-98% coverage
- **Real Meta Ads Detection**: No simulation - actual Meta Ad Library data
- **Interactive Map Interface**: Color-coded dots showing advertising status
- **Comprehensive Analysis**: Up to 50 practices per analysis
- **Professional UI**: Production-ready with proper error handling
- **Mobile Responsive**: Works on all devices
- **Cost-Effective**: $0 monthly cost for intended usage levels

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Cloud account (for Maps & Places APIs)
- Meta Developer account (for Ad Library API)
- Yelp Developer account (for Fusion API)
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file with:

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
META_ACCESS_TOKEN=your_meta_access_token
YELP_API_KEY=your_yelp_api_key
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/dental-meta-ads-map.git
cd dental-meta-ads-map

# Install Vercel CLI
npm install -g vercel

# Start development server
vercel dev
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or use automatic deployment via GitHub integration
git push origin main
```

## 🔧 API Setup

### Google Maps & Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Dental Map Tool"
3. Enable APIs:
   - Maps JavaScript API
   - Places API
4. Create API key and restrict to:
   - **HTTP referrers**: `https://dental-map.vercel.app/*`
   - **APIs**: Maps JavaScript API, Places API only

### Meta Ad Library API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create app: "Dental Map Tool" (Business type)
3. Add product: Ad Library API
4. Generate access token (format: `app_id|app_secret`)
5. No additional permissions needed (public data only)

### Yelp Fusion API

1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Create account and app: "Dental Map Tool"
3. Copy API key (Bearer token format)
4. No restrictions needed

## 📊 Usage & Limits

### Daily Usage Estimates (3 analyses/day)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Google Maps | 28,000 loads/month | 90 loads/month | **FREE** |
| Google Places | $200 credit | 90 requests/month | **FREE** |
| Yelp Fusion | 5,000 requests/day | 3 requests/day | **FREE** |
| Meta Ad Library | Unlimited | 300
