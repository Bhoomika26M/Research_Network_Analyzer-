import React from 'react';
import { ShieldOff } from 'lucide-react';

interface NotAuthorizedPageProps {
  /** Heading text (fixed) + optional explanation shown under it. */
  message?: string;
  /** Role of the signed-in user, when known. */
  role?: string;
  /** Primary action, e.g. "Back to dashboard" or "Retry". */
  action?: { label: string; onClick: () => void };
  /** Render inside the current page flow instead of a full-page view. */
  inline?: boolean;
}

/**
 * Shown when a role hits a page it is not allowed to access (wrong-role URL)
 * or when the API answers with HTTP 403.
 */
export const NotAuthorizedPage: React.FC<NotAuthorizedPageProps> = ({
  message,
  role,
  action,
  inline,
}) => {
  const content = (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 ${
        inline ? 'py-12' : 'min-h-[60vh]'
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
        <ShieldOff className="w-8 h-8 text-rose-500" />
      </div>
      <h1 className="text-xl font-extrabold text-foreground">Not authorized</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        {message ??
          `Your role${role ? ` (${role})` : ''} does not have access to this page. Ask an administrator if you believe you should.`}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (inline) return content;
  return <div className="p-6">{content}</div>;
};

export default NotAuthorizedPage;
