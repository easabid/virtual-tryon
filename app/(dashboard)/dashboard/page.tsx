import Link from 'next/link'
import { Sparkles, Upload, ShoppingBag, History } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Ready to try on some dresses?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/try-on"
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <Sparkles className="h-8 w-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Start Try-On</h3>
          <p className="text-purple-100">Upload photo & select dress</p>
        </Link>

        <Link
          href="/dresses"
          className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <ShoppingBag className="h-8 w-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Browse Dresses</h3>
          <p className="text-pink-100">Explore our catalog</p>
        </Link>

        <Link
          href="/try-on/upload"
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <Upload className="h-8 w-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Upload Photos</h3>
          <p className="text-blue-100">Manage your photos</p>
        </Link>

        <Link
          href="/history"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <History className="h-8 w-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">View History</h3>
          <p className="text-indigo-100">See past try-ons</p>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-600 mb-1">Total Try-Ons</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-600 mb-1">Favorites</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-600 mb-1">Photos Uploaded</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity yet</p>
          <p className="text-sm mt-2">Start your first try-on to see results here!</p>
        </div>
      </div>
    </div>
  )
}
