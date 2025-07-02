-- Run this script first to set up the complete database schema
-- This combines all the setup scripts into one file for easier execution

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'internal' CHECK (user_type IN ('internal', 'external')),
    team_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Error Codes lookup table
CREATE TABLE IF NOT EXISTS error_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    reporter VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    issue_category VARCHAR(50),
    provider_name_id VARCHAR(255),
    source VARCHAR(50) DEFAULT 'other' CHECK (source IN ('partner', 'tax', 'ps', 'other')),
    products TEXT[], -- PostgreSQL array type
    case_origin VARCHAR(50) CHECK (case_origin IN ('email', 'voc', 'web', 'proactive')),
    reporter_notes TEXT,
    contact_emails TEXT,
    vertical VARCHAR(50) CHECK (vertical IN ('banking', 'investment', 'tax', 'commerce')),
    error_code VARCHAR(255),
    channel_id VARCHAR(255),
    channel_type VARCHAR(50) CHECK (channel_type IN ('screen-scraping', 'api', 'ofx')),
    script_name VARCHAR(255),
    issue_impact VARCHAR(20) CHECK (issue_impact IN ('1-10', '10-100', '100-500', '500+')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved', 'waiting-customer-response')),
    assigned_team_id INTEGER REFERENCES teams(id),
    assigned_user_id INTEGER REFERENCES users(id),
    close_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    first_response_at TIMESTAMP
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    author_name VARCHAR(255) NOT NULL, -- Fallback for when author_id is null
    content TEXT NOT NULL,
    user_type VARCHAR(20) DEFAULT 'internal' CHECK (user_type IN ('internal', 'external')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure attachment belongs to either ticket or comment, not both
    CONSTRAINT attachment_belongs_to_one CHECK (
        (ticket_id IS NOT NULL AND comment_id IS NULL) OR 
        (ticket_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Create History table for audit trail
CREATE TABLE IF NOT EXISTS ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL, -- Fallback for when user_id is null
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SLA Configuration table
CREATE TABLE IF NOT EXISTS sla_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tta_target_hours INTEGER NOT NULL DEFAULT 4,  -- Time to Acknowledge
    ttt_target_hours INTEGER NOT NULL DEFAULT 8,  -- Time to Touch
    ttr_target_hours INTEGER NOT NULL DEFAULT 24, -- Time to Resolve
    ttl_target_hours INTEGER NOT NULL DEFAULT 72, -- Time to Live
    priority VARCHAR(20),
    vertical VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for team_id in users table
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_user ON tickets(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_team ON tickets(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_comment_id ON attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_error_codes_code ON error_codes(code);
CREATE INDEX IF NOT EXISTS idx_error_codes_category ON error_codes(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_error_codes_updated_at ON error_codes;
CREATE TRIGGER update_error_codes_updated_at BEFORE UPDATE ON error_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample teams
INSERT INTO teams (name, description) VALUES
('Support Team', 'Customer support and first-line assistance'),
('Engineering Team', 'Software development and technical solutions'),
('QA Team', 'Quality assurance and testing'),
('DevOps Team', 'Infrastructure and deployment management'),
('Product Team', 'Product management and strategy')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users
INSERT INTO users (email, name, user_type, team_id) VALUES
('john.doe@company.com', 'John Doe', 'internal', 1),
('jane.smith@company.com', 'Jane Smith', 'internal', 2),
('mike.johnson@company.com', 'Mike Johnson', 'internal', 1),
('sarah.wilson@company.com', 'Sarah Wilson', 'internal', 3),
('david.brown@company.com', 'David Brown', 'internal', 2),
('lisa.davis@company.com', 'Lisa Davis', 'internal', 4),
('tom.miller@company.com', 'Tom Miller', 'internal', 5),
('amy.garcia@company.com', 'Amy Garcia', 'internal', 1),
('customer1@example.com', 'Customer User 1', 'external', NULL),
('customer2@example.com', 'Customer User 2', 'external', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert default SLA configuration
INSERT INTO sla_config (name, tta_target_hours, ttt_target_hours, ttr_target_hours, ttl_target_hours) VALUES
('Default SLA', 4, 8, 24, 72),
('Critical Priority SLA', 1, 2, 8, 24),
('High Priority SLA', 2, 4, 16, 48),
('Banking Vertical SLA', 2, 4, 12, 36)
ON CONFLICT DO NOTHING;

-- Insert comprehensive error codes
INSERT INTO error_codes (code, description, category, severity) VALUES
('101', 'Authentication Failed', 'Authentication', 'high'),
('102', 'Invalid Credentials', 'Authentication', 'high'),
('103', 'Connection Timeout', 'Network', 'medium'),
('104', 'Server Unavailable', 'Server', 'high'),
('105', 'Rate Limit Exceeded', 'API', 'medium'),
('106', 'Invalid Request Format', 'API', 'low'),
('107', 'Missing Required Parameters', 'API', 'medium'),
('108', 'Unauthorized Access', 'Security', 'high'),
('109', 'Resource Not Found', 'API', 'low'),
('110', 'Internal Server Error', 'Server', 'critical'),
('201', 'Account Locked', 'Account', 'high'),
('202', 'Account Suspended', 'Account', 'high'),
('203', 'Account Expired', 'Account', 'medium'),
('204', 'Insufficient Permissions', 'Authorization', 'medium'),
('205', 'Account Not Verified', 'Account', 'medium'),
('301', 'Data Validation Error', 'Data', 'medium'),
('302', 'Invalid Date Format', 'Data', 'low'),
('303', 'Missing Transaction Data', 'Transaction', 'medium'),
('304', 'Duplicate Transaction', 'Transaction', 'medium'),
('305', 'Transaction Limit Exceeded', 'Transaction', 'high'),
('401', 'Network Connection Failed', 'Network', 'high'),
('402', 'SSL Certificate Error', 'Security', 'high'),
('403', 'Proxy Authentication Required', 'Network', 'medium'),
('404', 'DNS Resolution Failed', 'Network', 'high'),
('405', 'Connection Refused', 'Network', 'high'),
('501', 'Configuration Error', 'System', 'high'),
('502', 'Database Connection Failed', 'Database', 'critical'),
('503', 'Cache Error', 'System', 'medium'),
('504', 'File System Error', 'System', 'high'),
('505', 'Memory Allocation Error', 'System', 'critical')
ON CONFLICT (code) DO NOTHING;
