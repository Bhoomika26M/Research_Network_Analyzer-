import { Building2, Globe, Users, FileText, TrendingUp, MapPin, ExternalLink } from 'lucide-react'

const institutions = [
  { name: 'MIT', full: 'Massachusetts Institute of Technology', country: 'USA', flag: '🇺🇸', researchers: 8420, publications: 12847, hIndex: 284, rank: 1, color: '#2563EB', type: 'University', founded: 1861 },
  { name: 'Stanford', full: 'Stanford University', country: 'USA', flag: '🇺🇸', researchers: 7890, publications: 11234, hIndex: 271, rank: 2, color: '#7C3AED', type: 'University', founded: 1885 },
  { name: 'Oxford', full: 'University of Oxford', country: 'UK', flag: '🇬🇧', researchers: 6340, publications: 9871, hIndex: 258, rank: 3, color: '#14B8A6', type: 'University', founded: 1096 },
  { name: 'ETH Zürich', full: 'Swiss Federal Institute of Technology', country: 'Switzerland', flag: '🇨🇭', researchers: 5120, publications: 8234, hIndex: 239, rank: 4, color: '#F59E0B', type: 'University', founded: 1855 },
  { name: 'NIH', full: 'National Institutes of Health', country: 'USA', flag: '🇺🇸', researchers: 4230, publications: 7891, hIndex: 312, rank: 5, color: '#EC4899', type: 'Government Lab', founded: 1887 },
  { name: 'CERN', full: 'European Organization for Nuclear Research', country: 'Switzerland', flag: '🇨🇭', researchers: 3780, publications: 6123, hIndex: 298, rank: 6, color: '#10B981', type: 'Research Lab', founded: 1954 },
]

export default function Institutions() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Institutions', value: '1,847', icon: Building2, color: '#2563EB' },
          { label: 'Countries', value: '94', icon: Globe, color: '#14B8A6' },
          { label: 'Research Labs', value: '423', icon: TrendingUp, color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {institutions.map(inst => (
          <div key={inst.name} className="bg-card rounded-2xl border border-border overflow-hidden card-hover cursor-pointer">
            <div className="h-1.5" style={{ backgroundColor: inst.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-secondary border border-border">
                    {inst.flag}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{inst.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{inst.type} · Est. {inst.founded}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground/70 bg-secondary px-2 py-1 rounded-lg">#{inst.rank}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{inst.full}</p>

              <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {inst.country}
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 border-t border-border mb-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{(inst.researchers / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground/70">Researchers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{(inst.publications / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground/70">Publications</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{inst.hIndex}</p>
                  <p className="text-xs text-muted-foreground/70">h-index</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-border text-foreground/80 hover:bg-secondary/60 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> View Institution Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
