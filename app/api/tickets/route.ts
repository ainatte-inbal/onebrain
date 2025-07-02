import { type NextRequest, NextResponse } from "next/server"
import { TicketService } from "@/lib/ticket-service"

export async function POST(req: NextRequest) {
  try {
    const formData = (await req.json()) as any
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`
    const ticket = await TicketService.createTicket(ticketId, formData)

    return NextResponse.json({ success: true, ticketId: ticket.ticket_id, ticket }, { status: 201 })
  } catch (error) {
    console.error("API /tickets POST error:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
