import { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ITEMS = [
  { id: 'gdpr', name: 'GDPR Compliance', description: 'All user data is processed according to GDPR regulations including consent management and data portability.' },
  { id: 'retention', name: 'Data Retention Policy', description: 'Research data is retained for a minimum of 5 years per academic standards and then securely disposed.' },
  { id: 'access', name: 'Access Controls', description: 'Role-based access control (RBAC) ensures users can only access data relevant to their role.' },
  { id: 'encryption', name: 'Encryption at Rest', description: 'All stored data including databases and backups are encrypted using AES-256.' },
  { id: 'audit', name: 'Audit Logging', description: 'All user actions and system events are logged with timestamps, user IDs, and IP addresses.' },
  { id: 'auth', name: 'User Authentication', description: 'Multi-factor authentication is available and enforced for privileged accounts.' },
  { id: 'api', name: 'API Security', description: 'All API endpoints use OAuth 2.0 tokens and rate limiting to prevent abuse.' },
  { id: 'backup', name: 'Backup Policy', description: 'Automated daily backups with 30-day retention stored in geographically separate regions.' },
  { id: 'incident', name: 'Incident Response Plan', description: 'A documented incident response procedure is in place with defined escalation paths.' },
  { id: 'privacy', name: 'Privacy Policy', description: 'A clear privacy policy is published and users are notified of any material changes.' },
]

interface ComplianceState {
  compliant: boolean
  lastReviewed: string
  notes: string
}

export default function Compliance() {
  const { institutions, showToast } = useAppContext()

  const [states, setStates] = useState<Record<string, ComplianceState>>(() => {
    const s: Record<string, ComplianceState> = {}
    ITEMS.forEach(item => {
      s[item.id] = {
        compliant: Math.random() > 0.2,
        lastReviewed: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().slice(0, 10),
        notes: '',
      }
    })
    return s
  })

  const score = useMemo(() => {
    const compliant = Object.values(states).filter(s => s.compliant).length
    return Math.round((compliant / ITEMS.length) * 100)
  }, [states])

  const toggle = (id: string) => {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], compliant: !prev[id].compliant } }))
  }

  const handleGenerateReport = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Compliance Report', 14, 20)
      doc.setFontSize(12)
      doc.text(`Overall Compliance Score: ${score}%`, 14, 32)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40)

      autoTable(doc, {
        head: [['Item', 'Status', 'Last Reviewed', 'Notes']],
        body: ITEMS.map(item => [
          item.name,
          states[item.id].compliant ? 'Compliant' : 'Non-Compliant',
          states[item.id].lastReviewed,
          states[item.id].notes || '-',
        ]),
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [245, 158, 11] },
        bodyStyles: { valign: 'top' },
        columnStyles: { 1: { fontStyle: 'bold' } },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === 'body') {
            data.cell.styles.textColor = data.cell.text[0] === 'Compliant' ? [16, 185, 129] : [239, 68, 68]
          }
        },
      })

      doc.save('compliance-report.pdf')
      showToast('Compliance report generated', 'success')
    } catch {
      showToast('Failed to generate report', 'error')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform compliance checklist and status</p>
        </div>
        <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>
          <FileText size={15} /> Generate Report
        </button>
      </div>

      {/* Score */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 201} 201`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{score}%</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Overall Compliance Score</p>
          <p className="text-sm text-muted-foreground mt-1">
            {Object.values(states).filter(s => s.compliant).length} of {ITEMS.length} items compliant
          </p>
          <p className={`text-sm font-medium mt-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {score >= 80 ? 'Good standing' : score >= 60 ? 'Needs attention' : 'Critical issues'}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Compliance Checklist</h2>
        </div>
        <div className="divide-y divide-border">
          {ITEMS.map(item => {
            const state = states[item.id]
            return (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                <button
                  onClick={() => toggle(item.id)}
                  className="mt-0.5 shrink-0 transition-colors"
                >
                  {state.compliant
                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                    : <XCircle size={20} className="text-red-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${state.compliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                      {state.compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                    <span className="text-xs text-muted-foreground">Reviewed: {state.lastReviewed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <input
                    value={state.notes}
                    onChange={e => setStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], notes: e.target.value } }))}
                    placeholder="Add notes..."
                    className="mt-2 w-full max-w-md px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-institution compliance */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Per-Institution Compliance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Institution', 'Country', 'Status', 'Compliance Score'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => {
                const instScore = Math.floor(Math.random() * 30 + 70)
                return (
                  <tr key={inst.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px]"><p className="truncate">{inst.name}</p></td>
                    <td className="px-4 py-3 text-muted-foreground">{inst.country}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inst.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{inst.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[120px] bg-border rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${instScore}%`, background: instScore >= 80 ? '#10B981' : instScore >= 60 ? '#F59E0B' : '#EF4444' }} />
                        </div>
                        <span className="text-sm text-foreground font-medium">{instScore}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
