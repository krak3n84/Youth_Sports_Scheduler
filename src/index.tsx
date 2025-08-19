import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Simple password hashing function (for demo - use proper bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_sports_tracker_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// Team logo test page
app.get('/test-images', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Logo Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .logo-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .logo-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .logo-img { width: 100px; height: 100px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px; }
        .logo-name { margin: 10px 0 5px 0; font-weight: bold; color: #333; }
        .logo-url { font-size: 11px; color: #666; word-break: break-all; }
        h1 { color: #333; text-align: center; }
    </style>
</head>
<body>
    <h1>🏆 Team Logo Test Page</h1>
    <p>This page tests all 6 team logos used in the Sports Tracker app:</p>
    
    <div class="logo-container">
        <div class="logo-card">
            <div class="logo-name">Rockvale Soccer Rockets</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/086ce282d4b237d73225414a5b1c6dd7" alt="Rockvale Soccer" class="logo-img">
            <div class="logo-url">086ce282d4b237d73225414a5b1c6dd7</div>
        </div>
        
        <div class="logo-card">
            <div class="logo-name">Tennessee Soccer Club</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/17d652d4188793aa0018c6eff3d6bd88" alt="Tennessee Soccer" class="logo-img">
            <div class="logo-url">17d652d4188793aa0018c6eff3d6bd88</div>
        </div>
        
        <div class="logo-card">
            <div class="logo-name">Rockvale Football</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/c47910bbfef4ef6e4c909f81d7a5f031" alt="Rockvale Football" class="logo-img">
            <div class="logo-url">c47910bbfef4ef6e4c909f81d7a5f031</div>
        </div>
        
        <div class="logo-card">
            <div class="logo-name">MBA Baseball</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/a3b8e00329a9e42975814c4dbd8d4601" alt="MBA Baseball" class="logo-img">
            <div class="logo-url">a3b8e00329a9e42975814c4dbd8d4601</div>
        </div>
        
        <div class="logo-card">
            <div class="logo-name">Rockvale Track Team</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/e0fb1b8ea116148f87b30b22805040fa" alt="Rockvale Track" class="logo-img">
            <div class="logo-url">e0fb1b8ea116148f87b30b22805040fa</div>
        </div>
        
        <div class="logo-card">
            <div class="logo-name">Rockvale Archery</div>
            <img src="https://page.gensparksite.com/v1/base64_upload/c80963343a866d698b0f83ff431080b2" alt="Rockvale Archery" class="logo-img">
            <div class="logo-url">c80963343a866d698b0f83ff431080b2</div>
        </div>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
        <h3>CSS Background Test:</h3>
        <div style="width: 100px; height: 100px; background-image: url('https://page.gensparksite.com/v1/base64_upload/086ce282d4b237d73225414a5b1c6dd7'); background-size: contain; background-repeat: no-repeat; background-position: center; border: 1px solid #ddd; margin: 10px 0;"></div>
        <p>This div uses the Rockvale Soccer logo as a CSS background-image (same method used in the app).</p>
    </div>
    
    <div style="margin-top: 20px; text-align: center;">
        <a href="/" style="color: #3b82f6; text-decoration: none;">← Back to Sports Tracker App</a>
    </div>
</body>
</html>`)
})

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
    
    // Input validation
    if (!email || !name || !password) {
      return c.json({ error: 'Email, name, and password are required' }, 400)
    }
    
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }
    
    // Proper password hashing
    const password_hash = await hashPassword(password)
    
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
    console.log('Login attempt:', email, 'password length:', password?.length)
    
    // Input validation
    if (!email || !password) {
      console.log('Missing email or password')
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, password_hash FROM users WHERE email = ?
    `).bind(email).first()
    
    console.log('User found:', !!user, user?.email)
    
    if (user) {
      const passwordValid = await verifyPassword(password, user.password_hash)
      console.log('Password valid:', passwordValid)
      
      if (passwordValid) {
        // Don't return password_hash to client
        const { password_hash, ...safeUser } = user
        console.log('Login successful for:', email)
        return c.json({ success: true, user: safeUser })
      }
    }
    
    console.log('Login failed for:', email)
    return c.json({ error: 'Invalid credentials' }, 401)
  } catch (error) {
    console.log('Login error:', error)
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

// Update child profile
app.put('/api/children/:childId', async (c) => {
  try {
    const childId = c.req.param('childId')
    const { name, photo_url, birth_date } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE children 
      SET name = ?, photo_url = ?, birth_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, photo_url || null, birth_date || null, childId).run()
    
    if (result.meta.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Child not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Delete child profile
app.delete('/api/children/:childId', async (c) => {
  try {
    const childId = c.req.param('childId')
    
    const result = await c.env.DB.prepare(`
      DELETE FROM children WHERE id = ?
    `).bind(childId).run()
    
    if (result.meta.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Child not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Update child team assignment (jersey number, position)
app.put('/api/child-teams/:childId/:teamId', async (c) => {
  try {
    const childId = c.req.param('childId')
    const teamId = c.req.param('teamId')
    const { jersey_number, position, active } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE child_teams 
      SET jersey_number = ?, position = ?, active = ?
      WHERE child_id = ? AND team_id = ?
    `).bind(jersey_number || null, position || null, active !== undefined ? active : true, childId, teamId).run()
    
    if (result.meta.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Team assignment not found' }, 404)
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

// Get single event details
app.get('/api/events/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    
    const event = await c.env.DB.prepare(`
      SELECT e.*, t.name as team_name, s.name as sport_name
      FROM events e
      JOIN teams t ON e.team_id = t.id
      JOIN sports s ON t.sport_id = s.id
      WHERE e.id = ?
    `).bind(eventId).first()
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404)
    }
    
    return c.json(event)
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Update event
app.put('/api/events/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    const { type, title, description, event_date, start_time, end_time, location, opponent, is_home, reminder_minutes } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE events 
      SET type = ?, title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, 
          location = ?, opponent = ?, is_home = ?, reminder_minutes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      type, title, description || null, event_date, start_time, end_time || null,
      location || null, opponent || null, is_home || false, reminder_minutes || 60, eventId
    ).run()
    
    if (result.meta.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Event not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// Delete event
app.delete('/api/events/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    
    const result = await c.env.DB.prepare(`
      DELETE FROM events WHERE id = ?
    `).bind(eventId).run()
    
    if (result.meta.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Event not found' }, 404)
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
           e.location, e.opponent, e.is_home, e.source,
           t.name as team_name, c.name as child_name,
           ct.jersey_number, ct.position,
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
    const { calendar_url, sync_enabled, assigned_child_id } = await c.req.json()
    

    
    const result = await c.env.DB.prepare(`
      UPDATE teams 
      SET calendar_url = ?, sync_enabled = ?, assigned_child_id = ?
      WHERE id = ?
    `).bind(calendar_url || null, sync_enabled ? 1 : 0, assigned_child_id || null, teamId).run()
    
    if (result.meta.changes > 0) {
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
      // Convert webcal:// URLs to https:// for fetch compatibility
      const calendarUrl = team.calendar_url.replace(/^webcal:\/\//, 'https://')
      
      // Fetch calendar data
      const response = await fetch(calendarUrl)
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
    SELECT calendar_url, sync_enabled, last_sync, assigned_child_id FROM teams WHERE id = ?
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
    assigned_child_id: team.assigned_child_id,
    imported_events: eventCount.count
  })
})

// Simple iCal parser function
function parseICalData(icalData, teamId) {
  const events = []
  // Handle both Windows (\r\n) and Unix (\n) line endings
  const lines = icalData.split(/\r?\n/).map(line => line.trim())
  
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

// ==========================================
// NOTIFICATION SYSTEM API ENDPOINTS
// ==========================================

// Get user notification settings
app.get('/api/notifications/settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const userSettings = await c.env.DB.prepare(`
      SELECT * FROM user_notification_settings WHERE user_id = ?
    `).bind(userId).first()
    
    const childrenSettings = await c.env.DB.prepare(`
      SELECT cns.*, c.name as child_name 
      FROM child_notification_settings cns
      JOIN children c ON cns.child_id = c.id
      WHERE c.user_id = ?
    `).bind(userId).all()
    
    return c.json({
      user_settings: userSettings,
      children_settings: childrenSettings.results || []
    })
  } catch (error) {
    return c.json({ error: 'Failed to load notification settings' }, 500)
  }
})

// Update user notification settings
app.put('/api/notifications/settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const {
      daily_reminder_enabled,
      daily_reminder_time,
      pre_event_reminder_enabled,
      pre_event_reminder_minutes,
      email_notifications,
      push_notifications,
      sms_notifications,
      timezone
    } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE user_notification_settings 
      SET daily_reminder_enabled = ?, daily_reminder_time = ?, 
          pre_event_reminder_enabled = ?, pre_event_reminder_minutes = ?,
          email_notifications = ?, push_notifications = ?, sms_notifications = ?,
          timezone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      daily_reminder_enabled ? 1 : 0,
      daily_reminder_time,
      pre_event_reminder_enabled ? 1 : 0,
      pre_event_reminder_minutes,
      email_notifications ? 1 : 0,
      push_notifications ? 1 : 0,
      sms_notifications ? 1 : 0,
      timezone,
      userId
    ).run()
    
    if (result.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Settings not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Failed to update notification settings' }, 500)
  }
})

// Update child notification settings
app.put('/api/notifications/child-settings/:childId', async (c) => {
  try {
    const childId = c.req.param('childId')
    const {
      daily_reminder_enabled,
      pre_event_reminder_enabled,
      notification_email,
      notification_phone
    } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      UPDATE child_notification_settings 
      SET daily_reminder_enabled = ?, pre_event_reminder_enabled = ?,
          notification_email = ?, notification_phone = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE child_id = ?
    `).bind(
      daily_reminder_enabled ? 1 : 0,
      pre_event_reminder_enabled ? 1 : 0,
      notification_email,
      notification_phone,
      childId
    ).run()
    
    if (result.changes > 0) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Child settings not found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Failed to update child notification settings' }, 500)
  }
})

// Register push notification token
app.post('/api/notifications/register-token', async (c) => {
  try {
    const { user_id, token, device_type, device_name } = await c.req.json()
    
    // Deactivate existing tokens for this user/device combo
    await c.env.DB.prepare(`
      UPDATE push_notification_tokens 
      SET active = false 
      WHERE user_id = ? AND device_type = ?
    `).bind(user_id, device_type).run()
    
    // Insert new token
    const result = await c.env.DB.prepare(`
      INSERT INTO push_notification_tokens (user_id, token, device_type, device_name)
      VALUES (?, ?, ?, ?)
    `).bind(user_id, token, device_type, device_name).run()
    
    return c.json({ success: true, token_id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to register push token' }, 500)
  }
})

// Schedule notifications for upcoming events
app.post('/api/notifications/schedule/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get user notification settings and email
    const userSettings = await c.env.DB.prepare(`
      SELECT uns.*, u.email 
      FROM user_notification_settings uns
      JOIN users u ON uns.user_id = u.id
      WHERE uns.user_id = ?
    `).bind(userId).first()
    
    if (!userSettings) {
      return c.json({ error: 'User notification settings not found' }, 404)
    }
    
    // Get upcoming events for the next 7 days
    const upcomingEvents = await c.env.DB.prepare(`
      SELECT e.*, c.id as child_id, c.name as child_name, t.name as team_name, s.name as sport_name
      FROM events e
      JOIN child_teams ct ON e.team_id = ct.team_id
      JOIN children c ON ct.child_id = c.id
      JOIN teams t ON e.team_id = t.id
      JOIN sports s ON t.sport_id = s.id
      WHERE c.user_id = ? 
        AND e.event_date >= date('now') 
        AND e.event_date <= date('now', '+7 days')
        AND ct.active = true
      ORDER BY e.event_date, e.start_time
    `).bind(userId).all()
    
    let scheduledCount = 0
    
    for (const event of upcomingEvents.results || []) {
      // Schedule pre-event reminder if enabled
      if (userSettings.pre_event_reminder_enabled) {
        const eventDateTime = new Date(`${event.event_date}T${event.start_time}`)
        const reminderTime = new Date(eventDateTime.getTime() - (userSettings.pre_event_reminder_minutes * 60 * 1000))
        
        if (reminderTime > new Date()) {
          await c.env.DB.prepare(`
            INSERT INTO notification_log 
            (user_id, child_id, event_id, notification_type, delivery_method, recipient, subject, message, scheduled_for)
            VALUES (?, ?, ?, 'pre_event_reminder', 'email', ?, ?, ?, ?)
          `).bind(
            userId,
            event.child_id,
            event.id,
            userSettings.email,
            `${event.child_name} - ${event.team_name} Event Reminder`,
            `Reminder: ${event.child_name} has ${event.title} at ${event.start_time} today for ${event.team_name} (${event.sport_name})`,
            reminderTime.toISOString()
          ).run()
          
          scheduledCount++
        }
      }
    }
    
    return c.json({ 
      success: true, 
      scheduled_notifications: scheduledCount,
      message: `Scheduled ${scheduledCount} notifications for upcoming events`
    })
  } catch (error) {
    return c.json({ error: 'Failed to schedule notifications' }, 500)
  }
})

// Get notification history/log
app.get('/api/notifications/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = c.req.query('limit') || '50'
    
    const notifications = await c.env.DB.prepare(`
      SELECT nl.*, c.name as child_name, e.title as event_title
      FROM notification_log nl
      LEFT JOIN children c ON nl.child_id = c.id
      LEFT JOIN events e ON nl.event_id = e.id
      WHERE nl.user_id = ?
      ORDER BY nl.created_at DESC
      LIMIT ?
    `).bind(userId, parseInt(limit)).all()
    
    return c.json({ notifications: notifications.results || [] })
  } catch (error) {
    return c.json({ error: 'Failed to load notification history' }, 500)
  }
})

export default app
