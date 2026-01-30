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

    // MOCK RESULT FOR NOW - Return dress image as placeholder
    // Real AI integration would go here
    console.log('Processing try-on (mock mode)', { photoUrl, dressUrl })
    
    // Use dress image as mock result
    const mockResultUrl = dressUrl
    
    return NextResponse.json({ resultUrl: mockResultUrl })
    
  } catch (error: any) {
    console.error('Try-on API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process try-on' },
      { status: 500 }
    )
  }
}
