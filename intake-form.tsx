"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, Upload, X, CheckCircle } from "lucide-react"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2 } from "lucide-react"

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

interface IntakeFormProps {
  onTicketCreated: (ticketId: string, contactEmails: string, formData: FormData) => void
}

// Sample provider list for autocomplete
const providers = [
  "Bank of America",
  "Chase",
  "Wells Fargo",
  "Citibank",
  "Capital One",
  "TD Bank",
  "PNC Bank",
  "US Bank",
  "HSBC",
  "Barclays",
]

// Sample reporters list
const reporters = [
  "john.doe@company.com",
  "jane.smith@company.com",
  "mike.johnson@company.com",
  "sarah.wilson@company.com",
  "david.brown@company.com",
  "lisa.davis@company.com",
  "tom.miller@company.com",
  "amy.garcia@company.com",
  "chris.martinez@company.com",
  "jennifer.anderson@company.com",
  "robert.taylor@company.com",
  "michelle.thomas@company.com",
  "kevin.jackson@company.com",
  "laura.white@company.com",
  "daniel.harris@company.com",
  "stephanie.martin@company.com",
  "matthew.thompson@company.com",
  "nicole.garcia@company.com",
  "andrew.martinez@company.com",
  "jessica.robinson@company.com",
  "ryan.clark@company.com",
  "amanda.rodriguez@company.com",
  "brandon.lewis@company.com",
  "melissa.lee@company.com",
  "joshua.walker@company.com",
  "ashley.hall@company.com",
  "justin.allen@company.com",
  "brittany.young@company.com",
  "tyler.hernandez@company.com",
  "samantha.king@company.com",
  "jonathan.wright@company.com",
  "rachel.lopez@company.com",
  "nathan.hill@company.com",
  "megan.scott@company.com",
  "jacob.green@company.com",
  "lauren.adams@company.com",
  "ethan.baker@company.com",
  "hannah.gonzalez@company.com",
  "alexander.nelson@company.com",
  "olivia.carter@company.com",
  "william.mitchell@company.com",
  "sophia.perez@company.com",
  "james.roberts@company.com",
  "emma.turner@company.com",
  "benjamin.phillips@company.com",
  "isabella.campbell@company.com",
  "mason.parker@company.com",
  "ava.evans@company.com",
  "lucas.edwards@company.com",
  "mia.collins@company.com",
]

// Sample error codes list
const errorCodes = [
  "101 - Authentication Failed",
  "102 - Invalid Credentials",
  "103 - Connection Timeout",
  "104 - Server Unavailable",
  "105 - Rate Limit Exceeded",
  "106 - Invalid Request Format",
  "107 - Missing Required Parameters",
  "108 - Unauthorized Access",
  "109 - Resource Not Found",
  "110 - Internal Server Error",
  "201 - Account Locked",
  "202 - Account Suspended",
  "203 - Account Expired",
  "204 - Insufficient Permissions",
  "205 - Account Not Verified",
  "206 - Password Expired",
  "207 - Two-Factor Required",
  "208 - Security Question Failed",
  "209 - Device Not Recognized",
  "210 - Login Attempt Blocked",
  "301 - Data Validation Error",
  "302 - Invalid Date Format",
  "303 - Missing Transaction Data",
  "304 - Duplicate Transaction",
  "305 - Transaction Limit Exceeded",
  "306 - Invalid Account Number",
  "307 - Insufficient Funds",
  "308 - Transaction Declined",
  "309 - Currency Mismatch",
  "310 - Processing Error",
  "401 - Network Connection Failed",
  "402 - SSL Certificate Error",
  "403 - Proxy Authentication Required",
  "404 - DNS Resolution Failed",
  "405 - Connection Refused",
  "406 - Request Timeout",
  "407 - Gateway Timeout",
  "408 - Service Unavailable",
  "409 - Bad Gateway",
  "410 - Network Unreachable",
  "501 - Configuration Error",
  "502 - Database Connection Failed",
  "503 - Cache Error",
  "504 - File System Error",
  "505 - Memory Allocation Error",
  "506 - Thread Pool Exhausted",
  "507 - Queue Overflow",
  "508 - Resource Cleanup Failed",
  "509 - Initialization Error",
  "510 - Shutdown Error",
]

export default function IntakeForm({ onTicketCreated }: IntakeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    reporter: "",
    description: "",
    priority: "",
    issueCategory: "",
    providerNameId: "",
    source: "other",
    products: [],
    caseOrigin: "",
    attachments: [],
    reporterNotes: "",
    contactEmails: "",
    vertical: "",
    errorCode: "",
    channelId: "",
    channelType: "",
    scriptName: "",
    issueImpact: "",
  })
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketId, setTicketId] = useState("")
  const [providerPopoverOpen, setProviderPopoverOpen] = useState(false)
  const [reporterPopoverOpen, setReporterPopoverOpen] = useState(false)
  const [errorCodePopoverOpen, setErrorCodePopoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleProductChange = (product: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, products: [...prev.products, product] }))
    } else {
      setFormData((prev) => ({ ...prev, products: prev.products.filter((p) => p !== product) }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }))
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }))
  }

  const generateTicketId = () => {
    return `TKT-${Date.now().toString().slice(-6)}`
  }

  async function saveTicket(data: any) {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.json()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const result = await saveTicket(formData)

      if (result.success) {
        setTicketId(result.ticketId!)
        setShowSuccess(true)
      } else {
        // Show error message
        alert(`Error creating ticket: ${result.message}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to create ticket. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToTicket = () => {
    onTicketCreated(ticketId, formData.contactEmails, formData)
  }

  if (showSuccess) {
    const emailList = formData.contactEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)

    return (
      <div className="min-h-screen bg-gray-50 py-8 font-sans">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-4">
                <p className="font-semibold">
                  Ticket {ticketId} was created successfully and notification sent to{" "}
                  {emailList.length > 0 ? emailList.join(", ") : "no contact emails provided"}.
                </p>
                <div className="flex justify-end">
                  <Button onClick={handleGoToTicket} className="bg-green-600 hover:bg-green-700">
                    Go to Ticket
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Intake Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Source - Moved to first position */}
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select value={formData.source} disabled>
                      <SelectTrigger className="bg-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="tax">Tax</SelectItem>
                        <SelectItem value="ps">PS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Case Origin - Moved under Source */}
                  <div className="space-y-2">
                    <Label htmlFor="case-origin">Case Origin</Label>
                    <Select
                      value={formData.caseOrigin}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, caseOrigin: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select case origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="voc">VOC</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="proactive">Proactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reporter with search */}
                  <div className="space-y-2">
                    <Label htmlFor="reporter">Reporter *</Label>
                    <Popover open={reporterPopoverOpen} onOpenChange={setReporterPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={reporterPopoverOpen}
                          className="w-full justify-between bg-transparent"
                        >
                          {formData.reporter || "Select reporter..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search reporters..." />
                          <CommandList>
                            <CommandEmpty>No reporter found.</CommandEmpty>
                            <CommandGroup>
                              {reporters.map((reporter) => (
                                <CommandItem
                                  key={reporter}
                                  onSelect={() => {
                                    setFormData((prev) => ({ ...prev, reporter }))
                                    setReporterPopoverOpen(false)
                                  }}
                                >
                                  {reporter}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
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

                  {/* Provider Name/ID - with autocomplete */}
                  <div className="space-y-2">
                    <Label htmlFor="provider-name-id">Provider Name/ID</Label>
                    <Popover open={providerPopoverOpen} onOpenChange={setProviderPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={providerPopoverOpen}
                          className="w-full justify-between bg-transparent"
                        >
                          {formData.providerNameId || "Select provider..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search providers..." />
                          <CommandList>
                            <CommandEmpty>No provider found.</CommandEmpty>
                            <CommandGroup>
                              {providers.map((provider) => (
                                <CommandItem
                                  key={provider}
                                  onSelect={() => {
                                    setFormData((prev) => ({ ...prev, providerNameId: provider }))
                                    setProviderPopoverOpen(false)
                                  }}
                                >
                                  {provider}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Product */}
                  <div className="space-y-2">
                    <Label>Product *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["QB", "TT", "CK", "Quicken"].map((product) => (
                        <div key={product} className="flex items-center space-x-2">
                          <Checkbox
                            id={product}
                            checked={formData.products.includes(product)}
                            onCheckedChange={(checked) => handleProductChange(product, checked as boolean)}
                          />
                          <Label htmlFor={product}>{product}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Emails */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-emails">Contact Emails</Label>
                    <Input
                      id="contact-emails"
                      placeholder="Enter multiple emails separated by commas"
                      value={formData.contactEmails}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactEmails: e.target.value }))}
                    />
                  </div>

                  {/* Reporter Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="reporter-notes">Reporter Notes</Label>
                    <Textarea
                      id="reporter-notes"
                      placeholder="Enter reporter notes"
                      className="min-h-[80px]"
                      value={formData.reporterNotes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reporterNotes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Attachments - Reduced Size */}
              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 text-sm">Click to upload</span>
                      <span className="text-gray-500 text-sm"> or drag and drop</span>
                    </Label>
                    <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </div>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Section */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-0">
                    <span className="font-semibold">Advanced</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Issue Category - Moved to Advanced */}
                      <div className="space-y-2">
                        <Label htmlFor="issue-category">Issue Category</Label>
                        <Select
                          value={formData.issueCategory}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, issueCategory: value }))}
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

                      {/* Vertical */}
                      <div className="space-y-2">
                        <Label htmlFor="vertical">Vertical</Label>
                        <Select
                          value={formData.vertical}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, vertical: value }))}
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

                      {/* Error Code with search */}
                      <div className="space-y-2">
                        <Label htmlFor="error-code">Error Code</Label>
                        <Popover open={errorCodePopoverOpen} onOpenChange={setErrorCodePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={errorCodePopoverOpen}
                              className="w-full justify-between bg-transparent"
                            >
                              {formData.errorCode || "Search and select error code"}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search error codes..." />
                              <CommandList>
                                <CommandEmpty>No error code found.</CommandEmpty>
                                <CommandGroup>
                                  {errorCodes.map((errorCode) => (
                                    <CommandItem
                                      key={errorCode}
                                      onSelect={() => {
                                        setFormData((prev) => ({ ...prev, errorCode }))
                                        setErrorCodePopoverOpen(false)
                                      }}
                                    >
                                      {errorCode}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Channel ID */}
                      <div className="space-y-2">
                        <Label htmlFor="channel-id">Channel ID</Label>
                        <Input
                          id="channel-id"
                          placeholder="Enter channel ID"
                          value={formData.channelId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, channelId: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Channel Type */}
                      <div className="space-y-2">
                        <Label htmlFor="channel-type">Channel Type</Label>
                        <Select
                          value={formData.channelType}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, channelType: value }))}
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

                      {/* Script Name */}
                      <div className="space-y-2">
                        <Label htmlFor="script-name">Script Name</Label>
                        <Input
                          id="script-name"
                          placeholder="Enter script name"
                          value={formData.scriptName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, scriptName: e.target.value }))}
                        />
                      </div>

                      {/* Issue Impact */}
                      <div className="space-y-2">
                        <Label htmlFor="issue-impact">Issue Impact</Label>
                        <Select
                          value={formData.issueImpact}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, issueImpact: value }))}
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
                </CollapsibleContent>
              </Collapsible>

              {/* Submit Button */}
              <div className="pt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
