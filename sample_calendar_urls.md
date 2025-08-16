# Sample Calendar URLs for Testing

## Test Calendar URLs
You can use these sample/demo calendar URLs to test the calendar integration:

### Google Calendar Public URLs
- **Sample Sports Team Calendar**: `https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics`

### Common Team Calendar Platforms
Most youth sports organizations use these platforms that provide iCal feeds:

1. **TeamSnap**: 
   - Format: `https://go.teamsnap.com/ical/[team-id]/[access-key]`
   - Ask your coach for the "Subscribe to Calendar" link

2. **SportsEngine/NBC Sports**: 
   - Format: `https://www.sportsengine.com/calendar/export/[team-id].ics`
   - Look for "Export Calendar" on team page

3. **LeagueApps**:
   - Format: `https://[league].leagueapps.com/calendar/[team-id]/export.ics`
   - Find "Calendar Feed" in team settings

4. **Stack Sports**:
   - Format: `https://[organization].stacksports.com/calendar/ical/[team-id]`
   - Look for calendar subscription options

5. **SportsYou**:
   - Format: `https://calendar.sportsyou.com/[team-id].ics`
   - Export option in team calendar

6. **GameDay Communications**:
   - Format: `https://[organization].gamedaycommunications.com/calendar/[team-id].ics`

### How to Get Your Team's Calendar URL

1. **Ask Your Coach/Manager**: 
   - Most coaches have access to calendar export features
   - Ask for "iCal feed", "calendar subscription", or ".ics file"

2. **Check Team Website**:
   - Look for "Subscribe", "Export", or "Calendar Feed" buttons
   - Usually found on the team calendar page

3. **Common Menu Locations**:
   - Team Settings → Calendar → Export
   - Calendar → Subscribe/Export Options
   - Tools → Calendar Integration

4. **URL Format Clues**:
   - Contains ".ics" at the end
   - Contains words like "calendar", "ical", "export"
   - Usually starts with https://

### Testing the Integration

1. Go to **Children → Manage Teams**
2. Enter a calendar URL for one of your teams
3. Enable sync
4. Click **Save**, then **Sync Now**
5. Check the Calendar tab to see imported events (marked with sync icon)

### Troubleshooting

- **Invalid URL**: Make sure the URL ends with .ics or is a valid iCal feed
- **No Events**: The calendar might be empty or private
- **Permission Error**: Some calendars require authentication (not supported yet)
- **Format Error**: Some calendars use non-standard formats

### Future Enhancements

- Support for authenticated calendars
- Automatic sync scheduling (daily/weekly)
- Conflict resolution between manual and imported events
- Support for more calendar formats (Outlook, Apple Calendar)