import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Quote, Award, Grid, List, ChevronRight } from 'lucide-react';
import { researcherService } from '../../services/researcherService';
import { ExportButtons } from '../../components/shared/ExportButtons';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const ResearchersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: researchersData, loading, error, reload } = useAsyncData(() =>
    researcherService.getAll()
  );
  const researchers = researchersData ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInst, setSelectedInst] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredResearchers = useMemo(() => {
    return researchers.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesInst = selectedInst === 'all' || r.institutionName === selectedInst;
      return matchesSearch && matchesInst;
    });
  }, [researchers, searchTerm, selectedInst]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Researchers Directory</h2>
          <p className="text-xs text-muted-foreground">Discover affiliated scholars, faculty, and cross-institutional collaborators</p>
        </div>
        <ExportButtons
          filename="researchers_directory"
          data={filteredResearchers.map((r) => ({
            Name: r.name,
            Title: r.title,
            Institution: r.institutionName,
            Department: r.department,
            'Publications Count': r.publicationsCount,
            Citations: r.citationsCount,
            'h-Index': r.hIndex,
            ORCID: r.orcid || 'N/A',
          }))}
          pdfTitle="Scientific Network - Researchers Directory"
        />
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, department, or skill (e.g., Quantum, CRISPR)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Institution Filter & View Toggle */}
        <div className="flex items-center gap-3">
          <select
            value={selectedInst}
            onChange={(e) => setSelectedInst(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
          >
            <option value="all">All Institutions</option>
            <option value="Massachusetts Institute of Technology">MIT</option>
            <option value="Stanford University">Stanford</option>
            <option value="ETH Zürich">ETH Zürich</option>
            <option value="University of Oxford">Oxford</option>
            <option value="Max Planck Institute for Intelligent Systems">Max Planck</option>
            <option value="CERN European Laboratory for Particle Physics">CERN</option>
          </select>

          <div className="flex items-center p-1 rounded-xl border border-border bg-muted/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResearchers.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/researchers/${r.id}`)}
              className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img src={r.avatarUrl} alt={r.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{r.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{r.title}</p>
                    <p className="text-[10px] font-semibold text-primary truncate mt-0.5">{r.institutionName}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-xs">
                  <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Dept:</strong> {r.department}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-blue-500" /> {r.publicationsCount} Pubs</span>
                <span className="flex items-center gap-1"><Quote className="w-3.5 h-3.5 text-purple-500" /> {r.citationsCount} Cites</span>
                <span className="flex items-center gap-1 font-bold text-foreground"><Award className="w-3.5 h-3.5 text-amber-500" /> h-{r.hIndex}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border font-bold uppercase text-muted-foreground">
              <tr>
                <th className="p-3.5">Researcher</th>
                <th className="p-3.5">Institution & Department</th>
                <th className="p-3.5">Skills</th>
                <th className="p-3.5 text-center">Pubs</th>
                <th className="p-3.5 text-center">Citations</th>
                <th className="p-3.5 text-center">h-Index</th>
                <th className="p-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredResearchers.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/researchers/${r.id}`)} className="hover:bg-muted/40 cursor-pointer">
                  <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                    <img src={r.avatarUrl} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                    <span>{r.name}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-foreground">{r.institutionName}</p>
                    <p className="text-[10px] text-muted-foreground">{r.department}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {r.skills.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-foreground">{r.publicationsCount}</td>
                  <td className="p-3.5 text-center font-bold text-foreground">{r.citationsCount}</td>
                  <td className="p-3.5 text-center font-bold text-primary">h-{r.hIndex}</td>
                  <td className="p-3.5 text-right">
                    <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
