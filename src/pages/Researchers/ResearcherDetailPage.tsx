import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Building2, Network } from 'lucide-react';
import { researcherService } from '../../services/researcherService';
import { mockDataStore } from '../../services/dataStore';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CollaborationGraph } from '../../components/shared/CollaborationGraph';

export const ResearcherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profileQuery = useAsyncData(
    () => (id ? researcherService.getById(id) : Promise.resolve(undefined)),
    [id]
  );
  const pubsQuery = useAsyncData(() => mockDataStore.getPublications(), []);
  const graphQuery = useAsyncData(() => mockDataStore.getCollaborationGraph(), []);

  const researcher = profileQuery.data ?? null;
  const pubs = useMemo(
    () => (pubsQuery.data ?? []).filter((p) => p.authors.some((a) => a.researcherId === id)),
    [pubsQuery.data, id]
  );
  const graphData = useMemo(() => {
    const g = graphQuery.data;
    if (!g || !id) return { nodes: [] as any[], links: [] as any[] };
    const relLinks = g.links.filter((l) => l.source === id || l.target === id);
    const connectedIds = new Set<string>([id, ...relLinks.map((l) => (l.source === id ? l.target : l.source))]);
    return { nodes: g.nodes.filter((n) => connectedIds.has(n.id)), links: relLinks };
  }, [graphQuery.data, id]);

  if (profileQuery.loading) {
    return <div className="p-8"><AsyncState loading /></div>;
  }
  if (profileQuery.error) {
    return <div className="p-8"><AsyncState error={profileQuery.error} onRetry={profileQuery.reload} /></div>;
  }
  if (!researcher) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Researcher not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/researchers')}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Researchers Directory
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img src={researcher.avatarUrl} alt={researcher.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground">{researcher.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Joined {researcher.joinedYear}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{researcher.title}</p>
            <p className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {researcher.institutionName} • {researcher.department}
            </p>
          </div>
        </div>

        {/* Impact Badges */}
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
          <div className="text-center px-3 border-r border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Publications</p>
            <p className="text-lg font-extrabold text-foreground">{researcher.publicationsCount}</p>
          </div>
          <div className="text-center px-3 border-r border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Citations</p>
            <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{researcher.citationsCount}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">h-Index</p>
            <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{researcher.hIndex}</p>
          </div>
        </div>
      </div>

      {/* Grid: Bio, Skills & Mini Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Skills */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Biography & Affiliations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{researcher.bio}</p>

            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Primary Skills & Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {researcher.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Research Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {researcher.researchInterests.map((interest, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-muted text-muted-foreground">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {researcher.orcid && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">ORCID iD:</span>
                <a href={`https://orcid.org/${researcher.orcid}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  {researcher.orcid} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Collaboration Graph & Publications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mini Collaboration Network Graph */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Co-Authorship Collaboration Network</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">{graphData.nodes.length} Connected Authors</span>
            </div>
            <CollaborationGraph nodes={graphData.nodes} links={graphData.links} height={320} />
          </div>

          {/* Publications List */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-4">Authored & Co-Authored Publications ({pubs.length})</h3>
            <div className="space-y-3">
              {pubs.map((pub) => (
                <div key={pub.id} className="p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">{pub.type}</span>
                    <StatusBadge status={pub.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground cursor-pointer hover:underline" onClick={() => navigate(`/publications/${pub.id}`)}>
                    {pub.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{pub.abstract}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <span>{pub.venue} ({pub.year})</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{pub.citations} Citations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
