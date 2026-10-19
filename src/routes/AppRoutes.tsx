import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';

import { DashboardContainer } from '../pages/Dashboards/DashboardContainer';
import AdminUsers from '../pages/systemAdmin/Users';
import { CollaborationNetworkPage } from '../pages/Collaboration/CollaborationNetworkPage';
import { SettingsPage } from '../pages/Global/SettingsPage';
import { NotAuthorizedPage } from '@/pages/Global/NotAuthorizedPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Main Application Shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardContainer />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/collaboration" element={<CollaborationNetworkPage />} />
        <Route path="/collaboration/network" element={<CollaborationNetworkPage />} />
        {/* Removed routes (hidden, not deleted): publications, researchers, institutions, conferences, collaborations, citations, reports, audit logs, notifications, search, reviews */}
        <Route path="/publications" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/researchers" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/institutions" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/conferences" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/citations" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/reports" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/audit-logs" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/notifications" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/search" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/reviews" element={<NotAuthorizedPage role="System Admin" message="This module is no longer available. For user management, see the Users page." />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotAuthorizedPage />} />
      </Route>
    </Routes>
  );
};
