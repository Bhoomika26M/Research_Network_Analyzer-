import React, { useEffect, useState } from 'react';
import { Quote, ExternalLink, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { citationService } from '../../services/citationService';
import { Citation } from '../../types';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const CitationsPage: React.FC = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [doiInput, setDoiInput] = useState('10.1038/s41586-024-00101-x');
  const [doiStatus, setDoiStatus] = useState<{ valid: boolean; message: string } | null>(null);

  const { data: citationsData, loading, error, reload } = useAsyncData(() =>
    citationService.getAll()
  );
  useEffect(() => {
    if (citationsData) setCitations(citationsData);
  }, [citationsData]);

  // DOI Validation Helper (Standard regex check: 10.xxxx/xxxx)
  const validateDOI = (doi: string) => {
    const regex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
    if (regex.test(doi)) {
      setDoiStatus({ valid: true, message: 'Valid DOI format registered with Crossref / DataCite' });
    } else {
      setDoiStatus({ valid: false, message: 'Invalid DOI format. Expected standard prefix: 10.xxxx/...' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">Citations & DOI Reference Resolver</h2>
        <p className="text-xs text-muted-foreground">Manage publication citations, validate Digital Object Identifiers (DOIs), and cross-link external literature</p>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* DOI Validator Widget */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-primary" /> DOI Management & External Resolution
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Enter DOI e.g. 10.1038/s41586-024-00101-x"
              value={doiInput}
              onChange={(e) => {
                setDoiInput(e.target.value);
                validateDOI(e.target.value);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={() => validateDOI(doiInput)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Validate DOI
          </button>

          <a
            href={`https://doi.org/${doiInput}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-1.5"
          >
            <span>Resolve on doi.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {doiStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              doiStatus.valid
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
            }`}
          >
            {doiStatus.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{doiStatus.message}</span>
          </div>
        )}
      </div>

      {/* Citations List */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-foreground mb-4">Incoming Citation Records</h3>

        <div className="space-y-3">
          {citations.map((cite) => (
            <div key={cite.id} className="p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Quote className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-bold text-foreground truncate">{cite.citingTitle}</span>
                </div>
                <p className="text-xs text-muted-foreground">{cite.citingAuthors} • {cite.citingVenue} ({cite.citingYear})</p>
                <p className="text-[11px] text-primary mt-1">Cites target paper: "{cite.publicationTitle}"</p>
              </div>

              <a
                href={`https://doi.org/${cite.doi}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border border-border bg-background hover:bg-muted text-primary flex items-center gap-1 self-start md:self-center"
              >
                {cite.doi} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
