import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: generation, error } = await supabase
    .from('generations')
    .select('id, status, user_id')
    .eq('id', id)
    .single()

  if (error || !generation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Enforce ownership
  if (generation.user_id && generation.user_id !== user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let outputImageUrl: string | undefined

  if (generation.status === 'completed') {
    const { data: output } = await supabase
      .from('generated_output_images')
      .select('storage_path')
      .eq('generation_id', id)
      .single()

    if (output) {
      const { data: signed } = await supabase.storage
        .from('stageai-assets')
        .createSignedUrl(output.storage_path, 3600)
      outputImageUrl = signed?.signedUrl
    }
  }

  return NextResponse.json({
    id: generation.id,
    status: generation.status,
    output_image_url: outputImageUrl,
  })
}
