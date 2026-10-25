import { useState } from 'react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { useToast } from '../../context/ToastContext'
import { usePublications } from '../../services/publications'
import { useCitations } from '../../services/citations'
import { useProjects } from '../../services/projects'
import { useResearchers } from '../../services/researchers'

const reportTypes = [
  { id: 'publication', label: 'Publication Reports', icon: '📄', description: 'Output, citation analysis, and journal distribution' },
  { id: 'citation', label: 'Citation Report', icon: '🔗', description: 'Citation links, source-target relationships' },
  { id: 'collaboration', label: 'Collaboration Reports', icon: '🤝', description: 'Network metrics, partner activity, co-author index' },
  { id: 'activity', label: 'User Activity', icon: '👤', description: 'Researcher productivity, h-index, and output' },
]

const today = new Date().toISOString().split('T')[0]

export default function ReportsExport() {
  const { showToast } = useToast()
  const [selected, setSelected] = useState('publication')

  // Live data from PostgreSQL (cached by react-query)
  const { data: publications = [] } = usePublications()
  const { data: citations = [] } = useCitations()
  const { data: projects = [] } = useProjects()
  const { data: researchers = [] } = useResearchers()

  // Report header derived from the actual dataset — never hardcoded demo text.
  const pubYears = publications.map(p => p.year).filter(Boolean) as number[]
  const yearRange = pubYears.length > 0
    ? `${Math.min(...pubYears)}–${Math.max(...pubYears)}`
    : ''
  const totalCitations = publications.reduce((sum, p) => sum + (p.citations || 0), 0)
  const journalCount = new Set(publications.map(p => p.journal)).size
  const institutionCount = new Set(researchers.map(r => r.institution)).size
  const combinedHIndex = researchers.reduce((sum, r) => sum + (r.h_index || 0), 0)

  const meta: { title: string; subtitle: string } = (() => {
    switch (selected) {
      case 'publication':
        return {
          title: `Publication Output Report${yearRange ? ` (${yearRange})` : ''}`,
          subtitle: `${publications.length} publications · ${totalCitations.toLocaleString()} citations · ${journalCount} journals`,
        }
      case 'citation':
        return {
          title: 'Citation Network Report',
          subtitle: `${citations.length} citation links between publications`,
        }
      case 'collaboration':
        return {
          title: 'Collaboration Network Report',
          subtitle: `${projects.length} research projects · ${institutionCount} institutions`,
        }
      case 'activity':
        return {
          title: 'User Activity Report',
          subtitle: `${researchers.length} researcher profiles · ${combinedHIndex} combined h-index`,
        }
      default:
        return { title: 'SciCollab Report', subtitle: '' }
    }
  })()

  // Build dataset based on selection
  const getRows = () => {
    if (selected === 'publication') {
      return publications.map(p => ({
        Title: p.title,
        'First Author': p.authors[0] ?? '',
        Year: p.year,
        Type: p.type,
        Status: p.status,
        Citations: p.citations,
        DOI: p.doi ?? '—',
      }))
    }
    if (selected === 'citation') {
      return citations.map(c => {
        const src = publications.find(p => p.id === c.sourcePubId)
        const tgt = publications.find(p => p.id === c.targetPubId)
        return {
          'Source Title': src?.title ?? `Pub #${c.sourcePubId}`,
          'Target Title': tgt?.title ?? `Pub #${c.targetPubId}`,
          Year: c.year,
          Context: c.context.slice(0, 80),
        }
      })
    }
    if (selected === 'collaboration') {
      return projects.map(proj => ({
        'Project Title': proj.title,
        PI: proj.pi,
        Status: proj.status,
        Members: proj.members.length,
        Tags: proj.tags.join(', '),
        'Start Date': proj.startDate,
      }))
    }
    // activity
    return researchers.map(r => ({
      Name: r.name,
      Institution: r.institution,
      Department: r.department,
      'Publications': r.publications.length,
      'h-index': r.h_index,
      'Total Citations': r.citations_total,
    }))
  }

  const getColumns = () => {
    const rows = getRows()
    if (rows.length === 0) return []
    return Object.keys(rows[0])
  }

  const exportExcel = () => {
    const data = getRows()
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `${selected}-report-${today}.xlsx`)
    showToast(`${selected}-report-${today}.xlsx downloaded`, 'success')
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`SciCollab — ${meta.title}`, 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()} | ${meta.subtitle}`, 14, 28)

    const rows = getRows()
    doc.setFontSize(8)
    doc.setTextColor(60)
    doc.text(`${rows.length} records`, 14, 34)

    let y = 42
    rows.forEach((row, i) => {
      if (y > 275) { doc.addPage(); y = 20 }
      const vals = Object.values(row as Record<string, unknown>)
      doc.setFontSize(9)
      doc.setTextColor(0)
      doc.text(`${i + 1}. ${String(vals[0]).slice(0, 70)}`, 14, y)
      doc.setFontSize(7)
      doc.setTextColor(100)
      doc.text(vals.slice(1).map(v => String(v)).join(' | ').slice(0, 95), 14, y + 4)
      doc.setTextColor(0)
      y += 12
    })
    doc.save(`${selected}-report-${today}.pdf`)
    showToast(`${selected}-report-${today}.pdf downloaded (${rows.length} records)`, 'success')
  }

  const rows = getRows()
  const columns = getColumns()

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">07 — Reports</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Reports & Export</h1>
        <p className="text-[#64748B] mt-1">Generate, preview, and export research analytics reports</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelected(type.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-sm ${
              selected === type.id
                ? 'border-[#0052FF] bg-blue-50'
                : 'border-[#E2E8F0] bg-white hover:border-[#0052FF]/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-lg ${
              selected === type.id ? 'gradient-bg' : 'bg-[#F1F5F9]'
            }`}>
              {type.icon}
            </div>
            <p className={`text-sm font-semibold mb-0.5 ${selected === type.id ? 'text-[#0052FF]' : 'text-[#0F172A]'}`}>
              {type.label}
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Report preview */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Preview header */}
        <div className="gradient-bg p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>Preview
              </span>
              <h2 className="font-display text-xl text-white">{meta.title}</h2>
              <p className="text-sm text-white/70 mt-0.5">{meta.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v7M4 7l3 3 3-3M2 11v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Excel Export
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0052FF] text-sm font-semibold hover:shadow-md transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <line x1="4" y1="4.5" x2="10" y2="4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="4" y1="9.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                PDF Export
              </button>
            </div>
          </div>
        </div>

        {/* Data preview table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide">
              Data Preview — {rows.length} records
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
                  {columns.map(col => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wide text-[#64748B] whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    {Object.values(row as Record<string, unknown>).map((val, j) => (
                      <td key={j} className="px-4 py-3 text-xs text-[#0F172A] max-w-[200px] truncate whitespace-nowrap">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 8 && (
            <p className="text-xs text-[#64748B] text-center py-3">
              + {rows.length - 8} more records in export
            </p>
          )}

          {/* Date range */}
          <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
            <p className="text-xs font-medium text-[#64748B] mb-3 font-mono uppercase tracking-wide">Date Range Filter (Optional)</p>
            <div className="flex items-center gap-3">
              <input
                type="date"
                onChange={() => showToast('Date filtering coming soon', 'info')}
                className="px-4 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
              />
              <span className="text-xs text-[#64748B]">to</span>
              {/* intentional placeholder — date filtering not yet wired */}
              <input
                type="date"
                onChange={() => showToast('Date filtering coming soon', 'info')}
                className="px-4 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
