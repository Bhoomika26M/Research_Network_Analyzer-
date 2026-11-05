import { useToastContext } from '../context/ToastContext'
import { ToastType } from '../hooks/useToast'

const badgeColors: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  error: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

const borders: Record<ToastType, string> = {
  success: 'border-l-4 border-l-emerald-500',
  info: 'border-l-4 border-l-blue-600',
  error: 'border-l-4 border-l-rose-500',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToastContext()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-card border border-border rounded-xl shadow-xl px-4 py-3.5 flex items-start gap-3 min-w-[300px] max-w-[400px] ${borders[toast.type]} animate-slide-in backdrop-blur-md`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${badgeColors[toast.type]}`}>
                {toast.type}
              </span>
            </div>
            <p className="text-xs font-medium text-foreground leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted mt-0.5 flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
