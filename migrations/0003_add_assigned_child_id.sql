-- Add assigned_child_id to teams table for individual child calendar assignment
ALTER TABLE teams ADD COLUMN assigned_child_id INTEGER;

-- Add foreign key constraint (SQLite will enforce this logically)
-- This references children.id to specify which child gets the calendar events