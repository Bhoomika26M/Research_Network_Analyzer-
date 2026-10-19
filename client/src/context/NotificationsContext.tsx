import { createContext, useContext, useState, type ReactNode } from 'react'

interface Notif {
  id: number
  type: string
  title: string
  body: string
  time: string
  read: boolean
}

const initialNotifs: Notif[] = [
  { id: 1, type: 'citation', title: 'New citation on your paper', body: '"Quantum Error Correction via Graph Neural Networks" cited by Zhang et al. in Nature Machine Intelligence.', time: '2h ago', read: false },
  { id: 2, type: 'collaboration', title: 'Collaboration request', body: 'Dr. Amit Patel (Stanford) has sent you a collaboration request on the ClimateBench project.', time: '5h ago', read: false },
  { id: 3, type: 'review', title: 'Review assignment', body: 'You have been assigned to review "Federated Knowledge Graph Embedding" for ICML 2025. Deadline: Dec 20.', time: '1d ago', read: false },
  { id: 4, type: 'citation', title: 'New citation on your paper', body: '"Geometric Deep Learning for Protein Interaction" cited by Lee et al. in Bioinformatics.', time: '2d ago', read: true },
  { id: 5, type: 'system', title: 'Platform update available', body: 'SciCollab v2.4 is now live. New features include enhanced DOI bulk import and citation graph explorer.', time: '3d ago', read: true },
  { id: 6, type: 'collaboration', title: 'Project invitation accepted', body: 'Dr. Emma Torres has accepted your invitation to join the FedGraph Research project.', time: '4d ago', read: true },
  { id: 7, type: 'review', title: 'Review result published', body: 'The paper you reviewed "Privacy-Preserving Federated GNNs" has been accepted to NeurIPS 2024.', time: '5d ago', read: true },
  { id: 8, type: 'citation', title: 'Citation milestone', body: 'Congratulations — your publication "Graph Neural Networks for Protein Folding" has reached 100 citations.', time: '1w ago', read: true },
  { id: 9, type: 'system', title: 'Profile verification approved', body: 'Your institutional email s.chen@mit.edu has been verified. Your researcher badge is now active.', time: '2w ago', read: true },
]

interface NotificationsContextValue {
  notifs: Notif[]
  unreadCount: number
  markRead: (id: number) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifs: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
})

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs)

  const markRead = (id: number) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <NotificationsContext.Provider value={{ notifs, unreadCount: notifs.filter(n => !n.read).length, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
