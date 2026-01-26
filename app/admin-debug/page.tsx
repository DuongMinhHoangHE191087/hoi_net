'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function AdminDebugPage() {
  const { user, loading, isAdmin } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [apiResult, setApiResult] = useState<any>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[DEBUG] ${message}`)
  }

  const testAuth = async () => {
    addLog('=== Testing Auth ===')
    addLog(`User: ${user?.email || 'null'}`)
    addLog(`isAdmin: ${isAdmin}`)
    addLog(`Auth loading: ${loading}`)

    if (!user) {
      addLog('❌ No user logged in')
      return
    }

    // Get session
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    addLog(`Session exists: ${!!session}`)
    addLog(`Access token: ${session?.access_token ? session.access_token.substring(0, 20) + '...' : 'null'}`)
  }

  const testAPI = async () => {
    addLog('=== Testing API ===')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        addLog('❌ No access token found')
        return
      }

      addLog('Calling /api/admin/analytics...')
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      addLog(`Response status: ${response.status}`)
      addLog(`Response status text: ${response.statusText}`)

      const text = await response.text()
      addLog(`Response text length: ${text.length}`)

      try {
        const json = JSON.parse(text)
        addLog('✅ JSON parsed successfully')
        setApiResult(json)

        if (response.ok) {
          addLog('✅ API call successful!')
        } else {
          addLog(`❌ API error: ${json.error || json.message}`)
        }
      } catch (e) {
        addLog(`❌ Failed to parse JSON: ${text.substring(0, 100)}`)
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`)
      addLog(`Stack: ${error.stack}`)
    }
  }

  const testDirectSupabase = async () => {
    addLog('=== Testing Direct Supabase ===')
    try {
      const { supabase } = await import('@/lib/supabase')

      addLog('Testing user_profiles query...')
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      if (error) {
        addLog(`❌ Supabase error: ${error.message}`)
      } else {
        addLog(`✅ Query successful! Count: ${count}`)
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin API Debug Tool</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Current User</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Email: <span className="text-blue-600">{user?.email || 'Not logged in'}</span></div>
            <div>Is Admin: <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{isAdmin ? 'Yes' : 'No'}</span></div>
            <div>Auth Loading: <span className="text-gray-600">{loading ? 'Yes' : 'No'}</span></div>
            <div>User ID: <span className="text-gray-600">{user?.id || 'null'}</span></div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tests</h2>
          <div className="flex gap-4">
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Auth
            </button>
            <button
              onClick={testAPI}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test API Call
            </button>
            <button
              onClick={testDirectSupabase}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Supabase Direct
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click a test button above.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* API Result */}
        {apiResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">API Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

