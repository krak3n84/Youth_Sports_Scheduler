-- Sports Tracker Database Schema

-- Users table (parent accounts)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Children profiles
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  birth_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sports/activities that children participate in
CREATE TABLE IF NOT EXISTS sports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- 'team_sport', 'individual_sport', 'activity'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teams/organizations
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sport_id INTEGER NOT NULL,
  coach_name TEXT,
  coach_contact TEXT,
  season TEXT, -- 'Spring 2024', 'Fall 2024', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sport_id) REFERENCES sports(id)
);

-- Child-team associations (many-to-many)
CREATE TABLE IF NOT EXISTS child_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE(child_id, team_id)
);

-- Events (games, practices, meets, tournaments)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'game', 'practice', 'tournament', 'meet'
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  opponent TEXT, -- for games
  is_home BOOLEAN DEFAULT false,
  reminder_minutes INTEGER DEFAULT 60, -- minutes before event
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Event attendance tracking
CREATE TABLE IF NOT EXISTS event_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'attending', 'not_attending', 'pending'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE(event_id, child_id)
);

-- Stats tracking (optional feature)
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  event_id INTEGER,
  stat_type TEXT NOT NULL, -- 'goals', 'assists', 'points', 'time', etc.
  value REAL NOT NULL,
  unit TEXT, -- 'seconds', 'minutes', 'count', etc.
  notes TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_child_teams_child_id ON child_teams(child_id);
CREATE INDEX IF NOT EXISTS idx_child_teams_team_id ON child_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_child_id ON event_attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_stats_child_id ON stats(child_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);