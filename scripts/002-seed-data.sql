-- Insert sample teams
INSERT INTO teams (name, description) VALUES
('Support Team', 'Customer support and first-line assistance'),
('Engineering Team', 'Software development and technical solutions'),
('QA Team', 'Quality assurance and testing'),
('DevOps Team', 'Infrastructure and deployment management'),
('Product Team', 'Product management and strategy');

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
('chris.martinez@company.com', 'Chris Martinez', 'internal', 2),
('jennifer.anderson@company.com', 'Jennifer Anderson', 'internal', 3),
('robert.taylor@company.com', 'Robert Taylor', 'internal', 1),
('michelle.thomas@company.com', 'Michelle Thomas', 'internal', 4),
('kevin.jackson@company.com', 'Kevin Jackson', 'internal', 5),
('laura.white@company.com', 'Laura White', 'internal', 2),
('daniel.harris@company.com', 'Daniel Harris', 'internal', 3),
('stephanie.martin@company.com', 'Stephanie Martin', 'internal', 1),
('matthew.thompson@company.com', 'Matthew Thompson', 'internal', 4),
('nicole.garcia@company.com', 'Nicole Garcia', 'internal', 5),
('andrew.martinez@company.com', 'Andrew Martinez', 'internal', 2),
('jessica.robinson@company.com', 'Jessica Robinson', 'internal', 1),
('customer1@example.com', 'Customer User 1', 'external', NULL),
('customer2@example.com', 'Customer User 2', 'external', NULL),
('partner1@partner.com', 'Partner User 1', 'external', NULL);

-- Insert default SLA configuration
INSERT INTO sla_config (name, tta_target_hours, ttt_target_hours, ttr_target_hours, ttl_target_hours) VALUES
('Default SLA', 4, 8, 24, 72),
('Critical Priority SLA', 1, 2, 8, 24),
('High Priority SLA', 2, 4, 16, 48),
('Banking Vertical SLA', 2, 4, 12, 36);

-- Insert sample error codes (you can expand this list)
INSERT INTO error_codes (code, description) VALUES
('101', 'Authentication Failed'),
('102', 'Invalid Credentials'),
('103', 'Connection Timeout'),
('104', 'Server Unavailable'),
('105', 'Rate Limit Exceeded'),
('106', 'Invalid Request Format'),
('107', 'Missing Required Parameters'),
('108', 'Unauthorized Access'),
('109', 'Resource Not Found'),
('110', 'Internal Server Error');
