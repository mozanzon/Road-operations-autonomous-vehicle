import React, { useState } from 'react';
import {
  Wifi, Gamepad2, FileBarChart2, Settings, Menu, X, Bot, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { RobotProvider, useRobot } from './context/RobotContext';
import { EmergencyStop } from './components/EmergencyStop';
import { ConnectionTab } from './components/tabs/ConnectionTab';
import { ControlTab } from './components/tabs/ControlTab';
import { ReportingTab } from './components/tabs/ReportingTab';
import { PreferencesTab } from './components/tabs/PreferencesTab';

type TabId = 'connection' | 'control' | 'reporting' | 'preferences';

const TABS: { id: TabId; label: string; shortLabel: string; Icon: React.ComponentType<any> }[] = [
  { id: 'connection', label: 'Connection', shortLabel: 'CONN', Icon: Wifi },
  { id: 'control', label: 'Operations', shortLabel: 'OPS', Icon: Gamepad2 },
  { id: 'reporting', label: 'Reporting', shortLabel: 'REPT', Icon: FileBarChart2 },
  { id: 'preferences', label: 'Preferences', shortLabel: 'PREF', Icon: Settings },
];

function StatusDot() {
  const { connectionStatus } = useRobot();
  const config = {
    connected: 'bg-green-400',
    disconnected: 'bg-red-500',
    attempting: 'bg-amber-400 animate-pulse',
  }[connectionStatus];
  return <span className={`h-2.5 w-2.5 rounded-full inline-block ${config}`} />;
}

function AppContent() {
  const { isDark, theme } = useTheme();
  const { connectionStatus, battery } = useRobot();
  const [activeTab, setActiveTab] = useState<TabId>('control');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [railPinned, setRailPinned] = useState(false);
  const [railHover, setRailHover] = useState(false);

  const statusLabel = {
    connected: 'CONNECTED',
    disconnected: 'OFFLINE',
    attempting: 'CONNECTING…',
  }[connectionStatus];

  const statusColor = {
    connected: 'text-green-400',
    disconnected: 'text-red-400',
    attempting: 'text-amber-400',
  }[connectionStatus];

  const bg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';
  const sidebarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const headerBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const activeTab_ = isDark
    ? 'bg-amber-500/15 text-amber-400 border-r-2 border-amber-500'
    : 'bg-amber-50 text-amber-700 border-r-2 border-amber-500';
  const inactiveTab = isDark
    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700';
  const railOpen = railPinned || railHover;

  return (
    <div className={`${bg} min-h-screen flex flex-col`}>
      {/* Top Header */}
      <header className={`${headerBg} border-b shrink-0 flex items-center gap-3 px-4 h-14 z-40 relative`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <Bot className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold font-mono tracking-tight leading-none">ROAD INSPECTOR</div>
            <div className="text-xs text-slate-500 font-mono leading-none mt-0.5">Autonomous Robot Control</div>
          </div>
        </div>

        {/* Status + battery */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <StatusDot />
            <span className={`text-xs font-mono font-semibold tracking-wider ${statusColor}`}>{statusLabel}</span>
          </div>
          {connectionStatus === 'connected' && (
            <div className={`hidden sm:flex items-center gap-1.5 text-xs font-mono ${
              battery > 40 ? 'text-green-400' : battery > 20 ? 'text-amber-400' : 'text-red-400'
            }`}>
              <span>{battery.toFixed(0)}%</span>
            </div>
          )}
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Tab Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden absolute top-14 left-0 right-0 z-50 ${sidebarBg} border-b shadow-2xl`}>
          <nav className="p-2 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono font-semibold tracking-wider transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside
          className={`hidden md:flex shrink-0 flex-col border-r ${sidebarBg} transition-[width] duration-200 ${railOpen ? 'w-56' : 'w-16'}`}
          onMouseEnter={() => setRailHover(true)}
          onMouseLeave={() => setRailHover(false)}
        >
          <div className="flex h-12 items-center justify-center border-b border-slate-800/70">
            <button
              type="button"
              onClick={() => setRailPinned(!railPinned)}
              className={`rounded-lg p-2 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              title={railPinned ? 'Collapse tabs' : 'Keep tabs open'}
            >
              {railPinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>
          <nav className="space-y-1 p-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-mono font-semibold tracking-wider transition-all ${
                  activeTab === tab.id ? activeTab_ : inactiveTab
                }`}
                title={railOpen ? undefined : tab.label}
              >
                <tab.Icon className="h-4 w-4 shrink-0" />
                {railOpen && <span className="truncate">{tab.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Tab title strip */}
          <div className="flex items-center gap-3 mb-5">
            {(() => {
              const tab = TABS.find(t => t.id === activeTab)!;
              return (
                <>
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <tab.Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h1 className={`text-base font-semibold font-mono tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{tab.label}</h1>
                  </div>
                  <div className={`ml-auto text-xs font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    {new Date().toLocaleTimeString()} · Egypt Standard Time
                  </div>
                </>
              );
            })()}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'connection' && <ConnectionTab />}
            {activeTab === 'control' && <ControlTab />}
            {activeTab === 'reporting' && <ReportingTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
          </div>
        </main>
      </div>

      {/* Emergency Stop — always on top */}
      <EmergencyStop />

      {/* CSS for map container height */}
      <style>{`
        .leaflet-container { font-family: monospace; }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RobotProvider>
        <AppWrapper />
      </RobotProvider>
    </ThemeProvider>
  );
}

// This wrapper applies the dark class based on theme
function AppWrapper() {
  const { isDark } = useTheme();
  return (
    <div className={isDark ? 'dark' : ''} style={{ minHeight: '100vh' }}>
      <AppContent />
    </div>
  );
}
