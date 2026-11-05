import { useState } from 'react'
import { usePublications, useReviewDecision } from '../../services/publications'
import { hasPermission } from '../../permissions/config'
import type { SessionUser } from '../../types/index'
import { useToast } from '../../context/ToastContext'

interface TaskReviewProps {
  pubId?: number
  user?: SessionUser
  onBack: () => void
}

// Statuses that are awaiting a review decision.
const SUBMITTED = ['Submitted', 'Under Review']

export default function TaskReview({ pubId, user, onBack }: TaskReviewProps) {
  const { showToast } = useToast()
  const { data: pubs = [], isLoading } = usePublications()
  const decisionMutation = useReviewDecision()
  const canDecide = hasPermission(user, 'publications.review')

  const [score, setScore] = useState(7)
  const [comments, setComments] = useState('')
  const [methodScore, setMethodScore] = useState(3)
  const [noveltyScore, setNoveltyScore] = useState(4)
  const [clarityScore, setClarityScore] = useState(3)

  const submission = pubs.find(p => p.id === pubId)

  const submitDecision = (decision: 'approve' | 'reject' | 'return_to_draft') => {
    if (!submission) return
    if (!canDecide) {
      showToast('Your role cannot submit review decisions.', 'error')
      return
    }
    decisionMutation.mutate(
      { id: submission.id, decision, comments: comments || undefined },
      {
        onSuccess: (updated) => {
          showToast(`Decision recorded: publication is now ${updated.status}`, 'success')
          setComments('')
          onBack()
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to submit the review decision', 'error')
        },
      }
    )
  }

  const ScoreRow = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number
    onChange: (v: number) => void
  }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
              n <= value ? 'gradient-bg text-white shadow-xs' : 'bg-secondary text-muted-foreground hover:bg-[#E2E8F0]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-[1200px]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Review Queue
        </button>
        <span className="text-[#E2E8F0]">/</span>
        <span className="text-sm text-foreground font-medium">Task Review</span>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Reviewer / Task Review</span>
        </span>
        <h1 className="font-display font-bold text-2xl text-foreground">Peer Review</h1>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
          Loading submission...
        </div>
      ) : !submission ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-sm font-medium text-foreground">Submission not found</p>
          <p className="text-xs text-muted-foreground mt-1">Open a review from the reviewer dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Publication metadata — left panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                  Submission #{submission.id}
                </span>
                <h2 className="font-display font-bold text-lg text-foreground leading-snug">{submission.title}</h2>
              </div>

              <div className="space-y-2.5 mb-4">
                {[
                  { label: 'Authors', value: Array.isArray(submission.authors) ? submission.authors.join(', ') : String(submission.authors || '—') },
                  { label: 'Venue', value: submission.journal },
                  { label: 'Year', value: String(submission.year) },
                  { label: 'Type', value: submission.type },
                  { label: 'Status', value: submission.status },
                  { label: 'DOI', value: submission.doi || 'Not assigned' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-28 flex-shrink-0 pt-0.5">{item.label}</span>
                    <span className={`text-xs text-foreground flex-1 ${item.label === 'Status' && SUBMITTED.includes(item.value) ? 'text-amber-700 font-medium' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Abstract
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{submission.abstract}</p>
            </div>
          </div>

          {/* Review form — right panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Evaluation
              </span>
              <h3 className="font-display font-bold text-base text-foreground mb-4">Detailed Scores</h3>
              <ScoreRow label="Methodology & Rigor" value={methodScore} onChange={setMethodScore} />
              <ScoreRow label="Novelty & Contribution" value={noveltyScore} onChange={setNoveltyScore} />
              <ScoreRow label="Clarity & Presentation" value={clarityScore} onChange={setClarityScore} />

              <div className="mt-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Score</span>
                  <span className="font-display font-bold text-2xl gradient-text">{score}<span className="text-base text-muted-foreground font-sans">/10</span></span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setScore(i + 1)}
                      className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                        i + 1 <= score ? 'gradient-bg text-white' : 'bg-secondary text-muted-foreground hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Strong Reject</span>
                  <span>Strong Accept</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Feedback
              </span>
              <h3 className="font-display font-bold text-base text-foreground mb-3">Review Comments</h3>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide detailed feedback on the submission. Include strengths, weaknesses, and specific suggestions for improvement..."
                rows={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-colors resize-none leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">{comments.length} characters</p>
            </div>

            {/* Action buttons */}
            {canDecide ? (
              <div className="bg-card rounded-2xl border border-border p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                  Decision
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => submitDecision('approve')}
                    disabled={decisionMutation.isPending || !SUBMITTED.includes(submission.status)}
                    className="py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => submitDecision('return_to_draft')}
                    disabled={decisionMutation.isPending || !SUBMITTED.includes(submission.status)}
                    className="py-2.5 px-4 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-blue-50 transition-all flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v6M8 11v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Revisions
                  </button>
                  <button
                    onClick={() => submitDecision('reject')}
                    disabled={decisionMutation.isPending || !SUBMITTED.includes(submission.status)}
                    className="py-2.5 px-4 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-secondary transition-all flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Reject
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {SUBMITTED.includes(submission.status)
                    ? 'Approve publishes the entry; Revisions returns it to Draft; Reject marks it Rejected.'
                    : `This publication is ${submission.status} — review decisions apply only to submitted work.`}
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-5 text-center text-xs text-muted-foreground">
                Your role can view submissions but cannot submit a review decision.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
