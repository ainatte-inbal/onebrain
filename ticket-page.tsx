"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Upload,
  HelpCircle,
  Bell,
  Settings,
  User,
  ChevronDown,
  Send,
  CheckCircle,
  Edit,
  Reply,
  Paperclip,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  userType: "internal" | "external"
  attachments?: File[]
  parentId?: string
  replies?: Comment[]
}

interface HistoryEntry {
  id: string
  action: string
  details: string
  timestamp: Date
  user: string
}

interface TicketDates {
  created: Date
  updated?: Date
  resolved?: Date
  closed?: Date
  firstResponse?: Date
}

interface SLAData {
  tta: { target: number; elapsed: number; status: "OK" | "Approaching" | "Breached" }
  ttt: { target: number; elapsed: number; status: "OK" | "Approaching" | "Breached" }
  ttr: { target: number; elapsed: number; status: "OK" | "Approaching" | "Breached" }
  ttl: { target: number; elapsed: number; status: "OK" | "Approaching" | "Breached" }
  reopenCount: number
}

interface TicketPageProps {
  ticketId: string
  createdDate: Date
  formData: FormData
  onBackToForm: () => void
}

export default function TicketPage({ ticketId, createdDate, formData, onBackToForm }: TicketPageProps) {
  const [status, setStatus] = useState("open")
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [closeReason, setCloseReason] = useState("")
  const [assignedTeam, setAssignedTeam] = useState("")
  const [assignedUser, setAssignedUser] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<FormData>(formData)
  const [userType, setUserType] = useState<"internal" | "external">("internal")
  const [ticketDates, setTicketDates] = useState<TicketDates>({
    created: createdDate,
  })
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "John Doe",
      content: "This is an internal comment that should only be visible to internal users.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      userType: "internal",
      replies: [
        {
          id: "1-1",
          author: "Jane Smith",
          content: "Thanks for the update. I'll look into this.",
          timestamp: new Date(Date.now() - 3000000),
          userType: "internal",
          parentId: "1",
        },
      ],
    },
    {
      id: "2",
      author: "Jane Smith",
      content: "This is an external comment that should be visible to everyone.",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      userType: "external",
      attachments: [],
    },
  ])
  const [newComment, setNewComment] = useState("")
  const [newCommentAttachments, setNewCommentAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "1",
      action: "Ticket opened",
      details: `Ticket ${ticketId} was created`,
      timestamp: createdDate,
      user: formData.reporter || "System",
    },
  ])
  const [slaData, setSlaData] = useState<SLAData>({
    tta: { target: 4, elapsed: 0, status: "OK" }, // 4 hours
    ttt: { target: 8, elapsed: 0, status: "OK" }, // 8 hours
    ttr: { target: 24, elapsed: 0, status: "OK" }, // 24 hours
    ttl: { target: 72, elapsed: 0, status: "OK" }, // 72 hours
    reopenCount: 0,
  })

  const [priorityScore] = useState(() => {
    const priorities = ["P0", "P1", "P2", "P3"]
    return priorities[Math.floor(Math.random() * priorities.length)]
  })
  const [customerSatisfaction] = useState(() => {
    const scores = [1, 2, 3, 4, 5]
    return scores[Math.floor(Math.random() * scores.length)]
  })

  // Sample teams and users for assignment
  const teams = ["Support Team", "Engineering Team", "QA Team", "DevOps Team", "Product Team"]

  const users = [
    "John Smith",
    "Sarah Johnson",
    "Mike Davis",
    "Emily Brown",
    "David Wilson",
    "Lisa Anderson",
    "Tom Miller",
    "Jessica Garcia",
  ]

  const [isEditingPeople, setIsEditingPeople] = useState(false)
  const [editPeopleData, setEditPeopleData] = useState({
    contactEmails: formData.contactEmails,
    team: assignedTeam,
    assignee: assignedUser,
  })

  // Calculate SLA elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const createdTime = ticketDates.created.getTime()
      const elapsedHours = (now.getTime() - createdTime) / (1000 * 60 * 60)

      setSlaData((prev) => {
        const newSlaData = { ...prev }

        // Update elapsed times
        if (!ticketDates.firstResponse) {
          newSlaData.tta.elapsed = elapsedHours
          newSlaData.tta.status =
            elapsedHours >= newSlaData.tta.target
              ? "Breached"
              : elapsedHours >= newSlaData.tta.target * 0.8
                ? "Approaching"
                : "OK"
        }

        if (!ticketDates.firstResponse) {
          newSlaData.ttt.elapsed = elapsedHours
          newSlaData.ttt.status =
            elapsedHours >= newSlaData.ttt.target
              ? "Breached"
              : elapsedHours >= newSlaData.ttt.target * 0.8
                ? "Approaching"
                : "OK"
        }

        if (status !== "resolved" && status !== "closed") {
          newSlaData.ttr.elapsed = elapsedHours
          newSlaData.ttr.status =
            elapsedHours >= newSlaData.ttr.target
              ? "Breached"
              : elapsedHours >= newSlaData.ttr.target * 0.8
                ? "Approaching"
                : "OK"
        }

        if (status !== "closed") {
          newSlaData.ttl.elapsed = elapsedHours
          newSlaData.ttl.status =
            elapsedHours >= newSlaData.ttl.target
              ? "Breached"
              : elapsedHours >= newSlaData.ttl.target * 0.8
                ? "Approaching"
                : "OK"
        }

        return newSlaData
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [ticketDates, status])

  const addHistoryEntry = (action: string, details: string) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date(),
      user: "Current User",
    }
    setHistory((prev) => [newEntry, ...prev])
  }

  const handleSavePeople = () => {
    const changes = []
    if (formData.contactEmails !== editPeopleData.contactEmails)
      changes.push(`Contact Emails: ${formData.contactEmails} → ${editPeopleData.contactEmails}`)
    if (assignedTeam !== editPeopleData.team)
      changes.push(`Team: ${assignedTeam || "Unassigned"} → ${editPeopleData.team}`)
    if (assignedUser !== editPeopleData.assignee)
      changes.push(`Assignee: ${assignedUser || "Unassigned"} → ${editPeopleData.assignee}`)

    // Update the actual data
    Object.assign(formData, { contactEmails: editPeopleData.contactEmails })
    setAssignedTeam(editPeopleData.team)
    setAssignedUser(editPeopleData.assignee)

    // Always set updated date when saving edits
    const now = new Date()
    setTicketDates((prev) => ({ ...prev, updated: now }))

    if (changes.length > 0) {
      addHistoryEntry("People updated", `Fields updated: ${changes.join(", ")}`)
    }

    setIsEditingPeople(false)
  }

  const handleStatusChange = (newStatus: string) => {
    const now = new Date()
    const updatedDates = { ...ticketDates, updated: now }
    const oldStatus = status

    switch (newStatus) {
      case "resolved":
        updatedDates.resolved = now
        addHistoryEntry("Status changed", `Status changed from ${oldStatus} to resolved`)
        break
      case "closed":
        if (status !== "closed") {
          setShowCloseModal(true)
          return // Don't update status yet, wait for modal
        }
        updatedDates.closed = now
        addHistoryEntry("Status changed", `Status changed from ${oldStatus} to closed`)
        break
      case "open":
        // Remove resolved/closed dates if reopening
        updatedDates.resolved = undefined
        updatedDates.closed = undefined
        if (oldStatus === "closed" || oldStatus === "resolved") {
          setSlaData((prev) => ({ ...prev, reopenCount: prev.reopenCount + 1 }))
          addHistoryEntry("Ticket reopened", `Ticket reopened from ${oldStatus} status`)
        }
        break
      case "waiting-customer-response":
        addHistoryEntry("Status changed", `Status changed from ${oldStatus} to waiting customer response`)
        break
    }

    setTicketDates(updatedDates)
    setStatus(newStatus)
  }

  const handleCloseTicket = () => {
    const now = new Date()
    setTicketDates((prev) => ({ ...prev, updated: now, closed: now }))
    setStatus("closed")
    addHistoryEntry("Ticket closed", `Ticket closed with reason: ${closeReason}`)
    setShowCloseModal(false)
    setShowCloseConfirmation(true) // Show confirmation dialog after closing
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setNewCommentAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setNewCommentAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddComment = () => {
    if (newComment.trim() || newCommentAttachments.length > 0) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "Current User",
        content: newComment.trim(),
        timestamp: new Date(),
        userType,
        attachments: newCommentAttachments.length > 0 ? [...newCommentAttachments] : undefined,
        parentId: replyingTo || undefined,
      }

      if (replyingTo) {
        // Add as reply
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyingTo) {
              return {
                ...c,
                replies: [...(c.replies || []), comment],
              }
            }
            return c
          }),
        )
      } else {
        // Add as new comment
        setComments((prev) => [comment, ...prev])
      }

      setNewComment("")
      setNewCommentAttachments([])
      setReplyingTo(null)

      // Set first response time if this is the first comment
      if (!ticketDates.firstResponse) {
        setTicketDates((prev) => ({ ...prev, firstResponse: new Date() }))
        addHistoryEntry("First response", "First response provided")
      }

      addHistoryEntry(
        replyingTo ? "Reply added" : "Comment added",
        `${replyingTo ? "Reply" : "Comment"} added: ${newComment.substring(0, 50)}${
          newComment.length > 50 ? "..." : ""
        }`,
      )
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`
    } else {
      return `${Math.round((hours / 24) * 10) / 10}d`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500 hover:bg-green-600"
      case "closed":
        return "bg-gray-500 hover:bg-gray-600"
      case "resolved":
        return "bg-blue-500 hover:bg-blue-600"
      case "waiting-customer-response":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-green-500 hover:bg-green-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "closed":
        return "Closed"
      case "resolved":
        return "Resolved"
      case "waiting-customer-response":
        return "Waiting Customer Response"
      default:
        return "Open"
    }
  }

  const getSLAStatusColor = (status: "OK" | "Approaching" | "Breached") => {
    switch (status) {
      case "OK":
        return "text-green-600 bg-green-50"
      case "Approaching":
        return "text-yellow-600 bg-yellow-50"
      case "Breached":
        return "text-red-600 bg-red-50"
    }
  }

  const handleSaveEdit = () => {
    // Update the form data with edited values
    const changes = []
    if (formData.priority !== editFormData.priority)
      changes.push(`Priority: ${formData.priority} → ${editFormData.priority}`)
    if (formData.issueCategory !== editFormData.issueCategory)
      changes.push(`Issue Category: ${formData.issueCategory} → ${editFormData.issueCategory}`)
    if (formData.description !== editFormData.description) changes.push("Description updated")
    if (formData.providerNameId !== editFormData.providerNameId)
      changes.push(`Provider Name/ID: ${formData.providerNameId} → ${editFormData.providerNameId}`)
    if (formData.issueImpact !== editFormData.issueImpact)
      changes.push(`Issue Impact: ${formData.issueImpact} → ${editFormData.issueImpact}`)

    Object.assign(formData, editFormData)

    // Always set updated date when saving edits
    const now = new Date()
    setTicketDates((prev) => ({ ...prev, updated: now }))

    if (changes.length > 0) {
      addHistoryEntry("Ticket updated", `Fields updated: ${changes.join(", ")}`)
    }

    setIsEditing(false)
  }

  // Filter comments based on user type
  const visibleComments = comments.filter((comment) => {
    // If user is internal, show all comments
    if (userType === "internal") return true
    // If user is external, only show external comments
    return comment.userType === "external"
  })

  // Format contact emails for display
  const formatContactEmails = (emails: string) => {
    if (!emails) return "-"
    return emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)
      .join(", ")
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-2" : ""}`}>
      <div className="border-l-4 border-blue-200 pl-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{comment.author}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                comment.userType === "internal" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
              }`}
            >
              {comment.userType}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs px-2 py-1 h-auto"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {comment.attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                <Paperclip className="h-3 w-3" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {comment.replies &&
        comment.replies.map((reply) => {
          // Filter replies based on user type
          if (userType === "external" && reply.userType === "internal") return null
          return renderComment(reply, true)
        })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <h1 className="text-xl font-bold">UTS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <HelpCircle className="h-5 w-5 text-gray-500" />
            <Bell className="h-5 w-5 text-gray-500" />
            <Settings className="h-5 w-5 text-gray-500" />

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setUserType("internal")}
                  className={userType === "internal" ? "bg-blue-50" : ""}
                >
                  Internal user
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setUserType("external")}
                  className={userType === "external" ? "bg-blue-50" : ""}
                >
                  External user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Ticket Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">{ticketId}</h2>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-4">
            {userType === "internal" && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                {isEditing && (
                  <Button onClick={handleSaveEdit} className="ml-2">
                    Save
                  </Button>
                )}
                <Select
                  onValueChange={(value) => {
                    /* handle other actions */
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>Actions</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refresh-credentials">Refresh customer credentials</SelectItem>
                    <SelectItem value="create-known-issue">Create Known Issue</SelectItem>
                    <SelectItem value="find-similar">Find similar (Partner ID, Script)</SelectItem>
                    <SelectItem value="add-tag">Add Tag</SelectItem>
                    <SelectItem value="share">Share</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className={`w-48 text-white ${getStatusColor(status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{status === "closed" || status === "resolved" ? "Reopen" : "Open"}</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="waiting-customer-response">Waiting Customer Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold mb-4">Details</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-priority">Priority</Label>
                        <Select
                          value={editFormData.priority}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-issue-category">Issue Category</Label>
                        <Select
                          value={editFormData.issueCategory}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, issueCategory: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oauth">oAuth</SelectItem>
                            <SelectItem value="user-actionable">User Actionable</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-provider-name-id">Provider Name/ID</Label>
                        <Input
                          id="edit-provider-name-id"
                          value={editFormData.providerNameId}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, providerNameId: e.target.value }))}
                          placeholder="Enter provider name or ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-vertical">Vertical</Label>
                        <Select
                          value={editFormData.vertical}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, vertical: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vertical" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="banking">Banking</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="tax">Tax</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-channel-id">Channel ID</Label>
                        <Input
                          id="edit-channel-id"
                          value={editFormData.channelId}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, channelId: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-channel-type">Channel Type</Label>
                        <Select
                          value={editFormData.channelType}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, channelType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="screen-scraping">Screen Scraping</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="ofx">OFX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-script-name">Script Name</Label>
                        <Input
                          id="edit-script-name"
                          value={editFormData.scriptName}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, scriptName: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-error-code">Error Code</Label>
                        <Select
                          value={editFormData.errorCode}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, errorCode: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select error code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="101">101</SelectItem>
                            <SelectItem value="103">103</SelectItem>
                            <SelectItem value="105">105</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-issue-impact">Issue Impact</Label>
                        <Select
                          value={editFormData.issueImpact}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, issueImpact: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue impact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1 to 10 customers</SelectItem>
                            <SelectItem value="10-100">10 to 100</SelectItem>
                            <SelectItem value="100-500">100-500</SelectItem>
                            <SelectItem value="500+">500+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-sm font-medium">Source:</span>
                      <span className="ml-2 capitalize">{formData.source}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Case Origin:</span>
                      <span className="ml-2 capitalize">{formData.caseOrigin || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Issue Type:</span>
                      <span className="ml-2">{formData.issueCategory || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Priority:</span>
                      <span className="ml-2 capitalize">{formData.priority || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Provider Name/ID:</span>
                      <span className="ml-2">{formData.providerNameId || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Offering:</span>
                      <span className="ml-2">{formData.products.join(", ") || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Vertical:</span>
                      <span className="ml-2 capitalize">{formData.vertical || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Partner ID/Name:</span>
                      <span className="ml-2">-</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Channel ID:</span>
                      <span className="ml-2">{formData.channelId || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Channel Type:</span>
                      <span className="ml-2">{formData.channelType || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Script Name:</span>
                      <span className="ml-2">{formData.scriptName || "-"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium">Error code:</span>
                      <span className="ml-2">{formData.errorCode || "-"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Issue Impact:</span>
                      <span className="ml-2">{formData.issueImpact || "-"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold mb-4">Description:</h3>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                      placeholder="Enter description"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{formData.description || "No description provided"}</p>
                )}
              </CardContent>
            </Card>

            {/* Reporter Notes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold mb-4">Reporter Notes:</h3>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={editFormData.reporterNotes}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, reporterNotes: e.target.value }))}
                      className="min-h-[80px]"
                      placeholder="Enter reporter notes"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{formData.reporterNotes || "No reporter notes provided"}</p>
                )}
              </CardContent>
            </Card>

            {/* Attachments - Much Smaller */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-base font-semibold mb-2">Attachments:</h3>
                {formData.attachments.length > 0 ? (
                  <div className="space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs bg-gray-50 p-1 rounded">
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500 text-xs">
                    <Upload className="mx-auto h-4 w-4 mb-1" />
                    <p>
                      Drop files or <span className="text-blue-600 underline cursor-pointer">browse</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* People */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">People</h3>
                  {userType === "internal" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isEditingPeople) {
                          setEditPeopleData({
                            contactEmails: formData.contactEmails,
                            team: assignedTeam,
                            assignee: assignedUser,
                          })
                          setIsEditingPeople(false)
                        } else {
                          setEditPeopleData({
                            contactEmails: formData.contactEmails,
                            team: assignedTeam,
                            assignee: assignedUser,
                          })
                          setIsEditingPeople(true)
                        }
                      }}
                    >
                      {isEditingPeople ? "Cancel" : <Edit className="h-4 w-4" />}
                    </Button>
                  )}
                  {isEditingPeople && (
                    <Button onClick={handleSavePeople} size="sm" className="ml-2">
                      Save
                    </Button>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-sm font-medium">Reporter:</span>
                    <span className="ml-2">{formData.reporter || "-"}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Contact Emails:</span>
                    {isEditingPeople ? (
                      <Input
                        value={editPeopleData.contactEmails}
                        onChange={(e) => setEditPeopleData((prev) => ({ ...prev, contactEmails: e.target.value }))}
                        placeholder="Enter multiple emails separated by commas"
                        className="mt-1"
                      />
                    ) : (
                      <span className="ml-2">{formatContactEmails(formData.contactEmails)}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Team:</span>
                    {isEditingPeople ? (
                      <Select
                        value={editPeopleData.team}
                        onValueChange={(value) => setEditPeopleData((prev) => ({ ...prev, team: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a team..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="ml-2">{assignedTeam || "-"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Assignee:</span>
                    {isEditingPeople ? (
                      <Select
                        value={editPeopleData.assignee}
                        onValueChange={(value) => setEditPeopleData((prev) => ({ ...prev, assignee: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user} value={user}>
                              {user}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="ml-2">{assignedUser || "-"}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scores */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold mb-4">Scores</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Priority:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        priorityScore === "P0"
                          ? "bg-red-100 text-red-800"
                          : priorityScore === "P1"
                            ? "bg-orange-100 text-orange-800"
                            : priorityScore === "P2"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {priorityScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Customer Satisfaction:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customerSatisfaction <= 2
                          ? "bg-red-100 text-red-800"
                          : customerSatisfaction === 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customerSatisfaction}/5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold mb-4">Dates:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span>{formatDate(ticketDates.created)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Updated:</span>
                    <span>{ticketDates.updated ? formatDate(ticketDates.updated) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Resolved:</span>
                    <span>{ticketDates.resolved ? formatDate(ticketDates.resolved) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Closed:</span>
                    <span>{ticketDates.closed ? formatDate(ticketDates.closed) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date of first response:</span>
                    <span>{ticketDates.firstResponse ? formatDate(ticketDates.firstResponse) : "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="rca" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="rca">RCA</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="resolution">Resolution</TabsTrigger>
              <TabsTrigger value="sla">SLA</TabsTrigger>
            </TabsList>
            <TabsContent value="rca" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-sm font-medium">Summary:</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Classification:</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Known Issue/s:</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Jira Ticket/s:</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Linked Cases:</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="new-comment">
                        {replyingTo ? "Add Reply" : "Add Comment"}
                        {replyingTo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                            className="ml-2 text-xs px-2 py-1 h-auto"
                          >
                            Cancel Reply
                          </Button>
                        )}
                      </Label>
                      <div className="flex space-x-2">
                        <Textarea
                          id="new-comment"
                          placeholder={replyingTo ? "Enter your reply..." : "Enter your comment..."}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          rows={3}
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() && newCommentAttachments.length === 0}
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Attachment Upload */}
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor="comment-file-upload"
                          className="cursor-pointer flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-500"
                        >
                          <Paperclip className="h-4 w-4" />
                          <span>Attach files</span>
                        </Label>
                        <Input
                          id="comment-file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>

                      {/* Show attached files */}
                      {newCommentAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newCommentAttachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              <Paperclip className="h-3 w-3" />
                              <span>{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="h-auto p-0 ml-1"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Posting as:</span>
                        <span
                          className={`px-2 py-0.5 rounded ${
                            userType === "internal" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {userType === "internal" ? "Internal" : "External"}
                        </span>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {visibleComments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet.</p>
                      ) : (
                        visibleComments.map((comment) => renderComment(comment))
                      )}
                      {userType === "external" && comments.length > visibleComments.length && (
                        <div className="text-center text-xs text-gray-500 py-2 bg-gray-50 rounded">
                          Some comments are only visible to internal users
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="border-l-4 border-gray-200 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{entry.action}</span>
                          <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        <p className="text-xs text-gray-500">by {entry.user}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resolution" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {status === "closed" ? (
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold">Resolution Details</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <Label className="font-medium">Reason for closing:</Label>
                        <p className="text-sm text-gray-700 mt-2">{closeReason}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Closed on: {ticketDates.closed ? formatDate(ticketDates.closed) : "-"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Resolution details will be displayed when the ticket is closed.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sla" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold mb-4">SLA Timers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">TTA (Time to Acknowledge):</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSLAStatusColor(slaData.tta.status)}`}>
                              {slaData.tta.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(slaData.tta.elapsed)} / {formatDuration(slaData.tta.target)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">TTT (Time to Touch):</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSLAStatusColor(slaData.ttt.status)}`}>
                              {slaData.ttt.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(slaData.ttt.elapsed)} / {formatDuration(slaData.ttt.target)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">TTR (Time to Resolve):</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSLAStatusColor(slaData.ttr.status)}`}>
                              {slaData.ttr.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(slaData.ttr.elapsed)} / {formatDuration(slaData.ttr.target)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">TTL (Time to Live):</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSLAStatusColor(slaData.ttl.status)}`}>
                              {slaData.ttl.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(slaData.ttl.elapsed)} / {formatDuration(slaData.ttl.target)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold mb-4">Additional Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Reopen Count:</span>
                          <span className="text-sm">{slaData.reopenCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm">{formatDate(ticketDates.created)}</span>
                        </div>
                        {ticketDates.firstResponse && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">First Response:</span>
                            <span className="text-sm">{formatDate(ticketDates.firstResponse)}</span>
                          </div>
                        )}
                        {ticketDates.resolved && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Resolved:</span>
                            <span className="text-sm">{formatDate(ticketDates.resolved)}</span>
                          </div>
                        )}
                        {ticketDates.closed && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Closed:</span>
                            <span className="text-sm">{formatDate(ticketDates.closed)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={onBackToForm}>
            Back to Form
          </Button>
        </div>
      </div>

      {/* Close Ticket Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="close-reason">Reason for closing</Label>
              <Textarea
                id="close-reason"
                placeholder="Enter reason for closing this ticket..."
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloseTicket} disabled={!closeReason.trim()}>
              Close Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <DialogContent className="sm:max-w-md">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {ticketId} closed. Reporter and contacts will be notified.
            </AlertDescription>
          </Alert>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowCloseConfirmation(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
