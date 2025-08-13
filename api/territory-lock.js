// Territory Lock Management System
// Handles territory locking, holds, and real-time sync between users

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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    switch (req.method) {
      case 'GET':
        return await getLockedTerritories(req, res);
      case 'POST':
        return await lockTerritory(req, res);
      case 'PUT':
        return await holdTerritory(req, res);
      case 'DELETE':
        return await releaseTerritory(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Territory API Error:', error);
    res.status(500).json({ 
      error: 'Territory operation failed',
      details: error.message 
    });
  }
}

// Get all locked territories
async function getLockedTerritories(req, res) {
  // In production, this would query your database
  // For now, return simulated locked territories
  
  const lockedTerritories = [
    {
      id: 'territory_1',
      lat: 33.8488,
      lng: -84.3877,
      radius: 10,
      practice: "Smile Atlanta",
      practiceAddress: "123 Peachtree St, Atlanta, GA",
      rep: "Jessica M.",
      repEmail: "jessica@establishedshot.com",
      lockDate: "2024-01-15T10:30:00Z",
      locked: true,
      monthlyFee: 2500,
      status: "ACTIVE"
    },
    {
      id: 'territory_2', 
      lat: 33.6488,
      lng: -84.4877,
      radius: 10,
      practice: "Buckhead Dental",
      practiceAddress: "456 Buckhead Ave, Atlanta, GA",
      rep: "Michael R.",
      repEmail: "michael@establishedshot.com",
      lockDate: "2024-01-20T14:15:00Z",
      locked: true,
      monthlyFee: 2500,
      status: "ACTIVE"
    },
    {
      id: 'territory_3',
      lat: 34.1488,
      lng: -84.2877,
      radius: 10,
      practice: "Roswell Orthodontics", 
      practiceAddress: "789 Roswell Rd, Roswell, GA",
      rep: "Sarah K.",
      repEmail: "sarah@establishedshot.com",
      lockDate: "2024-02-01T09:45:00Z",
      locked: true,
      monthlyFee: 2500,
      status: "ACTIVE"
    }
  ];
  
  // Add territories on hold
  const heldTerritories = await getHeldTerritories();
  
  res.status(200).json({
    success: true,
    locked: lockedTerritories,
    held: heldTerritories,
    availableCount: Math.max(1, 8 - lockedTerritories.length),
    timestamp: new Date().toISOString()
  });
}

// Territory Lock Management System (No Payment Processing)
// Handles territory locking, holds, and real-time sync between users

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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    switch (req.method) {
      case 'GET':
        return await getLockedTerritories(req, res);
      case 'POST':
        return await lockTerritory(req, res);
      case 'PUT':
        return await holdTerritory(req, res);
      case 'DELETE':
        return await releaseTerritory(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Territory API Error:', error);
    res.status(500).json({ 
      error: 'Territory operation failed',
      details: error.message 
    });
  }
}

// Get all locked territories
async function getLockedTerritories(req, res) {
  // In production, this would query your database
  // For now, return simulated locked territories
  
  const lockedTerritories = [
    {
      id: 'territory_1',
      lat: 33.8488,
      lng: -84.3877,
      radius: 10,
      practice: "Smile Atlanta",
      practiceAddress: "123 Peachtree St, Atlanta, GA",
      rep: "Jessica M.",
      repEmail: "jessica@establishedshot.com",
      lockDate: "2024-01-15T10:30:00Z",
      locked: true,
      status: "ACTIVE"
    },
    {
      id: 'territory_2', 
      lat: 33.6488,
      lng: -84.4877,
      radius: 10,
      practice: "Buckhead Dental",
      practiceAddress: "456 Buckhead Ave, Atlanta, GA",
      rep: "Michael R.",
      repEmail: "michael@establishedshot.com",
      lockDate: "2024-01-20T14:15:00Z",
      locked: true,
      status: "ACTIVE"
    },
    {
      id: 'territory_3',
      lat: 34.1488,
      lng: -84.2877,
      radius: 10,
      practice: "Roswell Orthodontics", 
      practiceAddress: "789 Roswell Rd, Roswell, GA",
      rep: "Sarah K.",
      repEmail: "sarah@establishedshot.com",
      lockDate: "2024-02-01T09:45:00Z",
      locked: true,
      status: "ACTIVE"
    }
  ];
  
  // Add territories on hold
  const heldTerritories = await getHeldTerritories();
  
  res.status(200).json({
    success: true,
    locked: lockedTerritories,
    held: heldTerritories,
    availableCount: Math.max(1, 8 - lockedTerritories.length),
    timestamp: new Date().toISOString()
  });
}

// Lock a territory permanently (no payment required)
async function lockTerritory(req, res) {
  const { 
    lat, 
    lng, 
    radius, 
    practice, 
    practiceAddress, 
    rep, 
    repEmail
  } = req.body;
  
  if (!lat || !lng || !radius || !practice || !rep) {
    return res.status(400).json({ 
      error: 'Missing required fields: lat, lng, radius, practice, rep' 
    });
  }
  
  // Check for territory conflicts
  const conflict = await checkTerritoryConflict(lat, lng, radius);
  if (conflict) {
    return res.status(409).json({
      error: 'Territory conflict detected',
      conflict: conflict
    });
  }
  
  // Create territory lock record
  const territoryId = generateTerritoryId();
  const lockData = {
    id: territoryId,
    lat,
    lng, 
    radius,
    practice,
    practiceAddress,
    rep,
    repEmail,
    lockDate: new Date().toISOString(),
    locked: true,
    status: "ACTIVE"
  };
  
  // In production, save to database
  await saveTerritoryLock(lockData);
  
  // Remove any existing hold for this location
  await removeHold(lat, lng);
  
  // Send confirmation notifications
  await sendLockConfirmation(lockData);
  
  res.status(201).json({
    success: true,
    territory: lockData,
    message: `Territory locked successfully for ${practice}`,
    lockDate: lockData.lockDate
  });
}

// Place a 48-hour hold on territory
async function holdTerritory(req, res) {
  const { lat, lng, radius, practice, rep, repEmail } = req.body;
  
  if (!lat || !lng || !radius || !practice || !rep) {
    return res.status(400).json({ 
      error: 'Missing required fields: lat, lng, radius, practice, rep' 
    });
  }
  
  // Check for territory conflicts
  const conflict = await checkTerritoryConflict(lat, lng, radius);
  if (conflict) {
    return res.status(409).json({
      error: 'Territory conflict detected', 
      conflict: conflict
    });
  }
  
  // Check if already held
  const existingHold = await checkExistingHold(lat, lng);
  if (existingHold) {
    return res.status(409).json({
      error: 'Territory already on hold',
      holdExpires: existingHold.expiresAt
    });
  }
  
  const holdId = generateHoldId();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
  
  const holdData = {
    id: holdId,
    lat,
    lng,
    radius,
    practice,
    rep,
    repEmail,
    holdDate: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "ACTIVE"
  };
  
  // In production, save to database
  await saveHold(holdData);
  
  // Set up automatic expiration
  scheduleHoldExpiration(holdId, expiresAt);
  
  res.status(201).json({
    success: true,
    hold: holdData,
    message: `Territory held for 48 hours`,
    expiresAt: expiresAt.toISOString(),
    timeRemaining: "47:59:59"
  });
}

// Release a territory (unlock or end hold)
async function releaseTerritory(req, res) {
  const { territoryId, holdId, reason } = req.body;
  
  if (territoryId) {
    // Release a locked territory
    const result = await releaseLock(territoryId, reason);
    res.status(200).json({
      success: true,
      message: 'Territory lock released',
      refundProcessed: result.refundProcessed
    });
  } else if (holdId) {
    // Release a hold
    await releaseHold(holdId);
    res.status(200).json({
      success: true,
      message: 'Territory hold released'
    });
  } else {
    res.status(400).json({
      error: 'Must specify territoryId or holdId'
    });
  }
}

// Helper Functions

async function checkTerritoryConflict(lat, lng, radius) {
  // Get all locked territories
  const locked = await getLockedTerritories();
  const held = await getHeldTerritories();
  const allTerritories = [...(locked.locked || []), ...(held || [])];
  
  for (const territory of allTerritories) {
    const distance = calculateDistance(lat, lng, territory.lat, territory.lng);
    const minDistance = (radius + territory.radius) * 1.609344; // Convert miles to km
    
    if (distance < minDistance) {
      return {
        type: territory.locked ? 'LOCKED' : 'HELD',
        practice: territory.practice,
        rep: territory.rep,
        distance: distance,
        minRequired: minDistance
      };
    }
  }
  
  return null;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula for distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function processPayment(paymentMethodId, amount) {
  // Payment processing removed - this is now a demo/analysis tool
  return { 
    success: true, 
    message: 'Territory locked for demonstration purposes'
  };
}

// Database simulation functions (replace with real database in production)

async function saveTerritoryLock(lockData) {
  // In production: await db.collection('territories').doc(lockData.id).set(lockData);
  console.log('Territory locked:', lockData);
}

async function saveHold(holdData) {
  // In production: await db.collection('holds').doc(holdData.id).set(holdData);
  console.log('Territory held:', holdData);
}

async function getHeldTerritories() {
  // In production: query database for active holds
  return []; // Simulate no current holds
}

async function checkExistingHold(lat, lng) {
  // In production: check database for existing holds at this location
  return null; // Simulate no existing hold
}

async function removeHold(lat, lng) {
  // In production: remove any hold at this location
  console.log('Hold removed for location:', lat, lng);
}

async function releaseLock(territoryId, reason) {
  // In production: update territory status and process refund if applicable
  console.log('Territory lock released:', territoryId, reason);
  return { refundProcessed: false };
}

async function releaseHold(holdId) {
  // In production: remove hold from database
  console.log('Hold released:', holdId);
}

function generateTerritoryId() {
  return `territory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateHoldId() {
  return `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateNextBilling() {
  // No billing needed for demo tool
  return null;
}

function scheduleHoldExpiration(holdId, expiresAt) {
  const timeUntilExpiration = new Date(expiresAt).getTime() - Date.now();
  
  if (timeUntilExpiration > 0) {
    setTimeout(async () => {
      await releaseHold(holdId);
      console.log('Hold expired automatically:', holdId);
    }, timeUntilExpiration);
  }
}

async function sendLockConfirmation(lockData) {
  // In production, send confirmation emails, Slack notifications, etc.
  console.log('Lock confirmation sent:', lockData.practice, lockData.rep);
}
