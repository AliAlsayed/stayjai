import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCreditBalance, insertCreditTransaction } from '@/lib/credits/ledger'
import { generateInpainting } from '@/lib/nano-banana/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  let generationId: string | null = null
  let userId: string | null = null
  let guestSessionId: string | null = null

  try {
    const formData = await req.formData()
    const sourceGenerationId = formData.get('source_generation_id') as string
    const maskBlob = formData.get('mask') as File
    const instruction = formData.get('instruction') as string
    guestSessionId = formData.get('guest_session_id') as string | null

    if (!sourceGenerationId || !maskBlob || !instruction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null

    // Verify ownership of source generation
    const { data: sourceGen } = await supabase
      .from('generated_output_images')
      .select('id, storage_path, project_id')
      .eq('generation_id', sourceGenerationId)
      .eq('user_id', userId ?? '')
      .single()

    if (!sourceGen) {
      return NextResponse.json({ error: 'Source generation not found or access denied' }, { status: 404 })
    }

    // Check credits
    const balance = await getCreditBalance({ userId: userId ?? undefined, guestSessionId: guestSessionId ?? undefined })

    if (balance <= 0) {
      return NextResponse.json({ error: 'Insufficient credits', code: 'NO_CREDITS' }, { status: 402 })
    }

    // Upload mask
    const maskId = uuidv4()
    const maskPath = `masks/${userId ?? `guest_${guestSessionId}`}/${maskId}.png`
    const maskBytes = await maskBlob.arrayBuffer()

    await supabase.storage.from('stageai-assets').upload(maskPath, maskBytes, { contentType: 'image/png' })

    await supabase.from('inpainting_masks').insert({
      id: maskId,
      project_id: sourceGen.project_id,
      user_id: userId,
      source_output_id: sourceGen.id,
      storage_path: maskPath,
      instruction,
    })

    // Create generation record
    generationId = uuidv4()
    await supabase.from('generations').insert({
      id: generationId,
      project_id: sourceGen.project_id,
      user_id: userId,
      type: 'inpainting',
      status: 'pending',
      source_image_id: sourceGen.id,
      mask_id: maskId,
      instruction,
      provider: 'nano_banana',
    })

    // Reserve credit
    await insertCreditTransaction({
      userId: userId ?? undefined,
      guestSessionId: guestSessionId ?? undefined,
      type: 'reserved',
      amount: -1,
      reason: 'inpainting_reserved',
      generationId,
    })

    // Get signed URLs
    const { data: sourceSignedUrl } = await supabase.storage.from('stageai-assets').createSignedUrl(sourceGen.storage_path, 300)
    const { data: maskSignedUrl } = await supabase.storage.from('stageai-assets').createSignedUrl(maskPath, 300)

    if (!sourceSignedUrl?.signedUrl || !maskSignedUrl?.signedUrl) {
      throw new Error('Failed to create signed URLs')
    }

    // Call Nano Banana inpainting
    const result = await generateInpainting({
      sourceImageUrl: sourceSignedUrl.signedUrl,
      maskImageUrl: maskSignedUrl.signedUrl,
      instruction,
    })

    // Upload output
    const outputId = uuidv4()
    const outputPath = `outputs/${userId ?? `guest_${guestSessionId}`}/${outputId}.jpg`

    await supabase.storage.from('stageai-assets').upload(outputPath, result.outputImageBytes!, { contentType: 'image/jpeg' })
    await supabase.from('generated_output_images').insert({ id: outputId, generation_id: generationId, project_id: sourceGen.project_id, user_id: userId, storage_path: outputPath })
    await supabase.from('generations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', generationId)
    await insertCreditTransaction({ userId: userId ?? undefined, guestSessionId: guestSessionId ?? undefined, type: 'generation_success', amount: -1, reason: 'inpainting_completed', generationId })

    const { data: outputSignedUrl } = await supabase.storage.from('stageai-assets').createSignedUrl(outputPath, 3600)

    return NextResponse.json({ generation_id: generationId, output_image_url: outputSignedUrl?.signedUrl })
  } catch (err) {
    if (generationId) {
      try {
        const supabase = await createServiceClient()
        await supabase.from('generations').update({ status: 'failed' }).eq('id', generationId)
        await insertCreditTransaction({ userId: userId ?? undefined, guestSessionId: guestSessionId ?? undefined, type: 'generation_refund', amount: 1, reason: 'inpainting_failed', generationId })
      } catch { /* best-effort */ }
    }
    console.error('[/api/inpaint]', err)
    return NextResponse.json({ error: 'Inpainting failed' }, { status: 500 })
  }
}
