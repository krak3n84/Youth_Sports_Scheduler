-- Add calendar integration fields to teams table

ALTER TABLE teams ADD COLUMN calendar_url TEXT;
ALTER TABLE teams ADD COLUMN last_sync DATETIME;
ALTER TABLE teams ADD COLUMN sync_enabled BOOLEAN DEFAULT 0;

-- Add source tracking for events
ALTER TABLE events ADD COLUMN source TEXT DEFAULT 'manual'; -- 'manual', 'calendar', 'imported'
ALTER TABLE events ADD COLUMN external_id TEXT; -- For tracking imported events
ALTER TABLE events ADD COLUMN last_updated DATETIME;

-- Update existing events to have last_updated
UPDATE events SET last_updated = created_at WHERE last_updated IS NULL;

-- Create index for external event tracking
CREATE INDEX IF NOT EXISTS idx_events_external_id ON events(external_id);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_teams_sync ON teams(sync_enabled, last_sync);