import { useToastContext } from '../context/ToastContext'
import { ToastType } from '../hooks/useToast'

const icons: Record<ToastType, string> = {
  success: '✓',
  info: 'ℹ',
  error: '✕',
}

const labels: Record<ToastType, string> = {
  success: 'Success',
  info: 'Info',
  error: 'Error',
}

const borders: Record<ToastType, string> = {
  success: 'border-l-4 border-emerald-500',
  info: 'border-l-4 border-[#0052FF]',
  error: 'border-l-4 border-red-500',
}

const labelColors: Record<ToastType, string> = {
  success: 'text-emerald-600',
  info: 'text-[#0052FF]',
  error: 'text-red-600',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToastContext()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-[360px] ${borders[toast.type]} animate-slide-in`}
        >
          <div className="flex-1">
            <div className={`font-mono text-[10px] uppercase tracking-[0.15em] font-semibold mb-0.5 ${labelColors[toast.type]}`}>
              {icons[toast.type]} {labels[toast.type]}
            </div>
            <p className="text-sm text-[#0F172A]">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors mt-0.5 flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
