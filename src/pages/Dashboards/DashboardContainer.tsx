import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { ResearcherDashboard } from './ResearcherDashboard';
import { InstitutionDashboard } from './InstitutionDashboard';
import { ReviewerDashboard } from './ReviewerDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardContainer: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'Researcher';

  switch (role) {
    case 'Institution Admin':
      return <InstitutionDashboard />;
    case 'Reviewer':
      return <ReviewerDashboard />;
    case 'System Admin':
      return <AdminDashboard />;
    case 'Researcher':
    default:
      return <ResearcherDashboard />;
  }
};
