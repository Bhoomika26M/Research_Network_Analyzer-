import React from 'react';

type StatusType =
  | 'Draft' | 'Submitted' | 'Published' | 'Archived'
  | 'Planning' | 'Active' | 'Completed' | 'On Hold'
  | 'Success' | 'Warning' | 'Failure'
  | 'Registered' | 'Pending' | 'Attended';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      case 'Published':
      case 'Active':
      case 'Success':
      case 'Attended':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';

      case 'Submitted':
      case 'Planning':
      case 'Registered':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20';

      case 'Pending':
      case 'On Hold':
      case 'Warning':
      case 'Draft':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20';

      case 'Archived':
      case 'Completed':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20';

      case 'Failure':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20';

      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const pxSize = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${pxSize} ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status}
    </span>
  );
};
