// ClubHub Configuration
// =====================
// After deploying your Google Apps Script, paste the Web App URL below.
// See README.md for step-by-step deployment instructions.

const CONFIG = {
  // 🔴 REQUIRED: Replace with your Apps Script Web App URL
  // Go to Apps Script → Deploy → New deployment → Web App → Copy URL
  //https://script.google.com/macros/s/AKfycbzFp8u0iuy6nlh9DiCSR2Cz-RAM-Fy-stPh1xZsF21c6dIgjQ-hI-noCgoCmrGUeo1Nfw/exec
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzFp8u0iuy6nlh9DiCSR2Cz-RAM-Fy-stPh1xZsF21c6dIgjQ-hI-noCgoCmrGUeo1Nfw/exec',

  // Club settings
  CLUB_NAME: 'T PICKLEBALL CLUB',
  CLUB_TAGLINE: 'PickleBall Club Platform',
  CLUB_EMOJI: '🏓',

  // Feature flags
  ENABLE_ONLINE_PAYMENT: false,    // Set true when Stripe/PayMongo connected
  ENABLE_WAITLIST: true,
  ENABLE_KIOSK: true,
  MAX_BOOKING_DAYS_AHEAD: 30,

  // Sports offered (customize for your club)
  SPORTS: ['Pickleball'],

  // Membership tiers
  MEMBERSHIP_TIERS: [
    { id: 'guest', name: 'Guest', price: 0, color: '#6b6b63' },
    { id: 'basic', name: 'Basic', price: 500, color: '#2d6a4f' },
    { id: 'premium', name: 'Premium', price: 1200, color: '#d4a843' },
    { id: 'vip', name: 'VIP', price: 2500, color: '#7b2d8b' }
  ],

  // Demo mode — uses local mock data when Apps Script is not configured
  DEMO_MODE: false,
  //if (CONFIG.APPS_SCRIPT_URL.includes('https://script.google.com/macros/s/AKfycbzFp8u0iuy6nlh9DiCSR2Cz-RAM-Fy-stPh1xZsF21c6dIgjQ-hI-noCgoCmrGUeo1Nfw/exec')) {
  //CONFIG.DEMO_MODE = true;  // ← will be false once URL is real
//}

  // Version
  VERSION: '1.0.0'
};

// Auto-detect demo mode
if (CONFIG.APPS_SCRIPT_URL.includes('https://script.google.com/macros/s/AKfycbzFp8u0iuy6nlh9DiCSR2Cz-RAM-Fy-stPh1xZsF21c6dIgjQ-hI-noCgoCmrGUeo1Nfw/exec')) {
  CONFIG.DEMO_MODE = true;
  console.warn('ClubHub: Running in demo mode. Set APPS_SCRIPT_URL in js/config.js');
}
