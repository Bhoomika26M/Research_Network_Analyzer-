import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportButtonsProps {
  filename?: string;
  data: Record<string, any>[];
  headers?: string[];
  columns?: string[];
  pdfTitle?: string;
  title?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  filename = 'scientific_report',
  data,
  headers,
  columns,
  pdfTitle,
  title,
}) => {
  const documentTitle = pdfTitle || title || 'Scientific Collaboration Platform Report';
  const effectiveHeaders = headers || columns;

  const exportToExcel = () => {
    if (!data || data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataReport');
    XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Document Header
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // Scientific Primary Blue
    doc.text(documentTitle, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Scientific Collaboration Network Analyzer`, 14, 25);

    // Columns & Rows
    const tableKeys = effectiveHeaders || Object.keys(data[0] || {});
    const tableRows = data.map((row) =>
      tableKeys.map((key) => {
        const val = row[key];
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return String(val ?? '');
      })
    );

    autoTable(doc, {
      startY: 30,
      head: [tableKeys.map((k) => k.toUpperCase())],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`${filename}_${Date.now()}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={exportToExcel}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Excel Export
      </button>

      <button
        type="button"
        onClick={exportToPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        PDF Report
      </button>
    </div>
  );
};

export default ExportButtons;
