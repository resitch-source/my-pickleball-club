# ClubHub — Multi-Sport Club Platform

A full-featured club management platform with **Admin Panel**, **Member Portal**, and **Kiosk Mode** — hosted on GitHub Pages, powered by Google Sheets + Apps Script.

---

## 🏗️ Architecture

```
GitHub Pages (Frontend)          Google Apps Script (Backend)
─────────────────────            ────────────────────────────
index.html      (Login)    ──►   Code.gs (Web App API)
pages/admin.html (Admin)   ◄──   ↕
pages/member.html (Member)       Google Sheets (Database)
pages/kiosk.html  (Kiosk)        ├── Members
pages/register.html              ├── Events
js/config.js (Settings)          ├── Bookings
js/api.js    (API layer)         ├── CheckIns
css/global.css                   └── Announcements
```

---

## 🚀 Quick Start

### Step 1 — Set up Google Sheets + Apps Script

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Delete default code, paste entire contents of `apps-script/Code.gs`
3. Click **Save** (name it "ClubHub Backend")
4. In the editor, select function **`setupSheets`** from the dropdown and click **Run**
   - ✅ This creates all required Sheets with correct headers and seeds demo data
5. Go to **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → **Authorize** → Copy the **Web App URL**

### Step 2 — Configure the Frontend

Open `js/config.js` and replace:
```js
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
```
with your actual Web App URL.

Also customize:
```js
CLUB_NAME: 'Your Club Name',
SPORTS: ['Tennis', 'Badminton', ...],   // Your sports
MEMBERSHIP_TIERS: [...]                  // Your pricing
```

### Step 3 — Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `my-club`)
2. Upload all files maintaining the folder structure
3. Go to **Settings → Pages → Source: main branch / root**
4. Your site is live at `https://yourusername.github.io/my-club/`

---

## 📁 File Structure

```
club-platform/
├── index.html              ← Login page (entry point)
├── css/
│   └── global.css          ← Shared styles
├── js/
│   ├── config.js           ← ⚙️ YOUR SETTINGS HERE
│   └── api.js              ← API layer + demo data
├── pages/
│   ├── admin.html          ← Admin Panel
│   ├── member.html         ← Member Portal
│   ├── kiosk.html          ← Kiosk Mode
│   └── register.html       ← Member Registration
└── apps-script/
    └── Code.gs             ← Google Apps Script backend
```

---

## 🖥️ Features

### Admin Panel
- **Dashboard** — live stats, upcoming events, recent bookings, announcements
- **Events** — create, edit, delete events with sport, capacity, pricing, instructor
- **Scheduler** — Month / Week / List calendar views of all events
- **Members** — search, filter, add, edit members; view booking history
- **Check-ins** — log and search facility check-ins; manual check-in tool
- **Announcements** — post club-wide notices with priority levels
- **Memberships** — track tier distribution; manage Guest/Basic/Premium/VIP

### Member Portal
- **Home** — personalized dashboard with stats and available events
- **Browse Events** — filter by sport, type, search; view event details
- **Book Events** — one-tap booking with waitlist support
- **My Bookings** — view and cancel confirmed/waitlisted bookings
- **Announcements** — club news and notices
- **Profile** — edit name, phone, preferred sport; view membership tier

### Kiosk Mode (Tablet/Desktop)
- **Member Check-in** — lookup by email, confirm with one tap
- **Guest Check-in** — walk-in visitor log
- **Event Booking** — browse open events, book by email
- Auto-returns to idle screen after 60 seconds
- Large touch-friendly UI optimized for tablets

### Registration
- 3-step signup: basic info → sport & tier → review & confirm
- Integrated with Members sheet automatically

---

## ⚙️ Google Sheets Structure

After running `setupSheets()`, your Spreadsheet will have:

| Sheet | Columns |
|-------|---------|
| Members | id, name, email, password, phone, role, membership, sport, status, joined |
| Events | id, name, sport, type, date, time, endTime, location, capacity, enrolled, price, instructor, description, status, created |
| Bookings | id, userId, eventId, eventName, date, status, paid, amount, created |
| CheckIns | id, userId, userName, event, date, time, timestamp |
| Announcements | id, title, message, priority, date |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@club.com | admin123 |
| Member | member@club.com | member123 |
| Kiosk | kiosk@club.com | kiosk123 |

> **Security note:** For production, implement proper password hashing. The current system stores passwords in plain text in Google Sheets. Consider using Google OAuth or a proper auth service.

---

## 🌐 Re-deploying Apps Script After Changes

When you update `Code.gs`, you must create a **new deployment** (not edit existing):
1. Deploy → **Manage Deployments** → Edit (pencil icon)
2. Version → **New version**
3. Deploy → the URL stays the same ✅

---

## 📱 Mobile Responsiveness

The platform is fully responsive:
- **≥769px**: Full sidebar + main content layout
- **≤768px**: Hamburger menu, collapsible sidebar, stacked grids
- **≤480px**: 2-column stats, compact calendar

---

## 🛠️ Customization

### Adding a new Sport
In `js/config.js`:
```js
SPORTS: ['Tennis', 'Badminton', 'YourSport'],
```

### Changing Membership Tiers
```js
MEMBERSHIP_TIERS: [
  { id: 'guest', name: 'Guest', price: 0, color: '#6b6b63' },
  { id: 'basic', name: 'Basic', price: 500, color: '#2d6a4f' },
  // Add/modify tiers here
],
```

### Changing Club Colors
In `css/global.css`, modify the `:root` variables:
```css
--brand: #1a3a2a;       /* Dark green */
--brand-mid: #2d6a4f;   /* Medium green */
--accent: #52b788;      /* Light green */
```

---

## 📞 Support

- Demo mode works without any setup — just open `index.html`
- All changes in demo mode are in-memory only (reset on page reload)
- Connect Apps Script to persist data across sessions

Built with ♥ using vanilla HTML/CSS/JS + Google Apps Script.
