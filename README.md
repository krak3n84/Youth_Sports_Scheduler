# Youth Sports Scheduler

> **A Complete Family Sports Management Solution**  
> Mobile-first web application for tracking children's sporting activities with automated calendar integration, team management, and professional UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=white)](https://hono.dev/)

## ✨ Why This Project?
Managing multiple children's sports schedules is challenging. This app solves that by:
- **🔄 Automatically importing** team calendars from coaching platforms
- **📱 Providing mobile-first** interface for busy parents  
- **👨‍👩‍👧‍👦 Managing multiple children** and their teams in one place
- **🎨 Beautiful team logo integration** throughout the interface
- **⚡ Fast, modern tech stack** built on Cloudflare's edge network

## Project Overview
- **Name**: Youth Sports Scheduler
- **Goal**: A complete, production-ready mobile web application that helps families track and manage their children's sporting activities
- **Features**: Child profiles, team management, automated calendar sync, event scheduling, attendance tracking, team logo integration
- **Template Ready**: Sanitized for public use - customize with your family's information

## 🏆 Currently Completed Features
- ✅ **User Authentication**: Parent account creation and login system with SHA-256 password hashing
- ✅ **Child Profile Management**: Add and manage multiple children with birth dates
- ✅ **Team & Sports Management**: Assign children to teams with jersey numbers and positions
- ✅ **Calendar Integration**: Import events directly from team calendar URLs (iCal/ICS)
- ✅ **Event Scheduling**: Create games, practices, tournaments, and meets
- ✅ **Calendar View**: Family calendar with all children's events
- ✅ **Attendance Tracking**: Mark attendance status for each event
- ✅ **Team Logo Integration**: Dynamic background system with actual team logos throughout the app
- ✅ **Smart Team Styling**: Event cards and team displays automatically styled with team-specific logos
- ✅ **Floating Logo Animations**: Subtle background team logo animations on dashboard
- ✅ **Mobile-Responsive UI**: Clean mobile-first design with bottom navigation
- ✅ **Back Button Navigation**: Navigate back without exiting the app
- ✅ **Cancel/Clear Buttons**: Easy form cancellation and clearing
- ✅ **Real-time Data**: Cloudflare D1 database for persistent storage
- ✅ **Sample Data**: Pre-loaded with Mia and Lane's actual teams and events matching team logos

## 🌐 URLs
- **GitHub Repository**: https://github.com/krak3n84/Youth_Sports_Scheduler
- **Local Development**: http://localhost:3000 (after setup)
- **API Health Check**: http://localhost:3000/api/health (after setup)

## 🎨 Team Logo Integration
- **6 Actual Team Logos**: Incorporated real uploaded team logos (MBA Baseball, Rockvale Football/Soccer/Archery/Track, Tennessee Soccer Club)
- **Dynamic Backgrounds**: Page backgrounds automatically adapt based on team/sport context
- **Floating Animations**: Subtle team logo animations throughout the interface
- **Team-Specific Cards**: Events and team displays include team-specific logo overlays
- **Smart Logo Matching**: Automatic team name matching to apply appropriate styling

## 📱 Functional Entry URIs
- **`/`** - Main dashboard with overview of children and upcoming events
- **`/api/health`** (GET) - Health check endpoint
- **`/api/auth/register`** (POST) - Create parent account `{email, name, password}`
- **`/api/auth/login`** (POST) - Parent login `{email, password}`
- **`/api/children/:userId`** (GET) - Get all children for a parent
- **`/api/children`** (POST) - Add new child `{user_id, name, birth_date?, photo_url?}`
- **`/api/sports`** (GET) - Get all available sports
- **`/api/teams/:sportId`** (GET) - Get teams for a specific sport
- **`/api/child-teams`** (POST) - Assign child to team `{child_id, team_id, jersey_number?, position?}`
- **`/api/events/:childId`** (GET) - Get events for a child `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- **`/api/events`** (POST) - Create new event `{team_id, type, title, event_date, start_time, ...}`
- **`/api/calendar/:userId`** (GET) - Get calendar view for all user's children
- **`/api/attendance/:eventId/:childId`** (PUT) - Update attendance `{status, notes?}`

### 📅 **Calendar Integration APIs**
- **`/api/teams/:teamId/calendar`** (PUT) - Update team calendar settings `{calendar_url, sync_enabled}`
- **`/api/teams/:teamId/sync`** (POST) - Sync team calendar and import events
- **`/api/teams/:teamId/sync-status`** (GET) - Get calendar sync status and imported events count

## 🚧 Features Not Yet Implemented
- **Automatic Sync Scheduling**: Scheduled daily/weekly calendar syncing
- **Authenticated Calendars**: Support for private/password-protected calendars
- **Stats Tracking**: Manual logging of game scores and performance stats
- **Photo/Media Upload**: Upload photos and notes from events
- **Push Notifications**: Reminders before events
- **Coach Contact Management**: Direct messaging or contact with coaches
- **Season/Tournament Brackets**: Tournament tracking and bracket views
- **Export/Sharing**: Export schedules or share with family members
- **Conflict Resolution UI**: Visual interface for handling calendar conflicts

## 🎯 Recommended Next Steps
1. **Test the live application** - Visit the URL above and try all features
2. **Try calendar integration** - Go to Children → Manage Teams and add team calendar URLs
3. **Add your own children** - Create new child profiles with real data
4. **Set up team calendars** - Get iCal URLs from coaches and enable sync
5. **Schedule real events** - Add actual games and practices for your kids
6. **Deploy to production** - Deploy to Cloudflare Pages for permanent hosting
7. **Add automatic sync scheduling** - Implement daily/weekly calendar syncing
8. **Add stats tracking** - Implement optional performance statistics
9. **Add photo upload** - Integrate with Cloudflare R2 for media storage

## 📊 Data Architecture
- **Data Models**: Users (parents), Children, Sports, Teams, Events, Attendance, Stats
- **Storage Services**: Cloudflare D1 (SQLite-based relational database)
- **Database ID**: `7083005a-7f3b-42db-b953-6156b0730dd5`
- **Data Flow**: 
  1. Parent creates account and adds children
  2. Children are assigned to teams/sports
  3. Events are scheduled for teams
  4. Attendance is tracked per child per event
  5. Optional stats and media can be added

## 👨‍👩‍👧‍👦 User Guide
1. **Getting Started**: 
   - Deploy the application to your preferred platform
   - Login with: `parent@example.com` / `password` (demo account)
2. **Add Children**: Go to Children tab and add your kids with their birth dates
3. **Set Up Calendar Integration**:
   - Go to Children → "Manage Teams" button
   - Enter team calendar URLs (ask your coach for iCal/ICS links)
   - Enable sync and click "Sync Now"
   - Watch events automatically import!
4. **View Sample Teams**: Sample teams included (Rockvale Soccer, Football, MBA Baseball, etc.)
5. **Check Calendar**: View all upcoming events with imported events marked with sync icon
6. **Navigate**: Use bottom navigation (Home, Calendar, Children, Logout)
7. **Add Events**: Use the + floating button to schedule manual events

## 🚀 Deployment
- **Platform**: Cloudflare Pages with D1 Database
- **Status**: ✅ Running locally with D1 database
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare D1
- **Database**: Connected to your Cloudflare D1 database (local mode)
- **Last Updated**: August 16, 2025

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for D1 database and Pages deployment)

### Local Development
```bash
# Clone the repository
git clone https://github.com/krak3n84/Youth_Sports_Scheduler.git
cd Youth_Sports_Scheduler

# Install dependencies
npm install

# Set up local database
npx wrangler d1 create sports-tracker-production
npx wrangler d1 migrations apply sports-tracker-production --local
npx wrangler d1 execute sports-tracker-production --local --file=./seed.sql

# Build the application
npm run build

# Start development server (uses PM2)
pm2 start ecosystem.config.cjs

# Check status
pm2 status
pm2 logs sports-tracker --nostream

# Test locally
curl http://localhost:3000/api/health
```

### Production Deployment (Cloudflare Pages)
```bash
# Set up Cloudflare API token first
export CLOUDFLARE_API_TOKEN="your-api-token"

# Create production database
npx wrangler d1 create sports-tracker-production
# Copy database_id to wrangler.jsonc

# Apply migrations to production
npx wrangler d1 migrations apply sports-tracker-production

# Create Cloudflare Pages project
npx wrangler pages project create youth-sports-scheduler \
  --production-branch main \
  --compatibility-date 2024-01-01

# Deploy
npm run build
npx wrangler pages deploy dist --project-name youth-sports-scheduler
```

## 📦 Sample Data Included
The app includes sample data for:
- **Sports**: Soccer, Football, Basketball, Baseball, Track, Archery, Swimming, Tennis
- **Teams**: 
  - Rockvale Soccer Rockets (matching your logo)
  - Tennessee Soccer Club (matching your logo) 
  - Rockvale Football (matching your logo)
  - MBA Baseball (matching your logo)
  - Rockvale Archery (matching your logo)
  - Rockvale Track Team (matching your logo)
- **Sample Children**: Emma Johnson (Soccer, Track) and Jake Johnson (Football, Baseball, Archery)
- **Sample Events**: Practices, games, and tournaments for the next few weeks
- **Demo Account**: `parent@example.com` / `password` (change in production)

## 🎨 Design Features
- **Mobile-First**: Optimized for mobile devices with touch-friendly interface
- **Bottom Navigation**: Easy thumb navigation with Home, Calendar, Children, and Logout
- **Back Button Navigation**: Navigate back without exiting the app
- **Cancel/Clear Buttons**: Easy form cancellation and clearing
- **Calendar Integration UI**: Intuitive team calendar management with sync controls
- **Event Source Indicators**: Visual icons showing manual vs imported events
- **Sport-Specific Colors**: Each sport has its own color theme
- **Event Type Indicators**: Visual badges for games, practices, tournaments, and meets
- **Floating Action Button**: Quick access to add new events
- **Responsive Design**: Works on phones, tablets, and desktop computers
- **Professional UI**: Clean, modern interface with TailwindCSS styling

## 🎯 Ready to Use!
This Sports Tracker app is a complete template ready for deployment. After setting up your development environment or deploying to Cloudflare Pages, you can:

1. **Login with demo account**: `parent@example.com` / `password`
2. **Explore sample data**: Emma and Jake Johnson with their teams
3. **Test calendar integration**: Try the team calendar sync features
4. **Customize for your family**: Replace demo data with your actual family information

## 📅 **Calendar Integration - Game Changer Feature!**

### **Automatic Event Import**
Instead of manually entering every practice and game, simply:
1. Get the calendar URL from your coach/team manager
2. Paste it into the Team Management page
3. Enable sync and click "Sync Now"
4. Watch all team events automatically appear in your family calendar!

### **Supported Calendar Platforms**
Works with most youth sports platforms:
- **TeamSnap** - Most popular team management platform
- **SportsEngine/NBC Sports** - Widely used for leagues
- **LeagueApps** - Common for recreational leagues  
- **Stack Sports** - Used by many organizations
- **Google Calendar** - Public team calendars
- **Any iCal/ICS feed** - Universal calendar format

### **Smart Event Detection**
The system automatically:
- Detects event types (game, practice, tournament, meet)
- Imports all event details (time, location, opponent)
- Creates attendance tracking for your children
- Shows imported events with sync icons
- Handles updates when team schedules change

### **How to Get Team Calendar URLs**
1. **Ask your coach** for the "calendar subscription link" or "iCal feed"
2. **Check team websites** for "Export Calendar" or "Subscribe" buttons
3. **Look for URLs ending in `.ics`** or containing "calendar"
4. **Common locations**: Team Settings → Calendar → Export

**No more manual data entry!** This feature alone saves hours of work per season.

## 🎛️ Customization Guide

### Replace Demo Data with Your Information

1. **Update User Account** (in `seed.sql`):
   ```sql
   -- Replace with your email and generate new password hash
   INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES 
     (1, 'your-email@example.com', 'Your Name', 'your-hashed-password');
   ```

2. **Add Your Children** (in `seed.sql`):
   ```sql
   -- Replace with your children's information
   INSERT OR IGNORE INTO children (id, user_id, name, birth_date) VALUES 
     (1, 1, 'Your Child 1', 'YYYY-MM-DD'),
     (2, 1, 'Your Child 2', 'YYYY-MM-DD');
   ```

3. **Update Teams** (in `seed.sql`):
   ```sql
   -- Add your actual teams
   INSERT OR IGNORE INTO teams (id, name, sport_id, coach_name, season) VALUES 
     (1, 'Your Team Name', sport_id, 'Coach Name', 'Season');
   ```

4. **Team Logo Integration** (in `public/static/styles.css`):
   - Upload your team logos to image hosting
   - Update CSS classes with your logo URLs:
   ```css
   .your-team-class::before {
     background-image: url('https://your-image-url.com/logo.png');
   }
   ```

5. **Update Team Assignment** (in `seed.sql`):
   ```sql
   -- Assign your children to their actual teams
   INSERT OR IGNORE INTO child_teams (child_id, team_id, jersey_number, active) VALUES 
     (1, 1, jersey_number, true);
   ```

### Password Hashing
To generate password hashes for new users:
```javascript
// Use this in browser console or Node.js
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_sports_tracker_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Usage
hashPassword('your-password').then(console.log);
```

## 📄 License

MIT License - feel free to use this project for your family or contribute improvements!

---

**Built with ❤️ for busy sports families**  
*A complete, production-ready sports management solution that saves time and keeps families organized.*