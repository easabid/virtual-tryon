'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Heart, Sparkles } from 'lucide-react'
import { Database } from '@/lib/types/database.types'
import Link from 'next/link'

type Dress = Database['public']['Tables']['dresses']['Row']

const CATEGORIES = ['All', 'Casual', 'Formal', 'Party', 'Wedding', 'Evening', 'Cocktail']
const COLORS = ['All', 'Red', 'Blue', 'Black', 'White', 'Green', 'Pink', 'Purple', 'Yellow']
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
const ITEMS_PER_PAGE = 12

export default function DressesPage() {
  const [dresses, setDresses] = useState<Dress[]>([])
  const [filteredDresses, setFilteredDresses] = useState<Dress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedColor, setSelectedColor] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    fetchDresses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [dresses, searchTerm, selectedCategory, selectedColor, selectedSize])

  const fetchDresses = async () => {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select('*')
        .eq('is_visible', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setDresses(data || [])
    } catch (error) {
      console.error('Error fetching dresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = dresses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((dress) =>
        dress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dress.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((dress) => dress.category === selectedCategory)
    }

    // Color filter
    if (selectedColor !== 'All') {
      filtered = filtered.filter((dress) => dress.color === selectedColor)
    }

    // Size filter
    if (selectedSize !== 'All') {
      filtered = filtered.filter((dress) => dress.size === selectedSize)
    }

    setFilteredDresses(filtered)
    setCurrentPage(1)
  }

  const toggleFavorite = (dressId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(dressId)) {
        newFavorites.delete(dressId)
      } else {
        newFavorites.add(dressId)
      }
      return newFavorites
    })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedColor('All')
    setSelectedSize('All')
  }

  // Pagination
  const totalPages = Math.ceil(filteredDresses.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentDresses = filteredDresses.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Dresses</h1>
        <p className="text-gray-600 mt-2">
          Choose your favorite dress and try it on virtually
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            {(selectedCategory !== 'All' || selectedColor !== 'All' || selectedSize !== 'All' || searchTerm) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mt-4 space-y-3 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {(selectedCategory !== 'All' || selectedColor !== 'All' || selectedSize !== 'All' || searchTerm) && (
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {currentDresses.length} of {filteredDresses.length} dresses
      </div>

      {/* Dresses Grid */}
      {currentDresses.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 mb-2">No dresses found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentDresses.map((dress) => (
              <div
                key={dress.id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={dress.image_url}
                    alt={dress.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Featured Badge */}
                  {dress.is_featured && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(dress.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:shadow-lg transition-shadow"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(dress.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <Link
                      href={`/try-on?dress=${dress.id}`}
                      className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                      Try On Now
                    </Link>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {dress.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-600 font-medium">
                      {dress.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dress.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {dress.color}
                    </span>
                    {dress.price && dress.price > 0 && (
                      <span className="text-sm font-semibold text-gray-900">
                        ${dress.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
