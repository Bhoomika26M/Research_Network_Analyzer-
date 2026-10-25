import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { TagInput } from '../../components/Modals/FormModal'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`toggle ${on ? 'toggle--on' : ''}`}>
      <span className="toggle-knob" />
    </button>
  )
}

const inputCls = 'px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors w-full'
const labelCls = 'block text-xs font-medium text-[#64748B] mb-1.5'

interface SystemConfigState {
  platformName: string
  timezone: string
  dateFormat: string
  language: string
  defaultRole: string
  requireApproval: boolean
  publicSearch: boolean
  maxUpload: string
  fileTypes: string[]
  autoArchive: boolean
  archiveYears: string
}

const defaultConfig: SystemConfigState = {
  platformName: 'SciCollab',
  timezone: 'UTC',
  dateFormat: 'DD/MM/YYYY',
  language: 'English',
  defaultRole: 'Researcher',
  requireApproval: true,
  publicSearch: true,
  maxUpload: '25 MB',
  fileTypes: ['PDF', 'DOCX', 'XLSX'],
  autoArchive: false,
  archiveYears: '5',
}

const STORAGE_KEY = 'scicollab_system_config'

export default function SystemConfig() {
  const { showToast } = useToast()

  const [config, setConfig] = useState<SystemConfigState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) }
    } catch {
      // fallback
    }
    return defaultConfig
  })

  const saveConfig = (updated: SystemConfigState, message: string) => {
    setConfig(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    showToast(message, 'success')
  }

  const handleReset = () => {
    saveConfig(defaultConfig, 'System configuration restored to defaults')
  }

  return (
    <div className="p-8 max-w-[760px]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">System Admin / Configuration</span>
          </span>
          <h1 className="font-display text-3xl text-[#0F172A]">System Configuration</h1>
          <p className="text-[#64748B] mt-1">Manage platform-wide settings and system defaults</p>
        </div>
        <button
          onClick={handleReset}
          className="px-3.5 py-2 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      <div className="space-y-6">
        {/* Card 1 — General Settings */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              General Settings
            </span>
          </div>

          <div>
            <label className={labelCls}>Platform Name</label>
            <input
              value={config.platformName}
              onChange={e => setConfig(prev => ({ ...prev, platformName: e.target.value }))}
              className={inputCls}
              placeholder="e.g. SciCollab"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Default Timezone</label>
              <select
                value={config.timezone}
                onChange={e => setConfig(prev => ({ ...prev, timezone: e.target.value }))}
                className={inputCls}
              >
                {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date Format</label>
              <select
                value={config.dateFormat}
                onChange={e => setConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                className={inputCls}
              >
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Default Language</label>
            <select
              value={config.language}
              onChange={e => setConfig(prev => ({ ...prev, language: e.target.value }))}
              className={inputCls}
            >
              {['English', 'French', 'German', 'Japanese', 'Spanish'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveConfig(config, 'General settings saved successfully')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 2 — Role & Access Defaults */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Role &amp; Access Defaults
          </span>

          <div>
            <label className={labelCls}>Default Role for New Users</label>
            <select
              value={config.defaultRole}
              onChange={e => setConfig(prev => ({ ...prev, defaultRole: e.target.value }))}
              className={inputCls}
            >
              {['Researcher', 'Reviewer'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Require Admin Approval for New Institutions</p>
              <p className="text-xs text-[#64748B] mt-0.5">New institution registrations must be approved by a system admin</p>
            </div>
            <Toggle
              on={config.requireApproval}
              onToggle={() => setConfig(prev => ({ ...prev, requireApproval: !prev.requireApproval }))}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Allow Public Profile Search</p>
              <p className="text-xs text-[#64748B] mt-0.5">Allow unauthenticated users to search researcher profiles</p>
            </div>
            <Toggle
              on={config.publicSearch}
              onToggle={() => setConfig(prev => ({ ...prev, publicSearch: !prev.publicSearch }))}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveConfig(config, 'Access settings saved successfully')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 3 — Data & Storage */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Data &amp; Storage
          </span>

          <div>
            <label className={labelCls}>Max Upload Size</label>
            <select
              value={config.maxUpload}
              onChange={e => setConfig(prev => ({ ...prev, maxUpload: e.target.value }))}
              className={inputCls}
            >
              {['5 MB', '10 MB', '25 MB', '50 MB', '100 MB'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Allowed File Types</label>
            <TagInput
              tags={config.fileTypes}
              onChange={types => setConfig(prev => ({ ...prev, fileTypes: types }))}
              placeholder="e.g. PDF, DOCX"
            />
            <p className="text-xs text-[#94A3B8] mt-1">Type a file extension and press Enter or comma to add</p>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Auto-archive publications</p>
              <p className="text-xs text-[#64748B] mt-0.5">Automatically archive publications after a set number of years</p>
            </div>
            <Toggle
              on={config.autoArchive}
              onToggle={() => setConfig(prev => ({ ...prev, autoArchive: !prev.autoArchive }))}
            />
          </div>

          {config.autoArchive && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#64748B] whitespace-nowrap">Auto-archive after</label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.archiveYears}
                onChange={e => setConfig(prev => ({ ...prev, archiveYears: e.target.value }))}
                className="w-24 px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
              />
              <span className="text-sm text-[#64748B]">years</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveConfig(config, 'Storage settings saved successfully')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
