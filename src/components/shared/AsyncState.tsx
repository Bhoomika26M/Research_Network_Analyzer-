import React from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { FORBIDDEN_MESSAGE } from '../../services/apiClient';
import NotAuthorizedPage from '../../pages/Global/NotAuthorizedPage';

interface AsyncStateProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/** Inline loading spinner / error banner used by API-backed pages. */
export const AsyncState: React.FC<AsyncStateProps> = ({ loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading…
      </div>
    );
  }

  // HTTP 403: show the dedicated "Not authorized" view instead of a generic error.
  if (error === FORBIDDEN_MESSAGE) {
    return (
      <NotAuthorizedPage
        inline
        message={error}
        action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs">
        <AlertCircle className="w-5 h-5 text-rose-500" />
        <p className="text-rose-600 font-medium text-center max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default AsyncState;
