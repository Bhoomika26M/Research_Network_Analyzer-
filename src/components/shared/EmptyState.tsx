import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-2xl">
      <div className="p-4 rounded-full bg-muted/60 text-muted-foreground mb-4">
        <FolderOpen className="w-10 h-10" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 bg-card border border-border rounded-xl">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse w-full" />
      ))}
    </div>
  );
};
