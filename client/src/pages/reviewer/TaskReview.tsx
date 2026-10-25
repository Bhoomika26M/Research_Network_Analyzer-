import { useState } from 'react'

interface TaskReviewProps {
  pubId?: number
  onBack: () => void
}

const publication = {
  title: 'Transformer Models for Scientific Graph Embeddings',
  authors: 'Zhang, L., Wei, C., Park, S., Okonkwo, N.',
  institution: 'Tsinghua University · Department of Computer Science',
  venue: 'Nature Machine Intelligence',
  submittedDate: 'November 25, 2024',
  deadline: 'December 10, 2024',
  type: 'Journal Paper',
  doi: 'Under Review',
  abstract: 'We present SciFormer, a transformer-based architecture specifically designed for encoding and reasoning over heterogeneous scientific knowledge graphs. Unlike previous graph transformer methods, SciFormer introduces a dual-attention mechanism that separately models structural proximity and semantic similarity between scientific entities, enabling richer representations for downstream tasks such as link prediction, entity resolution, and hypothesis generation. Evaluated on three large-scale benchmarks — OpenCitations, Semantic Scholar Open Research Corpus, and bioRxiv — our method achieves state-of-the-art performance, improving MAP@10 by 12.4% over the strongest baseline while reducing inference latency by 40%. We release the model weights and benchmarks under an open-access license.',
  keywords: ['Graph Transformers', 'Scientific Knowledge Graphs', 'Link Prediction', 'Representation Learning', 'Heterogeneous Graphs'],
  wordCount: 8247,
  figures: 7,
}

export default function TaskReview({ onBack }: TaskReviewProps) {
  const [score, setScore] = useState(7)
  const [comments, setComments] = useState('')
  const [methodScore, setMethodScore] = useState(3)
  const [noveltyScore, setNoveltyScore] = useState(4)
  const [clarityScore, setClarityScore] = useState(3)

  const ScoreRow = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number
    onChange: (v: number) => void
  }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-sm text-[#64748B]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
              n <= value ? 'gradient-bg text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
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
        <h1 className="font-display text-2xl text-[#0F172A]">Peer Review</h1>
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
              <h2 className="font-display text-lg text-[#0F172A] leading-snug">{publication.title}</h2>
            </div>

            <div className="space-y-2.5 mb-4">
              {[
                { label: 'Authors', value: publication.authors },
                { label: 'Institution', value: publication.institution },
                { label: 'Target Venue', value: publication.venue },
                { label: 'Submitted', value: publication.submittedDate },
                { label: 'Review Deadline', value: publication.deadline },
                { label: 'Type', value: publication.type },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs font-medium text-[#64748B] w-28 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className={`text-xs text-[#0F172A] flex-1 ${item.label === 'Review Deadline' ? 'text-amber-700 font-medium' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap pt-3 border-t border-[#F1F5F9]">
              {publication.keywords.map((kw) => (
                <span key={kw} className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                  {kw}
                </span>
              ))}
            </div>

            <div className="flex gap-4 pt-3 border-t border-[#F1F5F9] mt-3">
              <span className="text-xs text-[#64748B]">{publication.wordCount.toLocaleString()} words</span>
              <span className="text-xs text-[#64748B]">{publication.figures} figures</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Abstract
            </span>
            <p className="text-sm text-[#64748B] leading-relaxed">{publication.abstract}</p>
          </div>
        </div>

        {/* Review form — right panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Evaluation
            </span>
            <h3 className="font-display text-base text-[#0F172A] mb-4">Detailed Scores</h3>
            <ScoreRow label="Methodology & Rigor" value={methodScore} onChange={setMethodScore} />
            <ScoreRow label="Novelty & Contribution" value={noveltyScore} onChange={setNoveltyScore} />
            <ScoreRow label="Clarity & Presentation" value={clarityScore} onChange={setClarityScore} />

            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0F172A]">Overall Score</span>
                <span className="font-display text-2xl gradient-text">{score}<span className="text-base text-[#64748B] font-sans">/10</span></span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setScore(i + 1)}
                    className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                      i + 1 <= score ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
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
              placeholder="Provide detailed feedback on the submission. Include strengths, weaknesses, and specific suggestions for improvement..."
              rows={8}
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors resize-none leading-relaxed"
            />
            <p className="text-xs text-[#64748B] mt-1.5">{comments.length} characters</p>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Decision
            </span>
            <div className="grid grid-cols-3 gap-3">
              <button className="py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all flex flex-col items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Approve
              </button>
              <button className="py-2.5 px-4 rounded-xl border-2 border-[#0052FF] text-[#0052FF] text-sm font-semibold hover:bg-blue-50 transition-all flex flex-col items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v6M8 11v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Revisions
              </button>
              <button className="py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-semibold hover:bg-[#F1F5F9] transition-all flex flex-col items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Reject
              </button>
            </div>
            <p className="text-xs text-[#64748B] text-center mt-3">Submitting a decision will notify the authors and close the review task.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
