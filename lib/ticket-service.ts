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
      console.log("Creating ticket with data:", { ticketId, formData })

      // Ensure required fields are not empty
      if (!formData.reporter || !formData.description) {
        throw new Error("Reporter and description are required fields")
      }

      // Convert empty strings to null for optional fields
      const cleanData = {
        priority: formData.priority || null,
        issueCategory: formData.issueCategory || null,
        providerNameId: formData.providerNameId || null,
        caseOrigin: formData.caseOrigin || null,
        reporterNotes: formData.reporterNotes || null,
        contactEmails: formData.contactEmails || null,
        vertical: formData.vertical || null,
        errorCode: formData.errorCode || null,
        channelId: formData.channelId || null,
        channelType: formData.channelType || null,
        scriptName: formData.scriptName || null,
        issueImpact: formData.issueImpact || null,
      }

      console.log("Cleaned data:", cleanData)

      const result = await sql`
        INSERT INTO tickets (
          ticket_id, reporter, description, priority, issue_category, 
          provider_name_id, source, products, case_origin, reporter_notes,
          contact_emails, vertical, error_code, channel_id, channel_type,
          script_name, issue_impact, status
        ) VALUES (
          ${ticketId}, 
          ${formData.reporter}, 
          ${formData.description}, 
          ${cleanData.priority}, 
          ${cleanData.issueCategory},
          ${cleanData.providerNameId}, 
          ${formData.source}, 
          ${formData.products},
          ${cleanData.caseOrigin}, 
          ${cleanData.reporterNotes},
          ${cleanData.contactEmails}, 
          ${cleanData.vertical},
          ${cleanData.errorCode}, 
          ${cleanData.channelId},
          ${cleanData.channelType}, 
          ${cleanData.scriptName},
          ${cleanData.issueImpact}, 
          'open'
        )
        RETURNING *
      `

      console.log("Insert result:", result)

      if (!result || result.length === 0) {
        throw new Error("No ticket was created - insert returned empty result")
      }

      const ticket = result[0] as DbTicket

      // Add initial history entry
      try {
        await this.addHistoryEntry(ticket.id, "Ticket created", `Ticket ${ticketId} was created`, formData.reporter)
      } catch (historyError) {
        console.warn("Failed to add history entry:", historyError)
        // Don't fail the whole operation if history fails
      }

      return ticket
    } catch (error) {
      console.error("Error creating ticket:", error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('relation "tickets" does not exist')) {
          throw new Error("Database tables not found. Please run the SQL setup scripts first.")
        }
        if (error.message.includes("duplicate key")) {
          throw new Error("A ticket with this ID already exists.")
        }
        if (error.message.includes("violates check constraint")) {
          throw new Error("Invalid data provided. Please check your form inputs.")
        }
        if (error.message.includes("null value in column")) {
          throw new Error("Missing required field data.")
        }
        throw new Error(`Database error: ${error.message}`)
      }

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

  /**
   * Executes `SELECT 1` to verify that the DATABASE_URL actually works.
   * This function **never throws** – it always returns an object so callers
   * don't need their own `try/catch`.
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await sql`SELECT 1 as test`
      return {
        success: true,
        message: `Database connection successful. Test query returned: ${result[0]?.test ?? "undefined"}`,
      }
    } catch (err) {
      // Neon throws `SyntaxError: Unexpected token 'I' …` if the backend
      // answers with the plain-text string "Invalid request".  That happens
      // when the connection string is wrong (e.g. not a Neon HTTP URL) or
      // the database does not exist.
      const msg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err)

      console.error("testConnection(): driver failure →", msg)

      return {
        success: false,
        message: msg.startsWith("Unexpected token")
          ? "Invalid response from database – your DATABASE_URL is probably wrong (must be the Neon HTTP URL)."
          : `Database connection failed – ${msg}`,
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

  static async checkTablesExist(): Promise<{ success: boolean; missingTables: string[]; message: string }> {
    try {
      const requiredTables = ["tickets", "comments", "ticket_history", "users", "teams"]

      // Use individual queries instead of sql.unsafe with ANY
      const tableChecks = await Promise.all(
        requiredTables.map(async (tableName) => {
          try {
            const result = await sql`
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = ${tableName}
            `
            return result.length > 0 ? tableName : null
          } catch {
            return null
          }
        }),
      )

      const existingTables = tableChecks.filter((table): table is string => table !== null)
      const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

      return {
        success: missingTables.length === 0,
        missingTables,
        message:
          missingTables.length === 0 ? "All required tables exist" : `Missing tables: ${missingTables.join(", ")}`,
      }
    } catch (error) {
      console.error("Error checking tables:", error)
      return {
        success: false,
        missingTables: [],
        message: `Failed to check tables: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}
