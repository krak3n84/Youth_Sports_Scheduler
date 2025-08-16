import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// Main dashboard page
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      <div id="app"></div>
    </div>
  )
})

// API Routes

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// User Authentication
app.post('/api/auth/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json()
    
    // Simple password hashing (in production, use bcrypt)
    const password_hash = btoa(password) // Basic encoding - replace with proper hashing
    
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)
    `).bind(email, name, password_hash).run()
    
    if (result.success) {
      return c.json({ success: true, user_id: result.meta.last_row_id })
    } else {
      return c.json({ error: 'Failed to create user' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request or email already exists' }, 400)
  }
})

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, name FROM users WHERE email = ? AND password_hash = ?
    `).bind(email, btoa(password)).first()
    
    if (user) {
      return c.json({ success: true, user })
    } else {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Children Management
app.get('/api/children/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  const children = await c.env.DB.prepare(`
    SELECT c.*, 
           json_group_array(
             json_object(
               'id', ct.id,
               'team_id', ct.team_id,
               'jersey_number', ct.jersey_number,
               'position', ct.position,
               'active', ct.active,
               'team_name', t.name,
               'sport_name', s.name,
               'coach_name', t.coach_name,
               'season', t.season
             )
           ) as teams
    FROM children c
    LEFT JOIN child_teams ct ON c.id = ct.child_id AND ct.active = true
    LEFT JOIN teams t ON ct.team_id = t.id
    LEFT JOIN sports s ON t.sport_id = s.id
    WHERE c.user_id = ?
    GROUP BY c.id
  `).bind(userId).all()
  
  // Parse JSON teams data
  const childrenWithTeams = children.results.map(child => ({
    ...child,
    teams: JSON.parse(child.teams as string).filter((team: any) => team.team_id !== null)
  }))
  
  return c.json(childrenWithTeams)
})

app.post('/api/children', async (c) => {
  try {
    const { user_id, name, photo_url, birth_date } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO children (user_id, name, photo_url, birth_date) VALUES (?, ?, ?, ?)
    `).bind(user_id, name, photo_url || null, birth_date || null).run()
    
    if (result.success) {
      return c.json({ success: true, child_id: result.meta.last_row_id })
    } else {
      return c.json({ error: 'Failed to create child profile' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Teams and Sports
app.get('/api/sports', async (c) => {
  const sports = await c.env.DB.prepare('SELECT * FROM sports ORDER BY name').all()
  return c.json(sports.results)
})

app.get('/api/teams/:sportId', async (c) => {
  const sportId = c.req.param('sportId')
  const teams = await c.env.DB.prepare(`
    SELECT t.*, s.name as sport_name 
    FROM teams t 
    JOIN sports s ON t.sport_id = s.id 
    WHERE t.sport_id = ? 
    ORDER BY t.name
  `).bind(sportId).all()
  return c.json(teams.results)
})

app.post('/api/child-teams', async (c) => {
  try {
    const { child_id, team_id, jersey_number, position } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO child_teams (child_id, team_id, jersey_number, position) 
      VALUES (?, ?, ?, ?)
    `).bind(child_id, team_id, jersey_number || null, position || null).run()
    
    if (result.success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to add child to team' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request or child already on team' }, 400)
  }
})

// Events Management
app.get('/api/events/:childId', async (c) => {
  const childId = c.req.param('childId')
  const startDate = c.req.query('start_date') || new Date().toISOString().split('T')[0]
  const endDate = c.req.query('end_date')
  
  let query = `
    SELECT e.*, t.name as team_name, s.name as sport_name,
           ea.status as attendance_status, ea.notes as attendance_notes
    FROM events e
    JOIN teams t ON e.team_id = t.id
    JOIN sports s ON t.sport_id = s.id
    JOIN child_teams ct ON t.id = ct.team_id AND ct.active = true
    LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.child_id = ct.child_id
    WHERE ct.child_id = ? AND e.event_date >= ?
  `
  
  const params = [childId, startDate]
  
  if (endDate) {
    query += ' AND e.event_date <= ?'
    params.push(endDate)
  }
  
  query += ' ORDER BY e.event_date ASC, e.start_time ASC'
  
  const events = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(events.results)
})

app.post('/api/events', async (c) => {
  try {
    const { team_id, type, title, description, event_date, start_time, end_time, location, opponent, is_home, reminder_minutes } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO events (team_id, type, title, description, event_date, start_time, end_time, location, opponent, is_home, reminder_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      team_id, type, title, description || null, event_date, start_time, end_time || null, 
      location || null, opponent || null, is_home || false, reminder_minutes || 60
    ).run()
    
    if (result.success) {
      // Create attendance records for all children on this team
      await c.env.DB.prepare(`
        INSERT INTO event_attendance (event_id, child_id, status)
        SELECT ?, ct.child_id, 'pending'
        FROM child_teams ct
        WHERE ct.team_id = ? AND ct.active = true
      `).bind(result.meta.last_row_id, team_id).run()
      
      return c.json({ success: true, event_id: result.meta.last_row_id })
    } else {
      return c.json({ error: 'Failed to create event' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Calendar view - get events for all children of a user
app.get('/api/calendar/:userId', async (c) => {
  const userId = c.req.param('userId')
  const startDate = c.req.query('start_date') || new Date().toISOString().split('T')[0]
  const endDate = c.req.query('end_date')
  
  let query = `
    SELECT e.id, e.title, e.event_date as date, e.start_time, e.end_time, e.type,
           e.location, e.opponent, e.is_home,
           t.name as team_name, c.name as child_name,
           ea.status as attendance_status
    FROM events e
    JOIN teams t ON e.team_id = t.id
    JOIN child_teams ct ON t.id = ct.team_id AND ct.active = true
    JOIN children c ON ct.child_id = c.id
    LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.child_id = c.id
    WHERE c.user_id = ? AND e.event_date >= ?
  `
  
  const params = [userId, startDate]
  
  if (endDate) {
    query += ' AND e.event_date <= ?'
    params.push(endDate)
  }
  
  query += ' ORDER BY e.event_date ASC, e.start_time ASC'
  
  const events = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(events.results)
})

// Update event attendance
app.put('/api/attendance/:eventId/:childId', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    const childId = c.req.param('childId')
    const { status, notes } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE event_attendance 
      SET status = ?, notes = ?, created_at = CURRENT_TIMESTAMP
      WHERE event_id = ? AND child_id = ?
    `).bind(status, notes || null, eventId, childId).run()
    
    if (result.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Attendance record not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Calendar Integration Endpoints

// Update team calendar settings
app.put('/api/teams/:teamId/calendar', async (c) => {
  try {
    const teamId = c.req.param('teamId')
    const { calendar_url, sync_enabled } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE teams 
      SET calendar_url = ?, sync_enabled = ?
      WHERE id = ?
    `).bind(calendar_url || null, sync_enabled ? 1 : 0, teamId).run()
    
    if (result.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Team not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Sync team calendar
app.post('/api/teams/:teamId/sync', async (c) => {
  try {
    const teamId = c.req.param('teamId')
    
    // Get team calendar URL
    const team = await c.env.DB.prepare(`
      SELECT id, name, calendar_url, sync_enabled FROM teams WHERE id = ?
    `).bind(teamId).first()
    
    if (!team || !team.calendar_url || !team.sync_enabled) {
      return c.json({ error: 'Team calendar not configured or disabled' }, 400)
    }
    
    try {
      // Fetch calendar data
      const response = await fetch(team.calendar_url)
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar: ${response.status}`)
      }
      
      const calendarData = await response.text()
      
      // Parse iCal data (simplified parser)
      const events = parseICalData(calendarData, team.id)
      
      // Insert/update events in database
      let syncCount = 0
      for (const event of events) {
        try {
          // Check if event already exists
          const existingEvent = await c.env.DB.prepare(`
            SELECT id FROM events WHERE external_id = ? AND team_id = ?
          `).bind(event.external_id, teamId).first()
          
          if (existingEvent) {
            // Update existing event
            await c.env.DB.prepare(`
              UPDATE events 
              SET title = ?, event_date = ?, start_time = ?, end_time = ?, 
                  location = ?, description = ?, last_updated = CURRENT_TIMESTAMP
              WHERE external_id = ? AND team_id = ?
            `).bind(
              event.title, event.event_date, event.start_time, event.end_time || null,
              event.location || null, event.description || null, event.external_id, teamId
            ).run()
          } else {
            // Insert new event
            const result = await c.env.DB.prepare(`
              INSERT INTO events (team_id, type, title, description, event_date, start_time, end_time, 
                                location, source, external_id, last_updated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'calendar', ?, CURRENT_TIMESTAMP)
            `).bind(
              teamId, event.type, event.title, event.description || null,
              event.event_date, event.start_time, event.end_time || null,
              event.location || null, event.external_id
            ).run()
            
            if (result.success) {
              // Create attendance records for children on this team
              await c.env.DB.prepare(`
                INSERT INTO event_attendance (event_id, child_id, status)
                SELECT ?, ct.child_id, 'pending'
                FROM child_teams ct
                WHERE ct.team_id = ? AND ct.active = true
              `).bind(result.meta.last_row_id, teamId).run()
            }
          }
          syncCount++
        } catch (eventError) {
          console.error('Error processing event:', eventError)
        }
      }
      
      // Update last sync time
      await c.env.DB.prepare(`
        UPDATE teams SET last_sync = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(teamId).run()
      
      return c.json({ 
        success: true, 
        synced_events: syncCount,
        total_events: events.length 
      })
      
    } catch (fetchError) {
      return c.json({ error: 'Failed to fetch or parse calendar data: ' + fetchError.message }, 400)
    }
    
  } catch (error) {
    return c.json({ error: 'Sync failed: ' + error.message }, 500)
  }
})

// Get team calendar sync status
app.get('/api/teams/:teamId/sync-status', async (c) => {
  const teamId = c.req.param('teamId')
  
  const team = await c.env.DB.prepare(`
    SELECT calendar_url, sync_enabled, last_sync FROM teams WHERE id = ?
  `).bind(teamId).first()
  
  if (!team) {
    return c.json({ error: 'Team not found' }, 404)
  }
  
  const eventCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM events WHERE team_id = ? AND source = 'calendar'
  `).bind(teamId).first()
  
  return c.json({
    calendar_url: team.calendar_url,
    sync_enabled: team.sync_enabled,
    last_sync: team.last_sync,
    imported_events: eventCount.count
  })
})

// Simple iCal parser function
function parseICalData(icalData, teamId) {
  const events = []
  const lines = icalData.split('\\n').map(line => line.trim())
  
  let currentEvent = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        team_id: teamId,
        type: 'game', // Default type, will be determined by title
        source: 'calendar'
      }
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.event_date && currentEvent.start_time) {
        // Determine event type from title
        const title = currentEvent.title.toLowerCase()
        if (title.includes('practice')) {
          currentEvent.type = 'practice'
        } else if (title.includes('tournament')) {
          currentEvent.type = 'tournament'
        } else if (title.includes('meet')) {
          currentEvent.type = 'meet'
        } else {
          currentEvent.type = 'game'
        }
        
        events.push(currentEvent)
      }
      currentEvent = null
    } else if (currentEvent && line.includes(':')) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':')
      
      switch (key) {
        case 'UID':
          currentEvent.external_id = value
          break
        case 'SUMMARY':
          currentEvent.title = value
          break
        case 'DESCRIPTION':
          currentEvent.description = value
          break
        case 'LOCATION':
          currentEvent.location = value
          break
        case 'DTSTART':
          const startDate = parseICalDateTime(value)
          if (startDate) {
            currentEvent.event_date = startDate.date
            currentEvent.start_time = startDate.time
          }
          break
        case 'DTEND':
          const endDate = parseICalDateTime(value)
          if (endDate) {
            currentEvent.end_time = endDate.time
          }
          break
      }
    }
  }
  
  return events
}

// Parse iCal datetime format
function parseICalDateTime(icalDateTime) {
  try {
    // Handle format: 20241020T140000Z or 20241020T140000
    const cleanDateTime = icalDateTime.replace(/[TZ]/g, '')
    
    if (cleanDateTime.length >= 8) {
      const year = cleanDateTime.substring(0, 4)
      const month = cleanDateTime.substring(4, 6)
      const day = cleanDateTime.substring(6, 8)
      
      const date = `${year}-${month}-${day}`
      
      if (cleanDateTime.length >= 14) {
        const hour = cleanDateTime.substring(8, 10)
        const minute = cleanDateTime.substring(10, 12)
        const time = `${hour}:${minute}`
        
        return { date, time }
      }
      
      return { date, time: '00:00' }
    }
  } catch (error) {
    console.error('Error parsing iCal datetime:', error)
  }
  
  return null
}

export default app
