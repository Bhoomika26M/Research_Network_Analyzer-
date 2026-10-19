import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-foreground">404 - Page Not Found</h1>
      <p className="text-xs text-muted-foreground mt-2 max-w-sm">
        The requested scientific module or record path does not exist in the current routing configuration.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>
    </div>
  );
};
