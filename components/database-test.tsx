"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Table, Loader2 } from "lucide-react"

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/db-test")
      const result = await res.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        connection: { success: false, message: "Test failed to run" },
        tables: { success: false, tables: [], message: "Could not fetch tables" },
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

            {/* Tables Information */}
            <Alert className={testResult.tables.success ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}>
              <Table className={`h-4 w-4 ${testResult.tables.success ? "text-blue-600" : "text-red-600"}`} />
              <AlertDescription className={testResult.tables.success ? "text-blue-800" : "text-red-800"}>
                <div className="space-y-2">
                  <div>
                    <strong>Tables:</strong> {testResult.tables.message}
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
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
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
