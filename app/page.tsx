"use client"

import { useState } from "react"
import IntakeForm from "../intake-form"
import TicketPage from "../ticket-page"

interface FormData {
  reporter: string
  description: string
  priority: string
  issueCategory: string
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

export default function Page() {
  const [currentView, setCurrentView] = useState<"form" | "ticket">("form")
  const [ticketData, setTicketData] = useState<{
    ticketId: string
    contactEmails: string
    createdDate: Date
    formData: FormData
  } | null>(null)

  const handleTicketCreated = (ticketId: string, contactEmails: string, formData: FormData) => {
    setTicketData({
      ticketId,
      contactEmails,
      createdDate: new Date(),
      formData,
    })
    setCurrentView("ticket")
  }

  const handleBackToForm = () => {
    setCurrentView("form")
    setTicketData(null)
  }

  if (currentView === "ticket" && ticketData) {
    return (
      <TicketPage
        ticketId={ticketData.ticketId}
        createdDate={ticketData.createdDate}
        formData={ticketData.formData}
        onBackToForm={handleBackToForm}
      />
    )
  }

  return <IntakeForm onTicketCreated={handleTicketCreated} />
}
