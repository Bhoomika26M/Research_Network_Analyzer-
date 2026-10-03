import { useEffect, ReactNode } from 'react'

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  label: string
  onSubmit: () => void
  submitLabel?: string
  children: ReactNode
}

export default function FormModal({
  open,
  onClose,
  title,
  label,
  onSubmit,
  submitLabel = 'Save',
  children,
}: FormModalProps) {
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Card */}
        <div className="fm-card bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-2">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">{label}</span>
              </span>
              <h2 className="font-display text-xl text-[#0F172A]">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors text-[#64748B] hover:text-[#0F172A] flex-shrink-0 mt-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Input className helper — export so forms can use it
export const inputCls =
  'px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors w-full'

// Tag input component
import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: TagInputProps) {
  const [inputVal, setInputVal] = useState('')

  const addTag = (raw: string) => {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    const next = [...tags]
    parts.forEach(p => { if (!next.includes(p)) next.push(p) })
    onChange(next)
    setInputVal('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputVal)
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl focus-within:border-[#0052FF] transition-colors">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs rounded-xl px-2.5 py-1 font-medium">
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            className="ml-0.5 hover:text-blue-900 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </span>
      ))}
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (inputVal.trim()) addTag(inputVal) }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
      />
    </div>
  )
}
