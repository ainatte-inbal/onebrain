;/import { sql } from "@vercel/egoprsst
";

export class TicketService {
  /**
   * Executes `SELECT 1` to verify that the DATABASE_URL actually works.
   * This function **never throws** – it always returns an object so callers
   * don’t need their own `try/catch`.
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await sql`SELECT 1 as ok`
      return {
        success: true,
        message: `Database OK – returned: ${result?.[0]?.ok ?? "unknown"}`,
      }
    } catch (err) {
      // Neon throws `SyntaxError: Unexpected token 'I' …` if the backend
      // answers with the plain-text string “Invalid request”.  That happens
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
      const rows = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
      const names = rows.map((r: any) => r.table_name)
      return { success: true, tables: names, message: `Found ${names.length} tables` }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("getTableInfo() error:", msg)
      return { success: false, tables: [], message: msg }
    }
  }

  static async checkTablesExist(tableNames: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const placeholders = tableNames.map(() => "text").join(", ")
      const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (${placeholders})
      `

      const rows = await sql.unsafe(query, tableNames)

      const existingTables = rows.map((r: any) => r.table_name)

      const missingTables = tableNames.filter((name) => !existingTables.includes(name))

      if (missingTables.length === 0) {
        return { success: true, message: "All tables exist" }
      } else {
        return { success: false, message: `Missing tables: ${missingTables.join(", ")}` }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("checkTablesExist() error:", msg)
      return { success: false, message: msg }
    }
  }
}
