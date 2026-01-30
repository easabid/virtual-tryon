'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Trash2, Download, Eye } from 'lucide-react'
import { Database } from '@/lib/types/database.types'
import Link from 'next/link'

type TryOnSession = Database['public']['Tables']['try_on_sessions']['Row'] & {
  dresses: Database['public']['Tables']['dresses']['Row'] | null
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<TryOnSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('try_on_sessions')
        .select('*, dresses(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this try-on from history?')) return

    try {
      const { error } = await supabase
        .from('try_on_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      setSessions(sessions.filter((s) => s.id !== sessionId))
      alert('Deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete')
    }
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Try-On History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your virtual try-on results
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No try-on history yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Start trying on dresses to see your results here
          </p>
          <Link
            href="/try-on"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Try On Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={session.result_url || session.dresses?.image_url || ''}
                  alt="Try-on result"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage(session.result_url || session.dresses?.image_url || null)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:shadow-lg"
                >
                  <Eye className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {session.dresses?.name || 'Try-On Result'}
                </h3>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(session.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const imageUrl = session.result_url || session.dresses?.image_url
                      if (imageUrl) {
                        downloadImage(imageUrl, `tryon-${session.id}.jpg`)
                      }
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Try-on result"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
