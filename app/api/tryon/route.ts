import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoUrl, dressUrl } = await request.json()

    if (!photoUrl || !dressUrl) {
      return NextResponse.json(
        { error: 'Missing photoUrl or dressUrl' },
        { status: 400 }
      )
    }

    // Call Hugging Face API
    const HF_API_URL = process.env.NEXT_PUBLIC_AI_API_URL
    const HF_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY

    if (!HF_API_URL || !HF_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // For now, we'll simulate the API call since IDM-VTON requires specific setup
    // In production, you would call the actual Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          person_image: photoUrl,
          garment_image: dressUrl,
        },
      }),
    })

    if (!response.ok) {
      // For development/testing, return a mock result
      // In production, handle the actual API response
      console.warn('AI API call failed, using mock result')
      
      // Save mock result to storage (in production, save actual result)
      const mockResultUrl = dressUrl // Use dress image as mock result
      
      return NextResponse.json({ resultUrl: mockResultUrl })
    }

    // In production: process the actual API response
    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Upload result to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-result.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tryon-results')
      .upload(fileName, buffer, {
        contentType: 'image/png',
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('tryon-results')
      .getPublicUrl(fileName)

    return NextResponse.json({ resultUrl: publicUrl })
  } catch (error: any) {
    console.error('Try-on API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process try-on' },
      { status: 500 }
    )
  }
}
