'use client'

import { STYLE_PRESET_LABELS, type StylePreset } from '@/types'

interface Props {
  value: StylePreset | null
  onChange: (value: StylePreset) => void
}

const STYLE_PRESETS = Object.keys(STYLE_PRESET_LABELS) as StylePreset[]

export function StylePresetSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STYLE_PRESETS.map(preset => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className={`text-sm px-3 py-2.5 rounded-xl border text-left font-medium transition-colors
            ${value === preset
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
            }`}
        >
          {STYLE_PRESET_LABELS[preset]}
        </button>
      ))}
    </div>
  )
}
