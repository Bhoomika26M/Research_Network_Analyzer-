import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: t.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${t.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
            color: t.type === 'error' ? '#991B1B' : '#166534',
            padding: '12px 16px',
            borderRadius: 8,
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 13.5,
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.type === 'error' ? (
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
            )}
            <span>{t.text}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: 2,
              opacity: 0.7,
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
