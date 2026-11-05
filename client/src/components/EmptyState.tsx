interface EmptyStateProps {
  icon?: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon = '🔬', title, subtitle }: EmptyStateProps) {
  return (
    <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center justify-center text-center px-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-secondary text-primary text-3xl flex items-center justify-center mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>}
    </div>
  )
}
