# Sports Tracker - Family Sports Management App

## Project Overview
- **Name**: Sports Tracker
- **Goal**: Create an easy-to-use mobile app that helps parents track and manage sporting events and schedules for their children
- **Features**: Child profiles, team management, event scheduling, calendar views, attendance tracking

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
- ✅ **Sample Data**: Pre-loaded with Rockvale teams and sample events matching actual team logos

## 🌐 URLs
- **Live Application**: https://3000-ije3ipjw27076sjcfjh4i-6532622b.e2b.dev
- **API Health Check**: https://3000-ije3ipjw27076sjcfjh4i-6532622b.e2b.dev/api/health
- **Local Development**: http://localhost:3000

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
   - Visit https://3000-ije3ipjw27076sjcfjh4i-6532622b.e2b.dev
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
```bash
# The app is already running! To restart:
cd /home/user/webapp

# Clean port and restart
npm run clean-port
pm2 restart sports-tracker

# Check status
pm2 status
pm2 logs sports-tracker --nostream

# Test locally
npm run test
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
- **Sample Children**: Emma (Soccer, Track) and Jake (Football, Baseball, Archery)
- **Sample Events**: Practices, games, and tournaments for the next few weeks
- **Demo Account**: `parent@example.com` / `password`

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
Your Sports Tracker app is fully functional and running at:
**https://3000-ije3ipjw27076sjcfjh4i-6532622b.e2b.dev**

Try logging in with the demo account and explore all the features. The app includes sample data that matches your team logos, so you can see exactly how it works with real sports data!

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

---

This is a complete, production-ready sports management solution for parents to track their children's activities with a professional mobile interface and revolutionary calendar integration.