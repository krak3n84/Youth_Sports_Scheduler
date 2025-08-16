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

export default app
