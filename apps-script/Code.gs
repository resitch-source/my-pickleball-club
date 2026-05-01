// ============================================================
// ClubHub — Google Apps Script Backend (Code.gs)
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to script.google.com → New Project → paste this entire file
// 2. Run setupSheets() ONCE to create all required sheets
// 3. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL into js/config.js → APPS_SCRIPT_URL
// ============================================================

// ── Sheet names ──────────────────────────────────────────────
const SHEETS = {
  MEMBERS:   'Members',
  EVENTS:    'Events',
  BOOKINGS:  'Bookings',
  CHECKINS:  'CheckIns',
  ANNOUNCE:  'Announcements',
};

// ── CORS helper ──────────────────────────────────────────────
function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Router ───────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    switch (action) {
      case 'login':         return makeResponse(handleLogin(e.parameter));
      case 'getMembers':    return makeResponse(getMembers());
      case 'getEvents':     return makeResponse(getEvents());
      case 'getBookings':   return makeResponse(getBookings(e.parameter.userId));
      case 'getCheckIns':   return makeResponse(getCheckIns());
      case 'getAnnouncements': return makeResponse(getAnnouncements());
      case 'getDashboard':  return makeResponse(getDashboard());
      default: return makeResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch(err) {
    return makeResponse({ success: false, message: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || '';
    switch (action) {
      case 'createEvent':    return makeResponse(createEvent(body.event));
      case 'updateEvent':    return makeResponse(updateEvent(body.id, body.event));
      case 'deleteEvent':    return makeResponse(deleteEvent(body.id));
      case 'createBooking':  return makeResponse(createBooking(body.userId, body.eventId));
      case 'cancelBooking':  return makeResponse(cancelBooking(body.id));
      case 'checkIn':        return makeResponse(recordCheckIn(body));
      case 'createMember':   return makeResponse(createMember(body.member));
      case 'updateMember':   return makeResponse(updateMember(body.id, body.member));
      default: return makeResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch(err) {
    return makeResponse({ success: false, message: err.message });
  }
}

// ── Sheet helpers ─────────────────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name + '. Run setupSheets() first.');
  return sh;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
    return obj;
  }).filter(r => r.id); // skip blank rows
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) return i + 1; // 1-indexed
  }
  return -1;
}

function appendRow(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sheet.appendRow(row);
}

function updateRow(sheet, rowNum, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((h, i) => {
    if (obj[h] !== undefined) sheet.getRange(rowNum, i + 1).setValue(obj[h]);
  });
}

function genId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

// ── AUTH ──────────────────────────────────────────────────────
function handleLogin(params) {
  const email = (params.email || '').toLowerCase();
  const password = params.password || '';
  if (!email || !password) return { success: false, message: 'Email and password required' };
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheetToObjects(sheet);
  const user = members.find(m => m.email.toLowerCase() === email);
  if (!user) return { success: false, message: 'No account found with that email' };
  // Simple password check (in production: use bcrypt via external API or store hashed)
  if (user.password !== password) return { success: false, message: 'Incorrect password' };
  const { password: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

// ── MEMBERS ───────────────────────────────────────────────────
function getMembers() {
  const members = sheetToObjects(getSheet(SHEETS.MEMBERS)).map(m => { const { password:_, ...s } = m; return s; });
  return { success: true, data: members };
}

function createMember(data) {
  if (!data.name || !data.email) return { success: false, message: 'Name and email required' };
  const sheet = getSheet(SHEETS.MEMBERS);
  const existing = sheetToObjects(sheet).find(m => m.email.toLowerCase() === data.email.toLowerCase());
  if (existing) return { success: false, message: 'Email already registered' };
  const member = {
    id: genId('U'),
    name: data.name,
    email: data.email,
    password: data.password || 'changeme',
    phone: data.phone || '',
    role: data.role || 'member',
    membership: data.membership || 'Guest',
    sport: data.sport || '',
    status: data.status || 'active',
    joined: new Date().toISOString().split('T')[0],
  };
  appendRow(sheet, member);
  const { password:_, ...safe } = member;
  return { success: true, member: safe, message: 'Member created successfully' };
}

function updateMember(id, data) {
  const sheet = getSheet(SHEETS.MEMBERS);
  const rowNum = findRowById(sheet, id);
  if (rowNum < 0) return { success: false, message: 'Member not found' };
  updateRow(sheet, rowNum, data);
  return { success: true, message: 'Member updated' };
}

// ── EVENTS ────────────────────────────────────────────────────
function getEvents() {
  return { success: true, data: sheetToObjects(getSheet(SHEETS.EVENTS)) };
}

function createEvent(data) {
  if (!data.name || !data.date) return { success: false, message: 'Name and date required' };
  const event = {
    id: genId('E'),
    name: data.name,
    sport: data.sport || '',
    type: data.type || 'open_play',
    date: data.date,
    time: data.time || '',
    endTime: data.endTime || '',
    location: data.location || '',
    capacity: parseInt(data.capacity) || 20,
    enrolled: 0,
    price: parseFloat(data.price) || 0,
    instructor: data.instructor || '',
    description: data.description || '',
    status: 'open',
    created: new Date().toISOString().split('T')[0],
  };
  appendRow(getSheet(SHEETS.EVENTS), event);
  return { success: true, id: event.id, message: 'Event created' };
}

function updateEvent(id, data) {
  const sheet = getSheet(SHEETS.EVENTS);
  const rowNum = findRowById(sheet, id);
  if (rowNum < 0) return { success: false, message: 'Event not found' };
  updateRow(sheet, rowNum, data);
  return { success: true, message: 'Event updated' };
}

function deleteEvent(id) {
  const sheet = getSheet(SHEETS.EVENTS);
  const rowNum = findRowById(sheet, id);
  if (rowNum < 0) return { success: false, message: 'Event not found' };
  sheet.deleteRow(rowNum);
  return { success: true, message: 'Event deleted' };
}

// ── BOOKINGS ──────────────────────────────────────────────────
function getBookings(userId) {
  const bookings = sheetToObjects(getSheet(SHEETS.BOOKINGS));
  return { success: true, data: userId ? bookings.filter(b => b.userId === userId) : bookings };
}

function createBooking(userId, eventId) {
  if (!userId || !eventId) return { success: false, message: 'userId and eventId required' };
  const evSheet = getSheet(SHEETS.EVENTS);
  const events = sheetToObjects(evSheet);
  const event = events.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'Event not found' };

  const enrolled = parseInt(event.enrolled) || 0;
  const capacity = parseInt(event.capacity) || 0;

  // Check for duplicate booking
  const bookings = sheetToObjects(getSheet(SHEETS.BOOKINGS));
  const dup = bookings.find(b => b.userId === userId && b.eventId === eventId);
  if (dup) return { success: false, message: 'Already booked for this event' };

  const isWaitlist = enrolled >= capacity;
  const booking = {
    id: genId('B'),
    userId, eventId,
    eventName: event.name,
    date: event.date,
    status: isWaitlist ? 'waitlisted' : 'confirmed',
    paid: 'false',
    amount: event.price,
    created: new Date().toISOString().split('T')[0],
  };
  appendRow(getSheet(SHEETS.BOOKINGS), booking);

  // Update enrolled count
  if (!isWaitlist) {
    const rowNum = findRowById(evSheet, eventId);
    const headers = evSheet.getRange(1,1,1,evSheet.getLastColumn()).getValues()[0];
    const enrolledCol = headers.indexOf('enrolled') + 1;
    evSheet.getRange(rowNum, enrolledCol).setValue(enrolled + 1);
    // Update status if full
    if (enrolled + 1 >= capacity) {
      const statusCol = headers.indexOf('status') + 1;
      evSheet.getRange(rowNum, statusCol).setValue('full');
    }
  }
  return { success: true, booking, message: isWaitlist ? 'Added to waitlist' : 'Booking confirmed!' };
}

function cancelBooking(id) {
  const bkSheet = getSheet(SHEETS.BOOKINGS);
  const rowNum = findRowById(bkSheet, id);
  if (rowNum < 0) return { success: false, message: 'Booking not found' };
  const bookings = sheetToObjects(bkSheet);
  const booking = bookings.find(b => b.id === id);

  // Decrease enrolled on event
  if (booking && booking.status === 'confirmed') {
    const evSheet = getSheet(SHEETS.EVENTS);
    const evRowNum = findRowById(evSheet, booking.eventId);
    if (evRowNum > 0) {
      const headers = evSheet.getRange(1,1,1,evSheet.getLastColumn()).getValues()[0];
      const enrolledCol = headers.indexOf('enrolled') + 1;
      const statusCol = headers.indexOf('status') + 1;
      const cur = parseInt(evSheet.getRange(evRowNum, enrolledCol).getValue()) || 0;
      evSheet.getRange(evRowNum, enrolledCol).setValue(Math.max(0, cur - 1));
      evSheet.getRange(evRowNum, statusCol).setValue('open');
      // Promote waitlisted
      const waitlisted = bookings.find(b => b.eventId === booking.eventId && b.status === 'waitlisted');
      if (waitlisted) {
        const wRowNum = findRowById(bkSheet, waitlisted.id);
        const bHeaders = bkSheet.getRange(1,1,1,bkSheet.getLastColumn()).getValues()[0];
        const statusCol2 = bHeaders.indexOf('status') + 1;
        bkSheet.getRange(wRowNum, statusCol2).setValue('confirmed');
        evSheet.getRange(evRowNum, enrolledCol).setValue(Math.max(0, cur));
      }
    }
  }
  bkSheet.deleteRow(rowNum);
  return { success: true, message: 'Booking cancelled' };
}

// ── CHECK-INS ─────────────────────────────────────────────────
function getCheckIns() {
  return { success: true, data: sheetToObjects(getSheet(SHEETS.CHECKINS)) };
}

function recordCheckIn(data) {
  const now = new Date();
  const checkIn = {
    id: genId('C'),
    userId: data.userId || 'GUEST',
    userName: data.userName || 'Guest',
    event: data.event || 'General Access',
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
    timestamp: now.toISOString(),
  };
  appendRow(getSheet(SHEETS.CHECKINS), checkIn);
  return { success: true, checkIn, message: 'Checked in: ' + checkIn.userName };
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
function getAnnouncements() {
  return { success: true, data: sheetToObjects(getSheet(SHEETS.ANNOUNCE)) };
}

// ── DASHBOARD ─────────────────────────────────────────────────
function getDashboard() {
  const members = sheetToObjects(getSheet(SHEETS.MEMBERS));
  const events = sheetToObjects(getSheet(SHEETS.EVENTS));
  const bookings = sheetToObjects(getSheet(SHEETS.BOOKINGS));
  const checkIns = sheetToObjects(getSheet(SHEETS.CHECKINS));
  const today = new Date().toISOString().split('T')[0];
  return { success: true, data: {
    totalMembers: members.filter(m => m.role === 'member').length,
    activeMembers: members.filter(m => m.role === 'member' && m.status === 'active').length,
    totalEvents: events.length,
    openEvents: events.filter(e => e.status === 'open').length,
    todayCheckIns: checkIns.filter(c => c.date === today).length,
    recentBookings: bookings.slice(-5).reverse(),
    upcomingEvents: events.filter(e => e.status === 'open').slice(0, 5),
  }};
}

// ── SETUP ─────────────────────────────────────────────────────
// Run this ONCE to initialize all sheets with correct headers
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const schemas = {
    [SHEETS.MEMBERS]: ['id','name','email','password','phone','role','membership','sport','status','joined'],
    [SHEETS.EVENTS]:  ['id','name','sport','type','date','time','endTime','location','capacity','enrolled','price','instructor','description','status','created'],
    [SHEETS.BOOKINGS]:['id','userId','eventId','eventName','date','status','paid','amount','created'],
    [SHEETS.CHECKINS]:['id','userId','userName','event','date','time','timestamp'],
    [SHEETS.ANNOUNCE]:['id','title','message','priority','date'],
  };

  Object.entries(schemas).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) { sheet = ss.insertSheet(name); }
    else { sheet.clear(); }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1a3a2a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    Logger.log('✓ Sheet created: ' + name);
  });

  // Seed demo admin user
  const memberSheet = ss.getSheetByName(SHEETS.MEMBERS);
  appendRow(memberSheet, {
    id:'U001', name:'Admin User', email:'admin@club.com', password:'admin123',
    phone:'+63 912 000 0001', role:'admin', membership:'VIP', sport:'All', status:'active',
    joined: new Date().toISOString().split('T')[0]
  });

  // Seed demo event
  const eventSheet = ss.getSheetByName(SHEETS.EVENTS);
  appendRow(eventSheet, {
    id:'E001', name:'Morning Tennis Clinic', sport:'Tennis', type:'clinic',
    date: new Date(Date.now()+86400000*3).toISOString().split('T')[0],
    time:'07:00', endTime:'09:00', location:'Court A', capacity:12, enrolled:0,
    price:350, instructor:'Coach Dave', description:'Improve your game!', status:'open',
    created: new Date().toISOString().split('T')[0]
  });

  // Seed demo announcement
  const annSheet = ss.getSheetByName(SHEETS.ANNOUNCE);
  appendRow(annSheet, {
    id:'A001', title:'Welcome to ClubHub!', message:'Your club management platform is now live. Book events and enjoy!',
    priority:'normal', date: new Date().toISOString().split('T')[0]
  });

  Logger.log('✅ Setup complete! All sheets created and seeded.');
  return 'Setup complete. Open your Sheets to verify.';
}
