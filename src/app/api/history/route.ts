import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { data: generations, error } = await supabase
    .from('generations')
    .select(`
      id,
      type,
      status,
      style_preset,
      room_type,
      created_at,
      completed_at,
      generated_output_images (
        id,
        storage_path
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }

  type GenerationRow = NonNullable<typeof generations>[number]

  // Generate signed URLs for output images
  const withUrls = await Promise.all(
    (generations ?? []).map(async (gen: GenerationRow) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputs = (gen as any).generated_output_images as Array<{ id: string; storage_path: string }> | undefined
      const output = outputs?.[0]
      let outputImageUrl: string | null = null

      if (output?.storage_path) {
        const { data } = await supabase.storage
          .from('stageai-assets')
          .createSignedUrl(output.storage_path, 3600)
        outputImageUrl = data?.signedUrl ?? null
      }

      const { ...rest } = gen as Record<string, unknown>
      return { ...rest, output_image_url: outputImageUrl }
    })
  )

  return NextResponse.json({ generations: withUrls })
}
