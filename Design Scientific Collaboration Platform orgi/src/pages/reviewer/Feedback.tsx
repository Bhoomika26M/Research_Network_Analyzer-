import { useState, useMemo } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

const EDITORS = ['Dr. John Smith', 'Prof. Anna Lee', 'Dr. Michael Chen', 'Prof. Lisa Park']

interface Message {
  sender: string
  text: string
  time: string
  isMe: boolean
}

interface Thread {
  id: string
  paperId: string
  paperTitle: string
  journal: string
  editorName: string
  messages: Message[]
  unread: boolean
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function Feedback() {
  const { reviews } = useAppContext()

  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read'>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [threads, setThreads] = useState<Thread[]>(() => {
    const completedReviews = reviews.filter(r => r.status === 'Completed' || r.status === 'In Progress').slice(0, 6)
    return completedReviews.map((r, i) => ({
      id: r.id,
      paperId: r.paperId,
      paperTitle: r.paperTitle,
      journal: r.journal,
      editorName: EDITORS[i % EDITORS.length],
      unread: i < 2,
      messages: [
        {
          sender: EDITORS[i % EDITORS.length],
          text: `Thank you for taking on this review for "${r.paperTitle}". Please ensure your feedback covers the methodology, results, and overall contribution. Let me know if you have any questions.`,
          time: r.assignedDate,
          isMe: false,
        },
        ...(r.status === 'Completed' ? [{
          sender: 'Dr. Maria Rodriguez',
          text: `Thank you for the assignment. I have completed the review and submitted my detailed feedback. The paper shows promise but requires some revisions.`,
          time: r.dueDate,
          isMe: true,
        }] : []),
        ...(i % 3 === 0 && r.status === 'Completed' ? [{
          sender: EDITORS[i % EDITORS.length],
          text: 'Excellent review! The authors have been notified of your feedback. We appreciate your thoroughness.',
          time: r.dueDate,
          isMe: false,
        }] : []),
      ],
    }))
  })

  const filtered = useMemo(() => {
    if (filter === 'Unread') return threads.filter(t => t.unread)
    if (filter === 'Read') return threads.filter(t => !t.unread)
    return threads
  }, [threads, filter])

  const selectedThread = useMemo(() => threads.find(t => t.id === selectedId), [threads, selectedId])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t))
  }

  const handleSend = () => {
    if (!replyText.trim() || !selectedId) return
    setThreads(prev => prev.map(t => t.id === selectedId ? {
      ...t,
      messages: [...t.messages, {
        sender: 'Dr. Maria Rodriguez',
        text: replyText,
        time: new Date().toISOString(),
        isMe: true,
      }],
    } : t))
    setReplyText('')
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">Messages from editors about your reviews</p>
      </div>

      <div className="flex gap-2">
        {(['All', 'Unread', 'Read'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'text-white' : 'border border-border text-foreground hover:bg-accent'}`}
            style={filter === f ? { background: '#14B8A6' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[500px]">
        {/* Thread list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden xl:col-span-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No messages</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`w-full text-left px-4 py-4 hover:bg-secondary/50 transition-colors ${selectedId === t.id ? 'bg-secondary/80' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.unread && <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0" />}
                      <p className={`text-sm truncate ${t.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>{t.editorName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(t.messages[t.messages.length - 1]?.time ?? '')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate pl-4">{t.paperTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate pl-4">{t.messages[t.messages.length - 1]?.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread detail */}
        <div className="bg-card border border-border rounded-2xl flex flex-col xl:col-span-2">
          {!selectedThread ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-muted-foreground">
              <MessageSquare size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Select a thread to read messages</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{selectedThread.paperTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedThread.journal} · With {selectedThread.editorName}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.isMe ? 'text-white' : 'bg-secondary text-foreground'}`} style={msg.isMe ? { background: '#14B8A6' } : {}}>
                      <p className={`text-xs font-semibold mb-1 ${msg.isMe ? 'text-white/80' : 'text-muted-foreground'}`}>{msg.sender}</p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/60' : 'text-muted-foreground'}`}>{timeAgo(msg.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border flex gap-3">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a reply..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="p-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ background: '#14B8A6' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
