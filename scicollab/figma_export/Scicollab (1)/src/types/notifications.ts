export interface AppNotification {
  id: number;
  title: string;
  msg: string;
  time: string;
  unread: boolean;
}

export const initialNotifications: AppNotification[] = [
  { id: 1, title: 'New citation received', msg: '"Federated Learning…" cited by Zhang et al., Nature 2025', time: '5 min ago', unread: true },
  { id: 2, title: 'Publication status changed', msg: '"CRISPR Delivery in T-Cell Therapies" moved to In Review', time: '2 hr ago', unread: true },
  { id: 3, title: 'Conference reminder', msg: 'ICML 2025 registration deadline in 3 days', time: '5 hr ago', unread: true },
  { id: 4, title: 'DOI batch resolution complete', msg: 'System resolved 14 pending DOIs successfully', time: '1 day ago', unread: false },
  { id: 5, title: 'New collaboration request', msg: 'Stanford AI Lab requested partnership on ML project', time: '2 days ago', unread: false },
  { id: 6, title: 'Researcher profile updated', msg: 'Dr. Elena Vasquez updated her research interests and bio', time: '3 days ago', unread: false },
  { id: 7, title: 'Report generated', msg: 'Institution benchmarking report for Q2 2024 is ready', time: '4 days ago', unread: false },
  { id: 8, title: 'System maintenance', msg: 'Scheduled downtime on Aug 12 from 02:00–04:00 UTC', time: '5 days ago', unread: false },
];
