import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { Institution } from '../../types';
import { ExportButtons } from '../../components/shared/ExportButtons';
import { FormModal } from '../../components/shared/FormModal';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const InstitutionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    country: 'United States',
    city: '',
    type: 'University' as Institution['type'],
    website: '',
    description: '',
    budget: 10000000,
  });

  const { data: institutionsData, loading, error, reload } = useAsyncData(() =>
    institutionService.getAll()
  );
  useEffect(() => {
    if (institutionsData) setInstitutions(institutionsData);
  }, [institutionsData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newInst = await institutionService.create({
      ...formData,
      departments: ['Computer Science', 'Physics', 'Biology'],
      researcherCount: 1,
      publicationCount: 0,
      activeProjectsCount: 0,
      isActive: true,
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
    });
    setInstitutions([newInst, ...institutions]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Institutions & Universities</h2>
          <p className="text-xs text-muted-foreground">Manage partner research organizations, universities, and government labs</p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButtons
            filename="institutions_report"
            data={institutions.map((i) => ({
              Name: i.name,
              Abbreviation: i.shortName,
              Country: i.country,
              City: i.city,
              Type: i.type,
              FacultyCount: i.researcherCount,
              Publications: i.publicationCount,
              BudgetUSD: i.budget,
            }))}
            pdfTitle="Scientific Network - Partner Institutions"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Institution
          </button>
        </div>
      </div>

      {/* Grid of Institutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            onClick={() => navigate(`/institutions/${inst.id}`)}
            className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 mb-2 inline-block">
                    {inst.type}
                  </span>
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {inst.name} ({inst.shortName})
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {inst.city}, {inst.country}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{inst.description}</p>

              <div className="space-y-1.5 mb-4">
                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Departments:</p>
                <div className="flex flex-wrap gap-1">
                  {inst.departments.map((dept, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-medium">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-[10px] text-muted-foreground">Faculty</p>
                <p className="font-bold text-foreground">{inst.researcherCount}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-[10px] text-muted-foreground">Pubs</p>
                <p className="font-bold text-foreground">{inst.publicationCount}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded-lg">
                <p className="text-[10px] text-muted-foreground">Budget</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">${(inst.budget / 1000000).toFixed(0)}M</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal for Creating Institution */}
      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Partner Institution">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Full Institution Name</label>
            <input
              type="text"
              required
              placeholder="e.g. California Institute of Technology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Abbreviation (Short Name)</label>
              <input
                type="text"
                required
                placeholder="Caltech"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Institution Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              >
                <option value="University">University</option>
                <option value="Research Institute">Research Institute</option>
                <option value="Government Lab">Government Lab</option>
                <option value="Publisher">Publisher</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">City</label>
              <input
                type="text"
                required
                placeholder="Pasadena"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Country</label>
              <input
                type="text"
                required
                placeholder="United States"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-border">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground">
              Save Institution
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
