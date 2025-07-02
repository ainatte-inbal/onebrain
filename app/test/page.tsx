import DatabaseTest from "../../components/database-test"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Test Page</h1>
          <p className="text-gray-600">Test your database connection and verify table structure</p>
        </div>

        <DatabaseTest />

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Intake Form
          </a>
        </div>
      </div>
    </div>
  )
}
