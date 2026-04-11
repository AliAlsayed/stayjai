'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
        ${dragging ? 'border-neutral-400 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}
        ${preview ? 'border-solid border-transparent' : ''}`}
      style={{ minHeight: 240 }}
      onClick={() => !preview && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Room preview"
          className="w-full object-cover rounded-2xl"
          style={{ maxHeight: 400 }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center select-none">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xl">
            +
          </div>
          <p className="text-sm font-medium text-neutral-700">Upload a room photo</p>
          <p className="text-xs text-neutral-400">JPEG, PNG, or WebP · max 20 MB</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
          >
            Choose file
          </Button>
        </div>
      )}

      {preview && (
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
          onClick={e => { e.stopPropagation(); setPreview(null) }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
