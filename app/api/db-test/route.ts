import { NextResponse } from "next/server"
import { TicketService } from "@/lib/ticket-service"

export async function GET() {
  try {
    console.log("GET /api/db-test - Starting database test")

    const connection = await TicketService.testConnection()
    const tables = await TicketService.getTableInfo()
    const tableCheck = await TicketService.checkTablesExist()

    console.log("Database test results:", { connection, tables, tableCheck })

    return NextResponse.json({
      connection,
      tables,
      tableCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Database test error:", msg)

    return NextResponse.json(
      {
        connection: { success: false, message: msg },
        tables: { success: false, tables: [], message: "Could not fetch tables" },
        tableCheck: { success: false, missingTables: [], message: "Could not check tables" },
      },
      { status: 500 },
    )
  }
}
