import { type NextRequest, NextResponse } from "next/server"
import { TicketService } from "@/lib/ticket-service"

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/tickets - Starting ticket creation")

    const formData = await req.json()
    console.log("Received form data:", formData)

    // Validate required fields
    if (!formData.reporter || !formData.description) {
      return NextResponse.json(
        {
          success: false,
          message: "Reporter and description are required fields",
        },
        { status: 400 },
      )
    }

    // Check if tables exist first
    const tableCheck = await TicketService.checkTablesExist()
    if (!tableCheck.success) {
      console.error("Database tables missing:", tableCheck.missingTables)
      return NextResponse.json(
        {
          success: false,
          message: `Database setup incomplete. ${tableCheck.message}. Please run the SQL setup scripts.`,
        },
        { status: 500 },
      )
    }

    const ticketId = `TKT-${Date.now().toString().slice(-6)}`
    console.log("Generated ticket ID:", ticketId)

    const ticket = await TicketService.createTicket(ticketId, formData)
    console.log("Ticket created successfully:", ticket)

    return NextResponse.json(
      {
        success: true,
        ticketId: ticket.ticket_id,
        ticket,
        message: "Ticket created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API /tickets POST error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
