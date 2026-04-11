// Server-side only — never import this in client components

const NANO_BANANA_BASE_URL = process.env.NANO_BANANA_BASE_URL ?? 'https://api.nanobanana.io'
const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY!

export interface StagingRequest {
  imageUrl: string
  roomType: string
  stylePreset: string
}

export interface InpaintingRequest {
  sourceImageUrl: string
  maskImageUrl: string
  instruction: string
}

export interface NanoBananaResponse {
  jobId: string
  outputImageBytes?: Buffer
  status: 'completed' | 'failed'
}

export async function generateStaging(req: StagingRequest): Promise<NanoBananaResponse> {
  const response = await fetch(`${NANO_BANANA_BASE_URL}/v1/stage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: req.imageUrl,
      room_type: req.roomType,
      style: req.stylePreset,
    }),
  })

  if (!response.ok) {
    throw new Error(`Nano Banana staging failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const imageResponse = await fetch(data.output_url)
  const outputImageBytes = Buffer.from(await imageResponse.arrayBuffer())

  return {
    jobId: data.job_id,
    outputImageBytes,
    status: 'completed',
  }
}

export async function generateInpainting(req: InpaintingRequest): Promise<NanoBananaResponse> {
  const response = await fetch(`${NANO_BANANA_BASE_URL}/v1/inpaint`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_image_url: req.sourceImageUrl,
      mask_image_url: req.maskImageUrl,
      instruction: req.instruction,
    }),
  })

  if (!response.ok) {
    throw new Error(`Nano Banana inpainting failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const imageResponse = await fetch(data.output_url)
  const outputImageBytes = Buffer.from(await imageResponse.arrayBuffer())

  return {
    jobId: data.job_id,
    outputImageBytes,
    status: 'completed',
  }
}
