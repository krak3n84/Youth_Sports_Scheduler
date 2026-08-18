-- Synthetic seed/reference data for the Youth Sports Scheduler learning project.
-- Keep public demo data fictional. Do not commit real children, birth dates,
-- private team schedules, calendar URLs, credentials, or other family data.

INSERT OR IGNORE INTO sports (id, name, category) VALUES
  (1, 'Soccer', 'team_sport'),
  (2, 'Football', 'team_sport'),
  (3, 'Basketball', 'team_sport'),
  (4, 'Baseball', 'team_sport'),
  (5, 'Track', 'individual_sport'),
  (6, 'Archery', 'individual_sport'),
  (7, 'Swimming', 'individual_sport'),
  (8, 'Tennis', 'individual_sport');

-- Fictional teams used only to exercise team/sport relationships.
INSERT OR IGNORE INTO teams (id, name, sport_id, coach_name, season) VALUES
  (1, 'Riverside FC', 1, 'Coach Taylor', 'Fall Demo'),
  (2, 'Metro United', 1, 'Coach Morgan', 'Fall Demo'),
  (3, 'Rockets Football', 2, 'Coach Jordan', 'Fall Demo'),
  (4, 'Lions Baseball', 4, 'Coach Parker', 'Spring Demo'),
  (5, 'Community Archery', 6, 'Coach Riley', 'Year Round Demo'),
  (6, 'Riverside Track', 5, 'Coach Casey', 'Spring Demo');

-- No default user/password is seeded in the public repository.
-- Create test users through the application registration flow in a local
-- development environment.
