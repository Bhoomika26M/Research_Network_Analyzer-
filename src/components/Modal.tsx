import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
}

export default function Modal({ title, onClose, children, width = 560, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 14,
          animation: 'modal-in 0.18s ease-out',
        }}
      >
        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: scale(0.96) translateY(-6px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px',
          borderBottom: '1px solid #F3F4F6',
          flexShrink: 0,
        }}>
          <h2
            id="modal-title"
            style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15.5, margin: 0, color: '#1B1F27' }}
          >
            {title}
          </h2>
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9CA3AF',
              transition: 'background 0.15s, color 0.15s',
              cursor: 'pointer',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#5B6472';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 22px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
