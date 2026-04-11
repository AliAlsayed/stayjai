'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  imageUrl: string
  onMaskReady: (blob: Blob) => void
}

export function MaskCanvas({ imageUrl, onMaskReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [brushSize, setBrushSize] = useState(30)
  const [erasing, setErasing] = useState(false)
  const [painting, setPainting] = useState(false)

  // Load base image
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      const overlay = overlayRef.current
      if (overlay) {
        overlay.width = img.naturalWidth
        overlay.height = img.naturalHeight
      }
    }
    img.src = imageUrl
  }, [imageUrl])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  function paint(e: React.MouseEvent | React.TouchEvent) {
    if (!painting) return
    const overlay = overlayRef.current
    if (!overlay) return
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e, overlay)

    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  function exportMask() {
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.toBlob(blob => {
      if (blob) onMaskReady(blob)
    }, 'image/png')
  }

  function clearMask() {
    const overlay = overlayRef.current
    if (!overlay) return
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlay.width, overlay.height)
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-neutral-200">
        <canvas ref={canvasRef} className="w-full block" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ opacity: 0.6 }}
          onMouseDown={() => setPainting(true)}
          onMouseUp={() => setPainting(false)}
          onMouseMove={paint}
          onTouchStart={() => setPainting(true)}
          onTouchEnd={() => setPainting(false)}
          onTouchMove={paint}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-neutral-500 flex items-center gap-1.5">
          Brush
          <input
            type="range"
            min={10}
            max={80}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
          <span>{brushSize}px</span>
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setErasing(e => !e)}
          className={erasing ? 'bg-neutral-100' : ''}
        >
          {erasing ? 'Erasing' : 'Drawing'}
        </Button>

        <Button variant="ghost" size="sm" onClick={clearMask}>
          Clear
        </Button>

        <Button size="sm" onClick={exportMask} className="ml-auto">
          Apply mask
        </Button>
      </div>
    </div>
  )
}
