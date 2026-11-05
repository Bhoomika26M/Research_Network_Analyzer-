import { useState } from 'react'

const faqs = [
  {
    q: 'How do I add a new publication to my profile?',
    a: 'Navigate to Publications in the sidebar, then click "New Publication." You can manually enter metadata or use the DOI Lookup tool — paste a valid DOI (starting with "10.") and click Verify, then Fetch Metadata to auto-populate all fields.',
  },
  {
    q: 'How are collaboration requests sent and accepted?',
    a: "Go to Collaborations and click 'New Collaboration.' Search for a researcher by name or ORCID, choose the collaboration type, and send the request. The recipient will see it in their Notifications. Once accepted it appears in both parties' active collaborations.",
  },
  {
    q: 'What does the Reviewer role allow me to do?',
    a: 'Reviewers can be assigned publications to evaluate through the review queue. Each review includes a structured scoring rubric (1–5 stars per criterion), a 1–10 overall score, comments textarea, and a final Accept / Request Revisions / Reject decision.',
  },
  {
    q: 'How do I export a citations report?',
    a: 'From the Reports module, select "Citation Summary" in the report type dropdown. Choose your date range and format (PDF, CSV, or JSON), then click Generate Report. The file will download automatically.',
  },
  {
    q: 'Can I link publications from different sources?',
    a: 'Yes — use the Publication Linking tool under Publications. Search for related papers, add them to your linked list, and assign a relationship type (Cites, Related, Extends, or Refutes). Relationships are bi-directional and visible in the citation graph.',
  },
  {
    q: 'How do I change my institution or department?',
    a: 'Go to Account Settings and update the institution and department fields under Account Info. Changes require re-verification if your email domain no longer matches the new institution.',
  },
]

const docs = [
  { title: 'Getting Started Guide', desc: 'Full onboarding walkthrough for new users', icon: '📘' },
  { title: 'API Reference', desc: 'REST API docs for programmatic access to publications and citations', icon: '⚙️' },
  { title: 'Reviewer Handbook', desc: 'How to conduct structured peer review within SciCollab', icon: '📋' },
]

export default function HelpSupport() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return
    setSent(true)
    setTimeout(() => { setSent(false); setSubject(''); setMessage('') }, 3000)
  }

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Help & Support</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Help & Support</h1>
        <p className="text-[#64748B] mt-1">Find answers, reach our team, or browse the documentation</p>
      </div>

      <div className="space-y-5">
        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Frequently Asked Questions
            </span>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-t border-[#F1F5F9]">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
              >
                <span className={`text-sm font-medium pr-4 transition-colors ${expanded === i ? 'text-[#0052FF]' : 'text-[#0F172A]'}`}>
                  {faq.q}
                </span>
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-lg bg-[#F1F5F9] flex items-center justify-center transition-all duration-200 ${expanded === i ? 'expand-icon--open' : ''}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 2v6M2 5h6" stroke={expanded === i ? '#0052FF' : '#64748B'} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              {expanded === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Contact Support
          </span>

          {sent ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-3 text-white text-xl">✓</div>
              <p className="text-sm font-semibold text-[#0F172A]">Message sent!</p>
              <p className="text-xs text-[#64748B] mt-1">Our team will get back to you within 1–2 business days.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Cannot verify DOI — getting timeout error"
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors resize-none leading-relaxed"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!subject.trim() || !message.trim()}
                className="w-full py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none"
              >
                Send Message
              </button>
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Documentation
          </span>
          <div className="space-y-2">
            {docs.map(doc => (
              <button
                key={doc.title}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] text-left transition-all group"
              >
                <span className="text-xl flex-shrink-0">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#0052FF] transition-colors">{doc.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{doc.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-[#94A3B8] group-hover:text-[#0052FF] transition-colors">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
