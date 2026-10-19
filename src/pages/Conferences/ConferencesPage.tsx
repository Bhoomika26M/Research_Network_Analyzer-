import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, CalendarDays } from 'lucide-react';
import { conferenceService } from '../../services/conferenceService';
import { Conference } from '../../types';
import { FormModal } from '../../components/shared/FormModal';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const ConferencesPage: React.FC = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [paperTitle, setPaperTitle] = useState('');

  const { data: conferencesData, loading, error, reload } = useAsyncData(() =>
    conferenceService.getAll()
  );
  useEffect(() => {
    if (conferencesData) setConferences(conferencesData);
  }, [conferencesData]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConf) return;

    const updated = await conferenceService.register(
      selectedConf.id,
      'res-1',
      'Dr. Sarah Chen',
      paperTitle
    );

    setConferences(conferences.map((c) => (c.id === updated.id ? updated : c)));
    setIsModalOpen(false);
    setPaperTitle('');
  };

  return (
    <div className="space-y-6">
      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Academic Conferences & Symposia</h2>
          <p className="text-xs text-muted-foreground">Browse upcoming international conferences, submit papers, and manage participation schedules</p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl border border-border bg-muted/30">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'calendar' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* List View of Conferences */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.map((conf) => (
            <div key={conf.id} className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {conf.acronym}
                  </span>
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due: {conf.submissionDeadline}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-foreground leading-tight">{conf.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {conf.location}, {conf.city}, {conf.country}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> {conf.startDate} to {conf.endDate}
                </p>

                {/* Tracks */}
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Tracks:</p>
                  <div className="flex flex-wrap gap-1">
                    {conf.tracks.map((track, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        {track}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{conf.acceptedPapersCount}</strong> Accepted Papers
                </span>

                <button
                  onClick={() => {
                    setSelectedConf(conf);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Register Paper
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar Schedule View */
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">2026 Academic Event Calendar & Schedule</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conferences.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">{c.acronym}</span>
                  <span className="text-[10px] text-muted-foreground">{c.startDate}</span>
                </div>
                <p className="text-xs font-bold text-foreground">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.city}, {c.country}</p>

                {c.schedule.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Keynote Sessions:</p>
                    {c.schedule.map((s) => (
                      <div key={s.id} className="text-[10px] text-foreground bg-card p-1.5 rounded border border-border">
                        <p className="font-bold truncate">{s.title}</p>
                        <p className="text-muted-foreground">{s.time} • Speaker: {s.speaker}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Modal Form */}
      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Register for ${selectedConf?.acronym}`}>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Conference Name</label>
            <input type="text" disabled value={selectedConf?.title || ''} className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted text-muted-foreground" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Submitted Manuscript Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Scalable Quantum Algorithms in Superconducting Transmons"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-border">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground">
              Confirm Registration
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
