import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download, FileText } from 'lucide-react'
import { useAppContext } from '../../contexts/AppContext'

interface ExportButtonsProps {
  data: Record<string, unknown>[]
  columns: string[]
  filename: string
  title: string
  filters?: string
}

export default function ExportButtons({ data, columns, filename, title, filters }: ExportButtonsProps) {
  const { showToast } = useAppContext()

  const handleExcelExport = () => {
    try {
      const rows =
        data.length > 0
          ? data.map(row => {
              const out: Record<string, unknown> = {}
              columns.forEach(col => {
                out[col] = row[col] ?? ''
              })
              return out
            })
          : [Object.fromEntries(columns.map((col, i) => [col, i === 0 ? 'No data available' : '']))]

      const ws = XLSX.utils.json_to_sheet(rows, { header: columns })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      XLSX.writeFile(wb, `${filename}.xlsx`)
      showToast('Excel file exported successfully', 'success')
    } catch (err) {
      showToast('Failed to export Excel file', 'error')
    }
  }

  const handlePDFExport = () => {
    try {
      const doc = new jsPDF()

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 14, 20)

      if (filters) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 120, 120)
        doc.text(`Filters: ${filters}`, 14, 28)
        doc.setTextColor(0, 0, 0)
      }

      const bodyData =
        data.length > 0
          ? data.map(row => columns.map(col => String(row[col] ?? '')))
          : [columns.map((_, i) => (i === 0 ? 'No data available' : ''))]

      autoTable(doc, {
        head: [columns],
        body: bodyData,
        startY: filters ? 34 : 28,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      })

      doc.save(`${filename}.pdf`)
      showToast('PDF file exported successfully', 'success')
    } catch (err) {
      showToast('Failed to export PDF file', 'error')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExcelExport}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
      >
        <Download size={14} />
        Export Excel
      </button>
      <button
        onClick={handlePDFExport}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
      >
        <FileText size={14} />
        Export PDF
      </button>
    </div>
  )
}
