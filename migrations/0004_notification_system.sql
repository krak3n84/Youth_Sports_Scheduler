-- Notification System Database Schema

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TEXT DEFAULT '08:00', -- Time in HH:MM format
  pre_event_reminder_enabled BOOLEAN DEFAULT true,
  pre_event_reminder_minutes INTEGER DEFAULT 120, -- 2 hours = 120 minutes
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'America/Chicago',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Child-specific notification preferences (inherits from user but can be customized)
CREATE TABLE IF NOT EXISTS child_notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  pre_event_reminder_enabled BOOLEAN DEFAULT true,
  notification_email TEXT, -- Optional separate email for child notifications
  notification_phone TEXT, -- Optional phone number for SMS
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- Notification queue/log for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  child_id INTEGER,
  event_id INTEGER,
  notification_type TEXT NOT NULL, -- 'daily_summary', 'pre_event_reminder'
  delivery_method TEXT NOT NULL, -- 'email', 'push', 'sms'
  recipient TEXT NOT NULL, -- email address, phone number, or device token
  subject TEXT,
  message TEXT NOT NULL,
  scheduled_for DATETIME NOT NULL,
  sent_at DATETIME,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Push notification device tokens
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT, -- 'ios', 'android', 'web'
  device_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_child_notification_settings_child_id ON child_notification_settings(child_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_scheduled_for ON notification_log(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_notification_tokens(user_id);