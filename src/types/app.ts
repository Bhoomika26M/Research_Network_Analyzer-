/** View-model types used by the legacy (AppContext) page tree. */

export interface Publication {
  id: string; title: string; authors: string[]; journal: string; year: number;
  status: 'Published' | 'Submitted' | 'Draft' | 'Under Review';
  citations: number; doi: string; abstract: string; keywords: string[];
  type: 'Journal' | 'Conference' | 'Book Chapter' | 'Preprint';
}

export interface Researcher {
  id: string; name: string; initials: string; color: string; role: string;
  dept: string; institution: string; interests: string[]; hIndex: number;
  publications: number; collaborators: number; citations: number; email: string;
  orcid: string; status: 'Active' | 'Inactive'; joinDate: string;
}

export interface Institution {
  id: string; name: string; country: string; type: 'University' | 'Research Lab' | 'Government';
  researchers: number; projects: number; budget: number; status: 'Active' | 'Inactive';
  established: number; website: string;
}

export interface Project {
  id: string; name: string; desc: string; lead: string; institution: string;
  members: string[]; progress: number; status: 'On Track' | 'At Risk' | 'Ahead' | 'Delayed';
  start: string; end: string; budget: number;
  milestones: { name: string; date: string; completed: boolean }[];
}

export interface Conference {
  id: string; name: string; location: string; date: string; deadline: string;
  status: 'Open' | 'Closed' | 'Upcoming'; submissions: number; attendees: number;
  website: string; topics: string[];
}

export interface Review {
  id: string; paperId: string; paperTitle: string; reviewer: string;
  assignedDate: string; dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low'; score: number | null;
  feedback: string | null; journal: string;
}

export interface Event {
  id: string; title: string; type: 'Workshop' | 'Seminar' | 'Conference' | 'Webinar';
  date: string; location: string; attendees: number; maxAttendees: number;
  registered: boolean; description: string;
}

export interface AuditLog {
  id: string; user: string; action: string; resource: string; timestamp: string;
  type: 'Info' | 'Warning' | 'Critical'; ip: string; details: string;
}

export interface Department {
  id: string; name: string; head: string; institution: string;
  researchers: number; projects: number; budget: number; publications: number;
}

export interface User {
  id: string; name: string; email: string;
  role: 'Researcher' | 'Institution Admin' | 'Reviewer' | 'System Admin';
  institution: string; status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string; joinDate: string; permissions: string[];
}

export interface Citation {
  id: string; paperTitle: string; citedBy: string; journal: string;
  year: number; authors: string[]; count: number;
}

export interface Notification {
  id: string; title: string; message: string;
  type: 'info' | 'success' | 'warning' | 'error'; time: string; read: boolean;
}
