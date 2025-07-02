"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Table, Loader2, AlertTriangle } from "lucide-react"

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/db-test")

      // Always try to read the body safely
      const isJson = res.headers.get("content-type")?.includes("application/json")

      if (!res.ok) {
        const errorText = isJson ? (await res.json()).message : await res.text()
        throw new Error(`Request failed – ${res.status} ${res.statusText}: ${errorText}`)
      }

      let result: any
      try {
        result = await res.json()
      } catch {
        // Non-JSON response (should only happen on error)
        result = {
          connection: { success: false, message: await res.text() },
          tables: { success: false, tables: [], message: "No JSON body returned" },
          tableCheck: { success: false, missingTables: [], message: "No JSON body returned" },
        }
      }

      setTestResult(result)
    } catch (error) {
      console.error("runTest error:", error)
      setTestResult({
        connection: { success: false, message: (error as Error).message },
        tables: { success: false, tables: [], message: "Could not fetch tables" },
        tableCheck: { success: false, missingTables: [], message: "Could not check tables" },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Connection Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Database Connection
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            {/* Connection Test Result */}
            <Alert
              className={testResult.connection.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              {testResult.connection.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.connection.success ? "text-green-800" : "text-red-800"}>
                <strong>Connection Test:</strong> {testResult.connection.message}
              </AlertDescription>
            </Alert>

            {/* Table Check Result */}
            {testResult.tableCheck && (
              <Alert
                className={
                  testResult.tableCheck.success ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                }
              >
                {testResult.tableCheck.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription className={testResult.tableCheck.success ? "text-green-800" : "text-yellow-800"}>
                  <div className="space-y-2">
                    <div>
                      <strong>Required Tables:</strong> {testResult.tableCheck.message}
                    </div>
                    {!testResult.tableCheck.success && testResult.tableCheck.missingTables.length > 0 && (
                      <div>
                        <strong>Missing:</strong> {testResult.tableCheck.missingTables.join(", ")}
                        <div className="mt-2 text-sm">
                          Please run the SQL setup scripts to create the missing tables.
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Tables Information */}
            <Alert className={testResult.tables.success ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}>
              <Table className={`h-4 w-4 ${testResult.tables.success ? "text-blue-600" : "text-red-600"}`} />
              <AlertDescription className={testResult.tables.success ? "text-blue-800" : "text-red-800"}>
                <div className="space-y-2">
                  <div>
                    <strong>All Tables:</strong> {testResult.tables.message}
                  </div>
                  {testResult.tables.success && testResult.tables.tables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {testResult.tables.tables.map((table: string) => (
                        <Badge key={table} variant="secondary" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Environment Info */}
            <Alert className="border-gray-200 bg-gray-50">
              <AlertDescription className="text-gray-800">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Environment:</strong> {process.env.NODE_ENV || "development"}
                  </div>
                  <div>
                    <strong>Database URL:</strong> {process.env.DATABASE_URL ? "✓ Configured" : "✗ Not configured"}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {testResult.timestamp || new Date().toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
