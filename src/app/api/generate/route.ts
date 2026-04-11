import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCreditBalance, insertCreditTransaction } from '@/lib/credits/ledger'
import { generateStaging } from '@/lib/nano-banana/client'
import { v4 as uuidv4 } from 'uuid'
import type { RoomType, StylePreset } from '@/types/database'

export async function POST(req: NextRequest) {
  let generationId: string | null = null
  let userId: string | null = null
  let guestSessionId: string | null = null

  try {
    const body = await req.json()
    const { image_id, room_type, style_preset, project_id, guest_session_id } = body as {
      image_id: string
      room_type: RoomType
      style_preset: StylePreset
      project_id: string
      guest_session_id?: string
    }

    if (!image_id || !room_type || !style_preset || !project_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
    guestSessionId = guest_session_id ?? null

    // Check credit balance server-side
    const balance = await getCreditBalance({ userId: userId ?? undefined, guestSessionId: guestSessionId ?? undefined })

    if (balance <= 0) {
      return NextResponse.json({ error: 'Insufficient credits', code: 'NO_CREDITS' }, { status: 402 })
    }

    // Create generation record
    generationId = uuidv4()
    const { error: genError } = await supabase
      .from('generations')
      .insert({
        id: generationId,
        project_id,
        user_id: userId,
        type: 'initial_staging',
        status: 'pending',
        source_image_id: image_id,
        style_preset,
        room_type,
        provider: 'nano_banana',
      })

    if (genError) {
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    // Reserve credit
    await insertCreditTransaction({
      userId: userId ?? undefined,
      guestSessionId: guestSessionId ?? undefined,
      type: 'reserved',
      amount: -1,
      reason: 'generation_reserved',
      generationId,
    })

    // Get signed URL for source image
    const { data: imageRecord } = await supabase
      .from('uploaded_images')
      .select('storage_path')
      .eq('id', image_id)
      .single()

    if (!imageRecord) {
      throw new Error('Source image not found')
    }

    const { data: signedUrl } = await supabase.storage
      .from('stageai-assets')
      .createSignedUrl(imageRecord.storage_path, 300)

    if (!signedUrl?.signedUrl) {
      throw new Error('Failed to create signed URL for source image')
    }

    // Call Nano Banana
    const result = await generateStaging({
      imageUrl: signedUrl.signedUrl,
      roomType: room_type,
      stylePreset: style_preset,
    })

    // Upload output
    const outputId = uuidv4()
    const outputPath = `outputs/${userId ?? `guest_${guestSessionId}`}/${outputId}.jpg`

    const { error: outputUploadError } = await supabase.storage
      .from('stageai-assets')
      .upload(outputPath, result.outputImageBytes!, { contentType: 'image/jpeg' })

    if (outputUploadError) {
      throw new Error('Failed to upload output image')
    }

    // Create output record
    await supabase.from('generated_output_images').insert({
      id: outputId,
      generation_id: generationId,
      project_id,
      user_id: userId,
      storage_path: outputPath,
    })

    // Finalize generation
    await supabase.from('generations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', generationId)

    // Finalize credit deduction
    await insertCreditTransaction({
      userId: userId ?? undefined,
      guestSessionId: guestSessionId ?? undefined,
      type: 'generation_success',
      amount: -1,
      reason: 'generation_completed',
      generationId,
    })

    // Get signed URL for output
    const { data: outputSignedUrl } = await supabase.storage
      .from('stageai-assets')
      .createSignedUrl(outputPath, 3600)

    return NextResponse.json({
      generation_id: generationId,
      output_image_url: outputSignedUrl?.signedUrl,
    })
  } catch (err) {
    // Restore credit on failure
    if (generationId) {
      try {
        const supabase = await createServiceClient()
        await supabase.from('generations').update({ status: 'failed' }).eq('id', generationId)
        await insertCreditTransaction({
          userId: userId ?? undefined,
          guestSessionId: guestSessionId ?? undefined,
          type: 'generation_refund',
          amount: 1,
          reason: 'generation_failed',
          generationId,
        })
      } catch {
        // best-effort restore
      }
    }

    console.error('[/api/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
