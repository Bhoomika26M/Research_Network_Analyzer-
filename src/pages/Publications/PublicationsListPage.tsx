import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { publicationService } from '../../services/publicationService';
import { Publication, PublicationType } from '../../types';
import { DataTable, Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ExportButtons } from '../../components/shared/ExportButtons';
import { FormModal } from '../../components/shared/FormModal';
import { FileUpload } from '../../components/shared/FileUpload';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const PublicationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    type: 'Journal' as PublicationType,
    venue: '',
    year: 2026,
    doi: '',
    keywords: 'AI, Machine Learning, Protein Folding',
  });

  const { data: publicationsData, loading, error, reload } = useAsyncData(() =>
    publicationService.getAll()
  );
  useEffect(() => {
    if (publicationsData) setPublications(publicationsData);
  }, [publicationsData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPub = await publicationService.create({
      title: formData.title,
      abstract: formData.abstract,
      type: formData.type,
      status: 'Submitted',
      authors: [
        { researcherId: 'res-1', name: 'Dr. Sarah Chen', institutionName: 'MIT', role: 'Lead Author' },
        { researcherId: 'res-2', name: 'Prof. James Wilson', institutionName: 'Stanford', role: 'Co-Author' },
      ],
      venue: formData.venue || 'Nature Scientific Reports',
      publicationDate: '2026-10-02',
      year: Number(formData.year),
      doi: formData.doi,
      citations: 0,
      keywords: formData.keywords.split(',').map((s) => s.trim()),
    });

    setPublications([newPub, ...publications]);
    setIsModalOpen(false);
  };

  const columns: Column<Publication>[] = [
    {
      header: 'Title & Venue',
      accessorKey: 'title',
      sortable: true,
      cell: (row) => (
        <div className="max-w-md">
          <p
            onClick={() => navigate(`/publications/${row.id}`)}
            className="font-bold text-foreground hover:text-primary hover:underline cursor-pointer line-clamp-1"
          >
            {row.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {row.venue} • <span className="font-semibold">{row.year}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-muted text-muted-foreground border border-border">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Authors',
      cell: (row) => (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {row.authors.map((a) => a.name).join(', ')}
        </p>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'DOI Link',
      accessorKey: 'doi',
      cell: (row) => (
        <a
          href={`https://doi.org/${row.doi}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
        >
          {row.doi.substring(0, 16)}... <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      header: 'Citations',
      accessorKey: 'citations',
      sortable: true,
      cell: (row) => <span className="font-extrabold text-foreground">{row.citations}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Publications Repository</h2>
          <p className="text-xs text-muted-foreground">Centralized repository of manuscripts, journal papers, patents, and technical reports</p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButtons
            filename="publications_repository"
            data={publications.map((p) => ({
              Title: p.title,
              Type: p.type,
              Status: p.status,
              Venue: p.venue,
              Year: p.year,
              DOI: p.doi,
              Citations: p.citations,
              LeadAuthor: p.authors[0]?.name || 'N/A',
            }))}
            pdfTitle="Scientific Publications Repository"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Manuscript
          </button>
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Data Table */}
      <DataTable
        data={publications}
        columns={columns}
        searchPlaceholder="Search papers by title, keyword, author, or DOI..."
        filterOptions={[
          {
            key: 'type',
            label: 'Publication Type',
            options: [
              { label: 'Journal', value: 'Journal' },
              { label: 'Conference', value: 'Conference' },
              { label: 'Book', value: 'Book' },
              { label: 'Patent', value: 'Patent' },
              { label: 'Technical Report', value: 'Technical Report' },
            ],
          },
          {
            key: 'status',
            label: 'Publication Status',
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Submitted', value: 'Submitted' },
              { label: 'Published', value: 'Published' },
              { label: 'Archived', value: 'Archived' },
            ],
          },
        ]}
        onRowClick={(row) => navigate(`/publications/${row.id}`)}
      />

      {/* Add Manuscript Modal Form */}
      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit New Manuscript">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Manuscript Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Coherent Quantum Computation in Superconducting Circuits"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Publication Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              >
                <option value="Journal">Journal Paper</option>
                <option value="Conference">Conference Paper</option>
                <option value="Book">Book Chapter</option>
                <option value="Patent">Patent Application</option>
                <option value="Technical Report">Technical Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Journal / Venue</label>
              <input
                type="text"
                required
                placeholder="e.g. Nature Machine Intelligence"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Abstract</label>
            <textarea
              rows={4}
              required
              placeholder="Provide detailed research abstract..."
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Upload Manuscript File</label>
            <FileUpload />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-border">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground">
              Submit Manuscript
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
