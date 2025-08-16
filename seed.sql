-- Seed data for Sports Tracker app

-- Insert sample sports
INSERT OR IGNORE INTO sports (id, name, category) VALUES 
  (1, 'Soccer', 'team_sport'),
  (2, 'Football', 'team_sport'),
  (3, 'Basketball', 'team_sport'),
  (4, 'Baseball', 'team_sport'),
  (5, 'Track', 'individual_sport'),
  (6, 'Archery', 'individual_sport'),
  (7, 'Swimming', 'individual_sport'),
  (8, 'Tennis', 'individual_sport');

-- Insert sample teams (matching the logos you showed me)
INSERT OR IGNORE INTO teams (id, name, sport_id, coach_name, season) VALUES 
  (1, 'Rockvale Soccer Rockets', 1, 'Coach Johnson', 'Fall 2024'),
  (2, 'Tennessee Soccer Club', 1, 'Coach Martinez', 'Fall 2024'),
  (3, 'Rockvale Football', 2, 'Coach Williams', 'Fall 2024'),
  (4, 'MBA Baseball', 4, 'Coach Davis', 'Spring 2025'),
  (5, 'Rockvale Archery', 6, 'Coach Thompson', 'Year Round'),
  (6, 'Rockvale Track Team', 5, 'Coach Anderson', 'Spring 2025');

-- Sample user (parent account) - password is 'password'
INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES 
  (1, 'parent@example.com', 'Parent User', 'cGFzc3dvcmQ=');

-- Sample children
INSERT OR IGNORE INTO children (id, user_id, name, birth_date) VALUES 
  (1, 1, 'Emma', '2010-05-15'),
  (2, 1, 'Jake', '2008-09-22');

-- Sample child-team associations
-- Emma: Rockvale Soccer, Track, TSC Soccer
INSERT OR IGNORE INTO child_teams (child_id, team_id, jersey_number, active) VALUES 
  (1, 1, 12, true),  -- Emma - Rockvale Soccer
  (1, 2, 8, true),   -- Emma - TSC Soccer
  (1, 6, NULL, true); -- Emma - Track Team

-- Jake: Rockvale Football, Archery, MBA Baseball
INSERT OR IGNORE INTO child_teams (child_id, team_id, jersey_number, active) VALUES 
  (2, 3, 24, true),  -- Jake - Rockvale Football
  (2, 4, 15, true),  -- Jake - MBA Baseball
  (2, 5, NULL, true); -- Jake - Archery

-- Sample events for the next few weeks
INSERT OR IGNORE INTO events (team_id, type, title, event_date, start_time, end_time, location, opponent, is_home) VALUES 
  -- Rockvale Soccer events
  (1, 'practice', 'Soccer Practice', '2024-08-20', '17:00', '18:30', 'Rockvale High School Field', NULL, true),
  (1, 'game', 'vs Franklin Panthers', '2024-08-24', '14:00', '15:30', 'Franklin Sports Complex', 'Franklin Panthers', false),
  (1, 'practice', 'Soccer Practice', '2024-08-27', '17:00', '18:30', 'Rockvale High School Field', NULL, true),
  
  -- TSC Soccer events
  (2, 'practice', 'TSC Training', '2024-08-21', '18:00', '19:30', 'TSC Training Facility', NULL, true),
  (2, 'game', 'vs Nashville United', '2024-08-25', '10:00', '11:30', 'Nashville Soccer Park', 'Nashville United', false),
  
  -- Football events
  (3, 'practice', 'Football Practice', '2024-08-19', '16:00', '18:00', 'Rockvale Stadium', NULL, true),
  (3, 'game', 'vs Blackman Blaze', '2024-08-23', '19:00', '21:00', 'Rockvale Stadium', 'Blackman Blaze', true),
  
  -- Baseball events
  (4, 'practice', 'Baseball Practice', '2024-08-22', '17:30', '19:00', 'MBA Baseball Field', NULL, true),
  (4, 'game', 'vs Brentwood Academy', '2024-08-26', '16:00', '18:00', 'MBA Baseball Field', 'Brentwood Academy', true),
  
  -- Track events
  (6, 'practice', 'Track Practice', '2024-08-20', '15:30', '17:00', 'Rockvale Track', NULL, true),
  (6, 'meet', 'County Track Meet', '2024-08-24', '09:00', '15:00', 'Murfreesboro Track Complex', NULL, false),
  
  -- Archery events
  (5, 'practice', 'Archery Practice', '2024-08-21', '16:00', '17:30', 'Rockvale Archery Range', NULL, true),
  (5, 'tournament', 'Regional Archery Tournament', '2024-08-25', '08:00', '16:00', 'Nashville Archery Center', NULL, false);

-- Set event attendance for children
INSERT OR IGNORE INTO event_attendance (event_id, child_id, status) 
SELECT e.id, ct.child_id, 'attending'
FROM events e
JOIN child_teams ct ON e.team_id = ct.team_id
WHERE ct.active = true;