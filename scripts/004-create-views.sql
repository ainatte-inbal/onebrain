-- Create view for ticket summary with related data
CREATE VIEW ticket_summary AS
SELECT 
    t.id,
    t.ticket_id,
    t.reporter,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    t.resolved_at,
    t.closed_at,
    t.first_response_at,
    u.name as assigned_user_name,
    u.email as assigned_user_email,
    tm.name as assigned_team_name,
    COUNT(c.id) as comment_count,
    COUNT(a.id) as attachment_count,
    CASE 
        WHEN t.first_response_at IS NULL THEN 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600
        ELSE 0
    END as hours_to_first_response,
    CASE 
        WHEN t.resolved_at IS NULL AND t.status NOT IN ('resolved', 'closed') THEN 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600
        WHEN t.resolved_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600
        ELSE 0
    END as hours_to_resolution
FROM tickets t
LEFT JOIN users u ON t.assigned_user_id = u.id
LEFT JOIN teams tm ON t.assigned_team_id = tm.id
LEFT JOIN comments c ON t.id = c.ticket_id
LEFT JOIN attachments a ON t.id = a.ticket_id
GROUP BY t.id, u.name, u.email, tm.name;

-- Create view for SLA status
CREATE VIEW ticket_sla_status AS
SELECT 
    t.id,
    t.ticket_id,
    t.priority,
    t.vertical,
    t.status,
    t.created_at,
    t.first_response_at,
    t.resolved_at,
    t.closed_at,
    sla.tta_target_hours,
    sla.ttt_target_hours,
    sla.ttr_target_hours,
    sla.ttl_target_hours,
    -- TTA (Time to Acknowledge) - based on first response
    CASE 
        WHEN t.first_response_at IS NULL THEN 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600
        ELSE 
            EXTRACT(EPOCH FROM (t.first_response_at - t.created_at))/3600
    END as tta_elapsed_hours,
    -- TTA Status
    CASE 
        WHEN t.first_response_at IS NOT NULL THEN 'Met'
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600 >= sla.tta_target_hours THEN 'Breached'
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600 >= sla.tta_target_hours * 0.8 THEN 'Approaching'
        ELSE 'OK'
    END as tta_status,
    -- TTR (Time to Resolve)
    CASE 
        WHEN t.resolved_at IS NULL AND t.status NOT IN ('resolved', 'closed') THEN 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600
        WHEN t.resolved_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600
        ELSE 0
    END as ttr_elapsed_hours,
    -- TTR Status
    CASE 
        WHEN t.status IN ('resolved', 'closed') AND t.resolved_at IS NOT NULL THEN 'Met'
        WHEN t.status NOT IN ('resolved', 'closed') AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600 >= sla.ttr_target_hours THEN 'Breached'
        WHEN t.status NOT IN ('resolved', 'closed') AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at))/3600 >= sla.ttr_target_hours * 0.8 THEN 'Approaching'
        ELSE 'OK'
    END as ttr_status
FROM tickets t
LEFT JOIN sla_config sla ON (
    (sla.priority = t.priority OR sla.priority IS NULL) AND
    (sla.vertical = t.vertical OR sla.vertical IS NULL)
)
WHERE sla.id = (
    SELECT id FROM sla_config 
    WHERE (priority = t.priority OR priority IS NULL) 
    AND (vertical = t.vertical OR vertical IS NULL)
    ORDER BY 
        CASE WHEN priority IS NOT NULL THEN 1 ELSE 2 END,
        CASE WHEN vertical IS NOT NULL THEN 1 ELSE 2 END
    LIMIT 1
);

-- Create view for comment threads
CREATE VIEW comment_threads AS
WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT 
        c.id,
        c.ticket_id,
        c.parent_comment_id,
        c.author_name,
        c.content,
        c.user_type,
        c.created_at,
        0 as depth,
        ARRAY[c.id] as path,
        c.id as root_comment_id
    FROM comments c
    WHERE c.parent_comment_id IS NULL
    
    UNION ALL
    
    -- Recursive case: replies
    SELECT 
        c.id,
        c.ticket_id,
        c.parent_comment_id,
        c.author_name,
        c.content,
        c.user_type,
        c.created_at,
        ct.depth + 1,
        ct.path || c.id,
        ct.root_comment_id
    FROM comments c
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
)
SELECT * FROM comment_tree
ORDER BY root_comment_id, path;
