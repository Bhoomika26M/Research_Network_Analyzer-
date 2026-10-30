interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  Published: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
  Submitted: { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
  Draft: { bg: '#EBF4FF', text: '#2B6CB0', dot: '#2B6CB0' },
  Archived: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
  Active: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
  Pending: { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
  Completed: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
  Upcoming: { bg: '#EBF4FF', text: '#2B6CB0', dot: '#2B6CB0' },
  Past: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
  Success: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
  Failed: { bg: '#fdf0ef', text: '#C0392B', dot: '#C0392B' },
  Inactive: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
  Linked: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
  Unlinked: { bg: '#fdf0ef', text: '#C0392B', dot: '#C0392B' },
  University: { bg: '#EBF4FF', text: '#2B6CB0', dot: '#2B6CB0' },
  'Research Institute': { bg: '#f3eeff', text: '#6B46C1', dot: '#6B46C1' },
  'Funding Body': { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
};

export default function Badge({ status, size = 'md' }: BadgeProps) {
  const style = statusMap[status] ?? { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' };
  const pad = size === 'sm' ? '2px 8px' : '3px 10px';
  const font = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: pad,
        background: style.bg,
        color: style.text,
        fontSize: font,
        fontWeight: 600,
        borderRadius: 99,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
