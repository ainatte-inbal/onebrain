import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database types
export interface DbTicket {
  id: number
  ticket_id: string
  reporter: string
  description: string
  priority?: string
  issue_category?: string
  provider_name_id?: string
  source: string
  products: string[]
  case_origin?: string
  reporter_notes?: string
  contact_emails?: string
  vertical?: string
  error_code?: string
  channel_id?: string
  channel_type?: string
  script_name?: string
  issue_impact?: string
  status: string
  assigned_team_id?: number
  assigned_user_id?: number
  close_reason?: string
  created_at: Date
  updated_at: Date
  resolved_at?: Date
  closed_at?: Date
  first_response_at?: Date
}

export interface DbComment {
  id: number
  ticket_id: number
  parent_comment_id?: number
  author_id?: number
  author_name: string
  content: string
  user_type: "internal" | "external"
  created_at: Date
  updated_at: Date
}

export interface DbHistoryEntry {
  id: number
  ticket_id: number
  action: string
  details: string
  user_id?: number
  user_name: string
  created_at: Date
}
