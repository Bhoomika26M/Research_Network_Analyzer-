import { useState, useEffect } from 'react'
import { useReviews, useUpdateReview } from '../../services/reviews'
import { useToast } from '../../context/ToastContext'

interface TaskReviewProps {
  pubId?: number       // legacy — not used when reviewId is provided
  reviewId?: number    // ID in the reviews table
  onBack: () => void
}

const ScoreRow = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
    <span className="text-sm text-[#64748B]">{label}</span>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
            n <= value
              ? 'gradient-bg text-white shadow-sm'
              : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
)

export default function TaskReview({ reviewId, onBack }: TaskReviewProps) {
  const { showToast } = useToast()
  const { data: reviews = [] } = useReviews()
  const updateReview = useUpdateReview()

  // Find the review by id
  const review = reviews.find(r => r.id === reviewId)

  const isCompleted = review?.status === 'Completed'

  const [score, setScore] = useState(review?.overall_score ?? 7)
  const [comments, setComments] = useState(review?.comments ?? '')
  const [methodScore, setMethodScore] = useState(review?.method_score ?? 3)
  const [noveltyScore, setNoveltyScore] = useState(review?.novelty_score ?? 4)
  const [clarityScore, setClarityScore] = useState(review?.clarity_score ?? 3)
  const [submitting, setSubmitting] = useState(false)

  // Sync state once review data loads from the API
  useEffect(() => {
    if (!review) return
    setScore(review.overall_score ?? 7)
    setComments(review.comments ?? '')
    setMethodScore(review.method_score ?? 3)
    setNoveltyScore(review.novelty_score ?? 4)
    setClarityScore(review.clarity_score ?? 3)
  }, [review?.id])

  const submitDecision = (decision: 'Approved' | 'Rejected' | 'Revisions Required') => {
    if (!review) return
    if (!comments.trim()) {
      showToast('Please provide review comments before submitting.', 'error')
      return
    }
    setSubmitting(true)
    updateReview.mutate(
      {
        id: review.id,
        data: {
          status: 'Completed',
          decision,
          overall_score: score,
          method_score: methodScore,
          novelty_score: noveltyScore,
          clarity_score: clarityScore,
          comments,
        },
      },
      {
        onSuccess: () => {
          showToast(`Review submitted: ${decision}`, 'success')
          setSubmitting(false)
          onBack()
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to submit review', 'error')
          setSubmitting(false)
        },
      }
    )
  }

  if (!review) {
    return (
      <div className="p-8 max-w-[1200px]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Review Queue
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
        </div>
      </div>
    )
  }

  const keywords = review.pub_keywords
    ? review.pub_keywords.split(',').map(k => k.trim()).filter(Boolean)
    : []

  return (
    <div className="p-8 max-w-[1200px]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Review Queue
        </button>
        <span className="text-[#E2E8F0]">/</span>
        <span className="text-sm text-[#0F172A] font-medium">Task Review</span>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Reviewer / Task Review</span>
        </span>
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl text-[#0F172A]">Peer Review</h1>
          {isCompleted && review.decision && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              review.decision === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
              review.decision === 'Rejected' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {review.decision === 'Approved' ? '✓' : review.decision === 'Rejected' ? '✗' : '↩'} {review.decision}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Publication metadata — left panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Submission
              </span>
              <h2 className="font-display text-lg text-[#0F172A] leading-snug">{review.pub_title}</h2>
            </div>

            <div className="space-y-2.5 mb-4">
              {[
                { label: 'Authors', value: review.pub_author },
                { label: 'Institution', value: review.pub_institution },
                { label: 'Target Venue', value: review.pub_venue ?? '—' },
                { label: 'Submitted', value: review.submitted_date ?? '—' },
                { label: 'Review Deadline', value: review.deadline ?? '—' },
                { label: 'Type', value: review.pub_type },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs font-medium text-[#64748B] w-28 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className={`text-xs text-[#0F172A] flex-1 ${item.label === 'Review Deadline' ? 'text-amber-700 font-medium' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {keywords.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-3 border-t border-[#F1F5F9]">
                {keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {review.pub_abstract && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Abstract
              </span>
              <p className="text-sm text-[#64748B] leading-relaxed">{review.pub_abstract}</p>
            </div>
          )}
        </div>

        {/* Review form — right panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Evaluation
            </span>
            <h3 className="font-display text-base text-[#0F172A] mb-4">Detailed Scores</h3>
            <ScoreRow label="Methodology & Rigor" value={methodScore} onChange={setMethodScore} disabled={isCompleted} />
            <ScoreRow label="Novelty & Contribution" value={noveltyScore} onChange={setNoveltyScore} disabled={isCompleted} />
            <ScoreRow label="Clarity & Presentation" value={clarityScore} onChange={setClarityScore} disabled={isCompleted} />

            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0F172A]">Overall Score</span>
                <span className="font-display text-2xl gradient-text">{score}<span className="text-base text-[#64748B] font-sans">/10</span></span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => !isCompleted && setScore(i + 1)}
                    disabled={isCompleted}
                    className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                      i + 1 <= score ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                    } ${isCompleted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
                <span>Strong Reject</span>
                <span>Strong Accept</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Feedback
            </span>
            <h3 className="font-display text-base text-[#0F172A] mb-3">Review Comments</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isCompleted}
              placeholder="Provide detailed feedback on the submission. Include strengths, weaknesses, and specific suggestions for improvement..."
              rows={8}
              className={`w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors resize-none leading-relaxed ${isCompleted ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            <p className="text-xs text-[#64748B] mt-1.5">{comments.length} characters</p>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Decision
            </span>

            {isCompleted ? (
              <div className="text-center py-4">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold ${
                  review.decision === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  review.decision === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {review.decision === 'Approved' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : review.decision === 'Rejected' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v6M8 11v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  )}
                  Decision submitted: {review.decision}
                </div>
                <p className="text-xs text-[#64748B] mt-3">This review has been closed. The decision has been recorded.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => submitDecision('Approved')}
                    disabled={submitting}
                    className="py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => submitDecision('Revisions Required')}
                    disabled={submitting}
                    className="py-2.5 px-4 rounded-xl border-2 border-[#0052FF] text-[#0052FF] text-sm font-semibold hover:bg-blue-50 transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v6M8 11v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Revisions
                  </button>
                  <button
                    onClick={() => submitDecision('Rejected')}
                    disabled={submitting}
                    className="py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-semibold hover:bg-[#F1F5F9] transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Reject
                  </button>
                </div>
                <p className="text-xs text-[#64748B] text-center mt-3">
                  {submitting ? 'Submitting decision…' : 'Submitting a decision will notify the authors and close the review task.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
