// Type definitions for Sports Tracker App

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface Child {
  id: number;
  user_id: number;
  name: string;
  photo_url?: string;
  birth_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Sport {
  id: number;
  name: string;
  category: 'team_sport' | 'individual_sport' | 'activity';
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  sport_id: number;
  sport_name?: string; // Joined from sports table
  coach_name?: string;
  coach_contact?: string;
  season?: string;
  calendar_url?: string;
  last_sync?: string;
  sync_enabled: boolean;
  created_at: string;
}

export interface ChildTeam {
  id: number;
  child_id: number;
  team_id: number;
  jersey_number?: number;
  position?: string;
  active: boolean;
  created_at: string;
  team?: Team; // For joined queries
}

export interface Event {
  id: number;
  team_id: number;
  type: 'game' | 'practice' | 'tournament' | 'meet';
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  opponent?: string;
  is_home: boolean;
  reminder_minutes: number;
  source: 'manual' | 'calendar' | 'imported';
  external_id?: string;
  last_updated?: string;
  created_at: string;
  updated_at?: string;
  team?: Team; // For joined queries
}

export interface EventAttendance {
  id: number;
  event_id: number;
  child_id: number;
  status: 'attending' | 'not_attending' | 'pending';
  notes?: string;
  created_at: string;
}

// Cloudflare bindings
export interface Bindings {
  DB: D1Database;
}