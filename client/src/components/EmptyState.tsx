interface EmptyStateProps {
  icon?: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon = '🔍', title, subtitle }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] py-16 flex flex-col items-center justify-center text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-2xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-[#64748B] mt-3">{title}</p>
      {subtitle && <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>}
    </div>
  )
}
