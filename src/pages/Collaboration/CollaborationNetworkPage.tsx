import React from 'react';
import CollaborationPage from './CollaborationPage';

/**
 * Legacy `react-router` entry point (`/collaboration/network`): the role shells
 * render `<CollaborationPage />` directly, and this route shows the same
 * co-authorship view.
 */
export const CollaborationNetworkPage: React.FC = () => (
  <CollaborationPage tab="coauthors" />
);

export default CollaborationNetworkPage;
