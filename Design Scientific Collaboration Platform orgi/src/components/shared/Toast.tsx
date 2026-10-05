import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useAppContext } from '../../contexts/AppContext'

const config = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-950/60',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-900 dark:text-amber-100',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
  },
}

export default function Toast() {
  const { toast } = useAppContext()

  if (!toast) return null

  const { icon: Icon, bg, border, iconColor, text } = config[toast.type]

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${bg} ${border} animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
      <p className={`text-sm font-medium leading-snug ${text}`}>{toast.message}</p>
    </div>
  )
}
