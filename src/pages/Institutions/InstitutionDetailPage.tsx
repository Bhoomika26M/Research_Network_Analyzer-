import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe } from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { mockDataStore } from '../../services/dataStore';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const InstitutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const instQuery = useAsyncData(
    () => (id ? institutionService.getById(id) : Promise.resolve(undefined)),
    [id]
  );
  const facultyQuery = useAsyncData(() => mockDataStore.getResearchers(), []);
  const projectsQuery = useAsyncData(() => mockDataStore.getProjects(), []);

  const inst = instQuery.data ?? null;
  const faculty = (facultyQuery.data ?? []).filter((r) => r.institutionId === id);
  const projects = (projectsQuery.data ?? []).filter((p) => p.institutionId === id);

  if (instQuery.loading) {
    return <div className="p-8"><AsyncState loading /></div>;
  }
  if (instQuery.error) {
    return <div className="p-8"><AsyncState error={instQuery.error} onRetry={instQuery.reload} /></div>;
  }
  if (!inst) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Institution not found.</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/institutions')}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Institutions Directory
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 mb-2 inline-block">
            {inst.type}
          </span>
          <h1 className="text-2xl font-extrabold text-foreground">{inst.name} ({inst.shortName})</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-rose-500" /> {inst.city}, {inst.country} •{' '}
            <a href={inst.website} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline flex items-center gap-1">
              {inst.website} <Globe className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
          <div className="text-center px-3 border-r border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Faculty</p>
            <p className="text-lg font-extrabold text-foreground">{inst.researcherCount}</p>
          </div>
          <div className="text-center px-3 border-r border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Pubs</p>
            <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{inst.publicationCount}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Annual Budget</p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${(inst.budget / 1000000).toFixed(0)}M</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliated Faculty */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-foreground mb-4">Affiliated Scholars & Faculty ({faculty.length})</h3>
          <div className="space-y-3">
            {faculty.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/researchers/${f.id}`)}
                className="p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={f.avatarUrl} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.title}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">h-{f.hIndex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-foreground mb-4">Active Research Projects ({projects.length})</h3>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{p.code}</span>
                  <span className="text-xs font-bold text-foreground">${(p.budget / 1000).toFixed(0)}k</span>
                </div>
                <p className="text-xs font-bold text-foreground">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Lead: {p.leadResearcherName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
