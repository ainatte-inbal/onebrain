-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'internal' CHECK (user_type IN ('internal', 'external')),
    team_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    reporter VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    issue_category VARCHAR(50),
    provider_name_id VARCHAR(255),
    source VARCHAR(50) DEFAULT 'other' CHECK (source IN ('partner', 'tax', 'ps', 'other')),
    products TEXT[], -- PostgreSQL array type, use JSON for other databases
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
CREATE TABLE comments (
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
CREATE TABLE attachments (
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
CREATE TABLE ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL, -- Fallback for when user_id is null
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SLA Configuration table
CREATE TABLE sla_config (
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

-- Create indexes for better performance
CREATE INDEX idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_assigned_user ON tickets(assigned_user_id);
CREATE INDEX idx_tickets_assigned_team ON tickets(assigned_team_id);
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX idx_attachments_comment_id ON attachments(comment_id);
CREATE INDEX idx_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_users_email ON users(email);

-- Add foreign key constraint for team_id in users table
ALTER TABLE users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
