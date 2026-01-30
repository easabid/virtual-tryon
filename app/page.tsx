import Link from 'next/link'
import { Sparkles, Upload, ShoppingBag, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VirtualTryOn</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Try On Dresses with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {' '}AI Magic
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your photo, choose from hundreds of dresses, and see how they look on you
            instantly with our AI-powered virtual try-on technology.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
            >
              Get Started Free
              <Zap className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-900 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium border-2 border-gray-200"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Your Photo</h3>
            <p className="text-gray-600">
              Simply upload a clear photo of yourself and let our AI do the magic.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Dresses</h3>
            <p className="text-gray-600">
              Explore our extensive catalog of dresses in various styles, colors, and sizes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">See Instant Results</h3>
            <p className="text-gray-600">
              Get realistic try-on results in seconds and save your favorites.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 VirtualTryOn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
