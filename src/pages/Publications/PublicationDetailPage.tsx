import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, User, History } from 'lucide-react';
import { publicationService } from '../../services/publicationService';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { Publication, PublicationStatus } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const PublicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsyncData(
    () => (id ? publicationService.getById(id) : Promise.resolve(undefined)),
    [id]
  );
  const [publication, setPublication] = useState<Publication | null>(null);

  useEffect(() => {
    setPublication(data ?? null);
  }, [data]);

  const handleStatusChange = async (newStatus: PublicationStatus) => {
    if (!publication) return;
    const updated = await publicationService.updateStatus(
      publication.id,
      newStatus,
      'Dr. Sarah Chen',
      `Changed publication status to ${newStatus}`
    );
    setPublication({ ...updated });
  };

  if (loading) {
    return <div className="p-8"><AsyncState loading /></div>;
  }
  if (error) {
    return <div className="p-8"><AsyncState error={error} onRetry={reload} /></div>;
  }
  if (!publication) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Publication not found.</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/publications')}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Publications Repository
      </button>

      {/* Main Publication Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              {publication.type}
            </span>
            <span className="text-xs text-muted-foreground">{publication.venue} ({publication.year})</span>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={publication.status} />

            {/* Quick Status Updater */}
            <select
              value={publication.status}
              onChange={(e) => handleStatusChange(e.target.value as PublicationStatus)}
              className="text-xs border border-border bg-background rounded-lg px-2.5 py-1 font-semibold focus:outline-none"
            >
              <option value="Draft">Set Draft</option>
              <option value="Submitted">Set Submitted</option>
              <option value="Published">Set Published</option>
              <option value="Archived">Set Archived</option>
            </select>
          </div>
        </div>

        <h1 className="text-xl font-extrabold text-foreground leading-snug">{publication.title}</h1>

        {/* DOI & Citation Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            DOI:{' '}
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              {publication.doi} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </span>
          <span className="text-muted-foreground">
            Citations: <strong className="text-purple-600 dark:text-purple-400">{publication.citations}</strong>
          </span>
          {publication.downloadUrl && (
            <a
              href={publication.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-500/20 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Manuscript PDF ({publication.fileSize || '3.2 MB'})
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Abstract & Authors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground">Abstract</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{publication.abstract}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-4">Co-Authors & Affiliations</h3>
            <div className="space-y-3">
              {publication.authors.map((author, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{author.name}</p>
                      <p className="text-[10px] text-muted-foreground">{author.institutionName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                    {author.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Publication History Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Status History & Audit</h3>
          </div>

          <div className="relative pl-4 border-l-2 border-border space-y-6 my-2">
            {publication.history.map((entry, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                <div className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{entry.status}</span>
                    <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{entry.notes}</p>
                  <p className="text-[9px] font-semibold text-primary mt-1">By: {entry.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
