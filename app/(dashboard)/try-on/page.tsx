'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Database } from '@/lib/types/database.types'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Dress = Database['public']['Tables']['dresses']['Row']
type UserPhoto = Database['public']['Tables']['user_photos']['Row']

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function TryOnPage() {
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null)
  const [dresses, setDresses] = useState<Dress[]>([])
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const preselectedDressId = searchParams.get('dress')

  useEffect(() => {
    fetchUserPhotos()
    fetchDresses()
  }, [])

  useEffect(() => {
    if (preselectedDressId && dresses.length > 0) {
      const dress = dresses.find((d) => d.id === preselectedDressId)
      if (dress) setSelectedDress(dress)
    }
  }, [preselectedDressId, dresses])

  const fetchUserPhotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const fetchDresses = async () => {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select('*')
        .eq('is_visible', true)
        .order('is_featured', { ascending: false })
        .limit(20)

      if (error) throw error
      setDresses(data || [])
    } catch (error) {
      console.error('Error fetching dresses:', error)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB'
    }
    return null
  }

  const uploadPhoto = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName)

      // Save to database
      const { data: photoData, error: dbError } = await supabase
        .from('user_photos')
        .insert([{
          user_id: user.id,
          photo_url: publicUrl,
        }])
        .select()
        .single()

      if (dbError) throw dbError

      setUserPhotos([photoData, ...userPhotos])
      setSelectedPhoto(photoData)
      alert('Photo uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadPhoto(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadPhoto(e.target.files[0])
    }
  }

  const handleTryOn = async () => {
    if (!selectedPhoto || !selectedDress) {
      alert('Please select both a photo and a dress')
      return
    }

    setProcessing(true)
    setResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Call AI API (Hugging Face)
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: selectedPhoto.photo_url,
          dressUrl: selectedDress.image_url,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Try-on processing failed')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setResult(data.resultUrl)

      // Save to history
      await supabase.from('try_on_sessions').insert([{
        user_id: user.id,
        dress_id: selectedDress.id,
        user_photo_id: selectedPhoto.id,
        result_url: data.resultUrl,
        status: 'completed',
      }])

      alert('Try-on complete! Check your history to view results.')
    } catch (error: any) {
      console.error('Try-on error:', error)
      alert(error.message || 'Failed to process try-on')
    } finally {
      setProcessing(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return

    try {
      const { error } = await supabase
        .from('user_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      setUserPhotos(userPhotos.filter((p) => p.id !== photoId))
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete photo')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
        <p className="text-gray-600 mt-2">
          Upload your photo, select a dress, and see how it looks on you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Photo Selection */}
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 1: Your Photo
            </h2>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="py-4">
                  <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    Drop your photo here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse (Max 5MB, JPEG/PNG/WebP)
                  </p>
                  <label
                    htmlFor="photo-upload"
                    className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            {/* Saved Photos */}
            {userPhotos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Your Photos ({userPhotos.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {userPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedPhoto?.id === photo.id
                          ? 'border-purple-600 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.photo_url}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePhoto(photo.id)
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dress Selection */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Step 2: Choose Dress
              </h2>
              <Link
                href="/dresses"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Browse All
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {dresses.map((dress) => (
                <div
                  key={dress.id}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedDress?.id === dress.id
                      ? 'border-purple-600 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedDress(dress)}
                >
                  <img
                    src={dress.image_url}
                    alt={dress.name}
                    className="w-full h-full object-cover"
                  />
                  {dress.is_featured && (
                    <div className="absolute top-1 left-1 bg-yellow-400 p-1 rounded">
                      <Sparkles className="h-3 w-3 text-yellow-900" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 3: Generate Result
            </h2>

            {/* Preview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Photo</p>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {selectedPhoto ? (
                    <img
                      src={selectedPhoto.photo_url}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Dress</p>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {selectedDress ? (
                    <img
                      src={selectedDress.image_url}
                      alt={selectedDress.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTryOn}
              disabled={!selectedPhoto || !selectedDress || processing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Try-On
                </>
              )}
            </button>

            {!selectedPhoto && !selectedDress && (
              <p className="text-sm text-gray-500 text-center mt-3">
                Select a photo and dress to continue
              </p>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Result
              </h3>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={result}
                  alt="Try-on result"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/history"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-center hover:bg-purple-700"
                >
                  View History
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
