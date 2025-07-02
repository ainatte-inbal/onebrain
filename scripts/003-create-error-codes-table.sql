-- Create Error Codes lookup table
CREATE TABLE error_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
('206', 'Password Expired', 'Authentication', 'medium'),
('207', 'Two-Factor Required', 'Authentication', 'medium'),
('208', 'Security Question Failed', 'Authentication', 'medium'),
('209', 'Device Not Recognized', 'Security', 'medium'),
('210', 'Login Attempt Blocked', 'Security', 'high'),
('301', 'Data Validation Error', 'Data', 'medium'),
('302', 'Invalid Date Format', 'Data', 'low'),
('303', 'Missing Transaction Data', 'Transaction', 'medium'),
('304', 'Duplicate Transaction', 'Transaction', 'medium'),
('305', 'Transaction Limit Exceeded', 'Transaction', 'high'),
('306', 'Invalid Account Number', 'Account', 'medium'),
('307', 'Insufficient Funds', 'Transaction', 'medium'),
('308', 'Transaction Declined', 'Transaction', 'medium'),
('309', 'Currency Mismatch', 'Transaction', 'low'),
('310', 'Processing Error', 'Transaction', 'high'),
('401', 'Network Connection Failed', 'Network', 'high'),
('402', 'SSL Certificate Error', 'Security', 'high'),
('403', 'Proxy Authentication Required', 'Network', 'medium'),
('404', 'DNS Resolution Failed', 'Network', 'high'),
('405', 'Connection Refused', 'Network', 'high'),
('406', 'Request Timeout', 'Network', 'medium'),
('407', 'Gateway Timeout', 'Network', 'high'),
('408', 'Service Unavailable', 'Server', 'high'),
('409', 'Bad Gateway', 'Network', 'high'),
('410', 'Network Unreachable', 'Network', 'critical'),
('501', 'Configuration Error', 'System', 'high'),
('502', 'Database Connection Failed', 'Database', 'critical'),
('503', 'Cache Error', 'System', 'medium'),
('504', 'File System Error', 'System', 'high'),
('505', 'Memory Allocation Error', 'System', 'critical'),
('506', 'Thread Pool Exhausted', 'System', 'high'),
('507', 'Queue Overflow', 'System', 'high'),
('508', 'Resource Cleanup Failed', 'System', 'medium'),
('509', 'Initialization Error', 'System', 'critical'),
('510', 'Shutdown Error', 'System', 'medium');

-- Create index for error codes
CREATE INDEX idx_error_codes_code ON error_codes(code);
CREATE INDEX idx_error_codes_category ON error_codes(category);

-- Add trigger for error_codes updated_at
CREATE TRIGGER update_error_codes_updated_at BEFORE UPDATE ON error_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
