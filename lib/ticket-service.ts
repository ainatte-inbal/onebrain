import { sql } from "./database"
import type { DbTicket, DbComment, DbHistoryEntry } from "./database"

interface FormData {
  reporter: string
  description: string
  priority: string
  issueCategory: string
  providerNameId: string
  source: string
  products: string[]
  caseOrigin: string
  attachments: File[]
  reporterNotes: string
  contactEmails: string
  vertical: string
  errorCode: string
  channelId: string
  channelType: string
  scriptName: string
  issueImpact: string
}

export class TicketService {
  static async createTicket(ticketId: string, formData: FormData): Promise<DbTicket> {
    try {
      const result = await sql`
        INSERT INTO tickets (
          ticket_id, reporter, description, priority, issue_category, 
          provider_name_id, source, products, case_origin, reporter_notes,
          contact_emails, vertical, error_code, channel_id, channel_type,
          script_name, issue_impact, status
        ) VALUES (
          ${ticketId}, ${formData.reporter}, ${formData.description}, 
          ${formData.priority || null}, ${formData.issueCategory || null},
          ${formData.providerNameId || null}, ${formData.source}, ${formData.products},
          ${formData.caseOrigin || null}, ${formData.reporterNotes || null},
          ${formData.contactEmails || null}, ${formData.vertical || null},
          ${formData.errorCode || null}, ${formData.channelId || null},
          ${formData.channelType || null}, ${formData.scriptName || null},
          ${formData.issueImpact || null}, 'open'
        )
        RETURNING *
      `

      const ticket = result[0] as DbTicket

      // Add initial history entry
      await this.addHistoryEntry(ticket.id, "Ticket created", `Ticket ${ticketId} was created`, formData.reporter)

      return ticket
    } catch (error) {
      console.error("Error creating ticket:", error)
      throw new Error("Failed to create ticket in database")
    }
  }

  static async getTicket(ticketId: string): Promise<DbTicket | null> {
    try {
      const result = await sql`
        SELECT * FROM tickets WHERE ticket_id = ${ticketId}
      `
      return (result[0] as DbTicket) || null
    } catch (error) {
      console.error("Error fetching ticket:", error)
      throw new Error("Failed to fetch ticket from database")
    }
  }

  static async updateTicket(ticketId: string, updates: Partial<DbTicket>): Promise<DbTicket> {
    try {
      const setParts = []
      const values = []

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== "id" && key !== "ticket_id" && key !== "created_at") {
          setParts.push(`${key} = $${values.length + 2}`)
          values.push(value)
        }
      })

      if (setParts.length === 0) {
        throw new Error("No valid fields to update")
      }

      const query = `
        UPDATE tickets 
        SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = $1
        RETURNING *
      `

      const result = await sql.unsafe(query, [ticketId, ...values])
      return result[0] as DbTicket
    } catch (error) {
      console.error("Error updating ticket:", error)
      throw new Error("Failed to update ticket in database")
    }
  }

  static async addComment(
    ticketId: number,
    comment: {
      authorName: string
      content: string
      userType: "internal" | "external"
      parentCommentId?: number
    },
  ): Promise<DbComment> {
    try {
      const result = await sql`
        INSERT INTO comments (
          ticket_id, parent_comment_id, author_name, content, user_type
        ) VALUES (
          ${ticketId}, ${comment.parentCommentId || null}, 
          ${comment.authorName}, ${comment.content}, ${comment.userType}
        )
        RETURNING *
      `

      return result[0] as DbComment
    } catch (error) {
      console.error("Error adding comment:", error)
      throw new Error("Failed to add comment to database")
    }
  }

  static async getComments(ticketId: number): Promise<DbComment[]> {
    try {
      const result = await sql`
        SELECT * FROM comments 
        WHERE ticket_id = ${ticketId}
        ORDER BY created_at DESC
      `
      return result as DbComment[]
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw new Error("Failed to fetch comments from database")
    }
  }

  static async addHistoryEntry(
    ticketId: number,
    action: string,
    details: string,
    userName: string,
  ): Promise<DbHistoryEntry> {
    try {
      const result = await sql`
        INSERT INTO ticket_history (ticket_id, action, details, user_name)
        VALUES (${ticketId}, ${action}, ${details}, ${userName})
        RETURNING *
      `
      return result[0] as DbHistoryEntry
    } catch (error) {
      console.error("Error adding history entry:", error)
      throw new Error("Failed to add history entry to database")
    }
  }

  static async getHistory(ticketId: number): Promise<DbHistoryEntry[]> {
    try {
      const result = await sql`
        SELECT * FROM ticket_history 
        WHERE ticket_id = ${ticketId}
        ORDER BY created_at DESC
      `
      return result as DbHistoryEntry[]
    } catch (error) {
      console.error("Error fetching history:", error)
      throw new Error("Failed to fetch history from database")
    }
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await sql`SELECT 1 as test`
      return {
        success: true,
        message: `Database connection successful. Test query returned: ${result[0].test}`,
      }
    } catch (error) {
      console.error("Database connection test failed:", error)
      return {
        success: false,
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  static async getTableInfo(): Promise<{ success: boolean; tables: string[]; message: string }> {
    try {
      const result = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `

      const tables = result.map((row: any) => row.table_name)

      return {
        success: true,
        tables,
        message: `Found ${tables.length} tables in database`,
      }
    } catch (error) {
      console.error("Error fetching table info:", error)
      return {
        success: false,
        tables: [],
        message: `Failed to fetch table info: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}
