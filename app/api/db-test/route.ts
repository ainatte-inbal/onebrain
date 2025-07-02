import { NextResponse } from "next/server"
import { TicketService } from "@/lib/ticket-service"

export async function GET() {
  const connection = await TicketService.testConnection()
  const tables = await TicketService.getTableInfo()
  return NextResponse.json({ connection, tables })
}
