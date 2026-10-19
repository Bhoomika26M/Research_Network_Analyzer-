import React from 'react';
import { BookOpen, Server } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">Platform Documentation & Manual</h2>
        <p className="text-xs text-muted-foreground">User guides, FastAPI integration instructions, and system architecture details</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" /> Backend FastAPI Integration Guide
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The frontend is designed with an API-ready service layer located in <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">src/services/</code>. To switch from the mock data layer to a real FastAPI REST server:
        </p>

        <div className="bg-muted/50 p-4 rounded-xl text-xs font-mono border border-border space-y-2">
          <p className="text-primary font-bold"># 1. Update environment variables in .env</p>
          <p className="text-muted-foreground">VITE_API_URL=http://localhost:8000/api/v1</p>

          <p className="text-primary font-bold mt-2"># 2. Endpoints expected by apiClient.ts</p>
          <p className="text-muted-foreground">POST /auth/login {'->'} {"{ access_token: string, token_type: 'bearer' }"}</p>
          <p className="text-muted-foreground">GET  /researchers {'->'} Researcher[]</p>
          <p className="text-muted-foreground">GET  /publications {'->'} Publication[]</p>
          <p className="text-muted-foreground">GET  /collaboration/graph {'->'} CollaborationGraphData</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Platform Module Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <p className="font-bold text-foreground mb-1">Co-Authorship Graph</p>
            <p className="text-muted-foreground">Interactive D3 force-directed visualization showing inter-institutional collaborator links.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <p className="font-bold text-foreground mb-1">Reports & Export</p>
            <p className="text-muted-foreground">Export custom datasets directly to Excel (.xlsx) and PDF formatted documents using SheetJS & jsPDF.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <p className="font-bold text-foreground mb-1">DOI Resolver</p>
            <p className="text-muted-foreground">Built-in DOI regex validator linking out to official doi.org resolution endpoints.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <p className="font-bold text-foreground mb-1">Role-Based Views</p>
            <p className="text-muted-foreground">4 role perspectives: Researcher, Institution Admin, Reviewer, System Admin with active role switcher.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
