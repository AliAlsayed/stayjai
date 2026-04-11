import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('project_id') as string | null
    const guestSessionId = formData.get('guest_session_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 422 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20 MB.' },
        { status: 422 }
      )
    }

    const supabase = await createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const imageId = uuidv4()
    const folder = userId ?? `guest_${guestSessionId ?? 'anon'}`
    const storagePath = `uploads/${folder}/${imageId}.${file.type.split('/')[1]}`

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('stageai-assets')
      .upload(storagePath, bytes, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    const { data: record, error: dbError } = await supabase
      .from('uploaded_images')
      .insert({
        id: imageId,
        project_id: projectId!,
        user_id: userId,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select('id, storage_path')
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 })
    }

    return NextResponse.json({ image_id: record.id, storage_path: record.storage_path })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
