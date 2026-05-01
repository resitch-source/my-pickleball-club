// ClubHub API Layer
// Communicates with Google Apps Script backend.
// Falls back to demo data when DEMO_MODE is true.

const DEMO_DATA = {
  users: [
    { id:'U001', name:'Admin User', email:'admin@club.com', role:'admin', membership:'VIP', status:'active', joined:'2024-01-10', phone:'+63 912 000 0001', sport:'All' },
    { id:'U002', name:'Alex Rivera', email:'member@club.com', role:'member', membership:'Premium', status:'active', joined:'2024-03-15', phone:'+63 912 000 0002', sport:'Tennis' },
    { id:'U003', name:'Jordan Santos', email:'jordan@example.com', role:'member', membership:'Basic', status:'active', joined:'2024-04-01', phone:'+63 912 000 0003', sport:'Badminton' },
    { id:'U004', name:'Sam Reyes', email:'sam@example.com', role:'member', membership:'Guest', status:'active', joined:'2024-05-20', phone:'+63 912 000 0004', sport:'Basketball' },
    { id:'U005', name:'Maria Cruz', email:'maria@example.com', role:'member', membership:'Premium', status:'inactive', joined:'2024-02-10', phone:'+63 912 000 0005', sport:'Volleyball' },
    { id:'U006', name:'Jose Garcia', email:'jose@example.com', role:'member', membership:'Basic', status:'active', joined:'2024-06-01', phone:'+63 912 000 0006', sport:'Pickleball' },
  ],
  events: [
    { id:'E001', name:'Morning Tennis Clinic', sport:'Tennis', date:'2026-05-05', time:'07:00', endTime:'09:00', capacity:12, enrolled:8, location:'Court A', type:'clinic', price:350, instructor:'Coach Dave', status:'open', description:'Improve your serve and backhand with Coach Dave.' },
    { id:'E002', name:'Open Play Badminton', sport:'Badminton', date:'2026-05-03', time:'14:00', endTime:'16:00', capacity:20, enrolled:20, location:'Hall 1', type:'open_play', price:150, instructor:'', status:'full', description:'Open badminton session for all skill levels.' },
    { id:'E003', name:'Basketball 3v3 Tournament', sport:'Basketball', date:'2026-05-10', time:'09:00', endTime:'13:00', capacity:24, enrolled:12, location:'Main Court', type:'tournament', price:200, instructor:'', status:'open', description:'Competitive 3v3 tournament with prizes.' },
    { id:'E004', name:'Pickleball Beginners', sport:'Pickleball', date:'2026-05-07', time:'16:00', endTime:'18:00', capacity:8, enrolled:5, location:'Court B', type:'clinic', price:250, instructor:'Coach Lena', status:'open', description:'Perfect introduction to pickleball.' },
    { id:'E005', name:'Swim Laps Open', sport:'Swimming', date:'2026-05-04', time:'06:00', endTime:'08:00', capacity:30, enrolled:18, location:'Pool', type:'open_play', price:100, instructor:'', status:'open', description:'Early morning lane swimming.' },
    { id:'E006', name:'Volleyball Drills', sport:'Volleyball', date:'2026-05-06', time:'17:00', endTime:'19:00', capacity:16, enrolled:9, location:'Hall 2', type:'clinic', price:200, instructor:'Coach Ana', status:'open', description:'Spiking and setting drills.' },
  ],
  bookings: [
    { id:'B001', userId:'U002', eventId:'E001', eventName:'Morning Tennis Clinic', date:'2026-05-05', status:'confirmed', paid:true, amount:350 },
    { id:'B002', userId:'U002', eventId:'E003', eventName:'Basketball 3v3 Tournament', date:'2026-05-10', status:'confirmed', paid:false, amount:200 },
    { id:'B003', userId:'U003', eventId:'E002', eventName:'Open Play Badminton', date:'2026-05-03', status:'confirmed', paid:true, amount:150 },
    { id:'B004', userId:'U004', eventId:'E003', eventName:'Basketball 3v3 Tournament', date:'2026-05-10', status:'waitlisted', paid:false, amount:200 },
    { id:'B005', userId:'U006', eventId:'E004', eventName:'Pickleball Beginners', date:'2026-05-07', status:'confirmed', paid:true, amount:250 },
  ],
  checkIns: [
    { id:'C001', userId:'U002', userName:'Alex Rivera', date:'2026-05-01', time:'07:15', event:'Morning Tennis Clinic' },
    { id:'C002', userId:'U003', userName:'Jordan Santos', date:'2026-05-01', time:'14:05', event:'Open Play Badminton' },
  ],
  announcements: [
    { id:'A001', title:'Pool Maintenance', message:'Pool closed May 8 for scheduled maintenance. Reopens May 9.', date:'2026-04-30', priority:'high' },
    { id:'A002', title:'New Pickleball Courts', message:'Two new outdoor pickleball courts opening next month!', date:'2026-04-28', priority:'normal' },
  ]
};

const API = {
  async _call(action, params = {}) {
    if (CONFIG.DEMO_MODE) {
      return API._demo(action, params);
    }
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : v));
    try {
      const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
      return await res.json();
    } catch(e) {
      console.error('API error:', e);
      return API._demo(action, params);
    }
  },

  async _post(action, data = {}) {
    if (CONFIG.DEMO_MODE) {
      return API._demoPost(action, data);
    }
    try {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...data }),
        redirect: 'follow'
      });
      return await res.json();
    } catch(e) {
      console.error('API POST error:', e);
      return API._demoPost(action, data);
    }
  },

  _demo(action, params) {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    return delay(300).then(() => {
      switch(action) {
        case 'login': return { success: true, user: DEMO_DATA.users.find(u=>u.email===params.email) || DEMO_DATA.users[1] };
        case 'getMembers': return { success: true, data: DEMO_DATA.users };
        case 'getEvents': return { success: true, data: DEMO_DATA.events };
        case 'getBookings': return { success: true, data: params.userId ? DEMO_DATA.bookings.filter(b=>b.userId===params.userId) : DEMO_DATA.bookings };
        case 'getCheckIns': return { success: true, data: DEMO_DATA.checkIns };
        case 'getAnnouncements': return { success: true, data: DEMO_DATA.announcements };
        case 'getDashboard': return { success: true, data: {
          totalMembers: DEMO_DATA.users.filter(u=>u.role==='member').length,
          activeMembers: DEMO_DATA.users.filter(u=>u.role==='member'&&u.status==='active').length,
          totalEvents: DEMO_DATA.events.length,
          openEvents: DEMO_DATA.events.filter(e=>e.status==='open').length,
          todayCheckIns: 2,
          revenue: 12450,
          recentBookings: DEMO_DATA.bookings.slice(0,5),
          upcomingEvents: DEMO_DATA.events.filter(e=>e.status==='open').slice(0,3)
        }};
        default: return { success: true, data: [] };
      }
    });
  },

  _demoPost(action, data) {
    return new Promise(r => setTimeout(() => {
      switch(action) {
        case 'createEvent':
          const newEvent = { id: 'E'+Date.now(), ...data.event, enrolled: 0, status: 'open' };
          DEMO_DATA.events.push(newEvent);
          return r({ success: true, id: newEvent.id, message: 'Event created successfully' });
        case 'updateEvent':
          const eIdx = DEMO_DATA.events.findIndex(e=>e.id===data.id);
          if (eIdx>=0) Object.assign(DEMO_DATA.events[eIdx], data.event);
          return r({ success: true, message: 'Event updated' });
        case 'deleteEvent':
          DEMO_DATA.events = DEMO_DATA.events.filter(e=>e.id!==data.id);
          return r({ success: true, message: 'Event deleted' });
        case 'createBooking':
          const event = DEMO_DATA.events.find(e=>e.id===data.eventId);
          if (event && event.enrolled < event.capacity) {
            const booking = { id:'B'+Date.now(), userId:data.userId, eventId:data.eventId, eventName:event.name, date:event.date, status:'confirmed', paid:false, amount:event.price };
            DEMO_DATA.bookings.push(booking);
            event.enrolled++;
            return r({ success: true, booking, message: 'Booking confirmed!' });
          }
          return r({ success: false, message: 'Event is full' });
        case 'cancelBooking':
          const bIdx = DEMO_DATA.bookings.findIndex(b=>b.id===data.id);
          if (bIdx>=0) {
            const ev = DEMO_DATA.events.find(e=>e.id===DEMO_DATA.bookings[bIdx].eventId);
            if (ev) ev.enrolled = Math.max(0, ev.enrolled-1);
            DEMO_DATA.bookings.splice(bIdx,1);
          }
          return r({ success: true, message: 'Booking cancelled' });
        case 'checkIn':
          const ci = { id:'C'+Date.now(), userId:data.userId, userName:data.userName, date:new Date().toISOString().split('T')[0], time:new Date().toTimeString().slice(0,5), event:data.event||'General' };
          DEMO_DATA.checkIns.unshift(ci);
          return r({ success: true, checkIn: ci, message: 'Checked in successfully!' });
        case 'createMember':
          const member = { id:'U'+Date.now(), ...data.member, role:'member', status:'active', joined:new Date().toISOString().split('T')[0] };
          DEMO_DATA.users.push(member);
          return r({ success: true, member, message: 'Member created' });
        case 'updateMember':
          const mIdx = DEMO_DATA.users.findIndex(u=>u.id===data.id);
          if (mIdx>=0) Object.assign(DEMO_DATA.users[mIdx], data.member);
          return r({ success: true, message: 'Member updated' });
        default: return r({ success: true, message: 'Done' });
      }
    }, 400));
  },

  // Public methods
  login: (email, password) => API._call('login', { email, password }),
  getMembers: () => API._call('getMembers'),
  getEvents: () => API._call('getEvents'),
  getBookings: (userId) => API._call('getBookings', userId ? { userId } : {}),
  getCheckIns: () => API._call('getCheckIns'),
  getAnnouncements: () => API._call('getAnnouncements'),
  getDashboard: () => API._call('getDashboard'),
  createEvent: (event) => API._post('createEvent', { event }),
  updateEvent: (id, event) => API._post('updateEvent', { id, event }),
  deleteEvent: (id) => API._post('deleteEvent', { id }),
  createBooking: (userId, eventId) => API._post('createBooking', { userId, eventId }),
  cancelBooking: (id) => API._post('cancelBooking', { id }),
  checkIn: (userId, userName, event) => API._post('checkIn', { userId, userName, event }),
  createMember: (member) => API._post('createMember', { member }),
  updateMember: (id, member) => API._post('updateMember', { id, member }),
};

// Toast notifications
function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  t.innerHTML = `<span>${icons[type]||'•'}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(10px)'; t.style.transition='all 0.3s'; setTimeout(()=>t.remove(), 300); }, 3000);
}

// Auth helper
function requireAuth(role) {
  const user = JSON.parse(sessionStorage.getItem('clubhub_user') || 'null');
  if (!user) { window.location.href = '../index.html'; return null; }
  if (role && !role.includes(user.role)) { window.location.href = '../index.html'; return null; }
  return user;
}

function logout() {
  sessionStorage.removeItem('clubhub_user');
  window.location.href = '../index.html';
}
