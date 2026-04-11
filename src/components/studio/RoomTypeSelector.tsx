'use client'

import { ROOM_TYPE_LABELS, type RoomType } from '@/types'

interface Props {
  value: RoomType | null
  onChange: (value: RoomType) => void
}

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[]

export function RoomTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROOM_TYPES.map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors
            ${value === type
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
            }`}
        >
          {ROOM_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
