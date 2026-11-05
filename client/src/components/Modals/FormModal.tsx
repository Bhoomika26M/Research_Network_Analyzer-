import { useEffect, ReactNode, useState, KeyboardEvent } from 'react'

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Card */}
        <div className="fm-card bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg my-8 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border bg-card">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">{label}</span>
              </span>
              <h2 className="font-display font-bold text-xl text-foreground">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0 mt-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-border bg-muted/20">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Input className helper
export const inputCls =
  'px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full placeholder:text-muted-foreground'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: TagInputProps) {
  const [inputVal, setInputVal] = useState('')

  const addTag = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const next = [...tags]
    parts.forEach((p) => {
      if (!next.includes(p)) next.push(p)
    })
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
    <div className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 bg-background border border-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs rounded-lg px-2.5 py-0.5 font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="ml-0.5 hover:text-red-500 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      <input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => {
          if (inputVal.trim()) addTag(inputVal)
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  )
}

