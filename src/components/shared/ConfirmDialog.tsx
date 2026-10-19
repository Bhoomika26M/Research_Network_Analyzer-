import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  variant = 'danger',
  danger,
}) => {
  const isVisible = isOpen ?? open ?? false;
  const handleClose = onClose || onCancel || (() => {});
  const effectiveConfirmText = confirmText || confirmLabel || 'Confirm';

  if (!isVisible) return null;

  const isDanger = danger || variant === 'danger';

  const getButtonBg = () => {
    if (isDanger) return 'bg-rose-600 hover:bg-rose-700 text-white';
    if (variant === 'warning') return 'bg-amber-600 hover:bg-amber-700 text-white';
    return 'bg-primary hover:bg-primary/90 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">{title}</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${getButtonBg()}`}
          >
            {effectiveConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
