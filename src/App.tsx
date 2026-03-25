import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu,
  X,
  LayoutDashboard, 
  ShieldAlert, 
  FileCheck, 
  Users, 
  Wifi, 
  WifiOff, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Smartphone,
  Radio,
  Loader2,
  MessageSquare,
  Send,
  History,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type UserRole = 'Admin' | 'Executive' | 'Operations' | 'Humanitarian' | 'MEAL';
type DashboardView = 'Dashboard' | 'LGAs' | 'AuditPacks' | 'MAMI' | 'ActivityLog' | 'Help';

interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical';
}

interface StaffProfile {
  name: string;
  role: UserRole;
  title: string;
  focus: string;
}

const STAFF_PROFILES: Record<UserRole, StaffProfile> = {
  Admin: {
    name: 'Wilson Kipkoech',
    role: 'Admin',
    title: 'Emergency Coordinator',
    focus: 'Security alerts and ward-level oversight'
  },
  Executive: {
    name: 'Akin Kikonda',
    role: 'Executive',
    title: 'Country Representative',
    focus: 'CP-wide budget and donor compliance'
  },
  Operations: {
    name: 'Amana Effiong',
    role: 'Operations',
    title: 'Program Director, ACCESS',
    focus: 'Field activity tracking'
  },
  Humanitarian: {
    name: 'Nkese Maria Udongwo',
    role: 'Humanitarian',
    title: 'Director, Humanitarian Services',
    focus: 'Dignity and service delivery standards'
  },
  MEAL: {
    name: 'Adewale F.',
    role: 'MEAL',
    title: 'MEAL Manager',
    focus: 'Digital evidence packets and NIN verification'
  }
};

// --- Mock Data ---

const REDEMPTION_DATA = [
  { time: '08:00', volume: 120, ward: 'Ward 1' },
  { time: '09:00', volume: 450, ward: 'Ward 2' },
  { time: '10:00', volume: 890, ward: 'Ward 3' },
  { time: '11:00', volume: 1200, ward: 'Ward 4' },
  { time: '12:00', volume: 1500, ward: 'Ward 5' },
  { time: '13:00', volume: 0, ward: 'Ward 6' }, // The Security Spike
  { time: '14:00', volume: 1100, ward: 'Ward 7' },
  { time: '15:00', volume: 950, ward: 'Ward 8' },
];

const DISPLACEMENT_METRIC = [
  { name: 'USSD (Off-grid)', value: 24500, color: '#0099A9' },
  { name: 'Smartphone-only', value: 10500, color: '#B48F4B' },
];

const RECENT_DISTRIBUTIONS = [
  { id: 'DIST-001', lga: 'Kaga', ward: 'Ward 2', households: 1200, status: 'Verified', date: '2026-03-24' },
  { id: 'DIST-002', lga: 'Magumeri', ward: 'Ward 6', households: 850, status: 'Alert', date: '2026-03-25' },
  { id: 'DIST-003', lga: 'Kaga', ward: 'Ward 4', households: 2100, status: 'Verified', date: '2026-03-23' },
  { id: 'DIST-004', lga: 'Magumeri', ward: 'Ward 1', households: 1500, status: 'Verified', date: '2026-03-22' },
  { id: 'DIST-005', lga: 'Kaga', ward: 'Ward 1', households: 900, status: 'Verified', date: '2026-03-21' },
];

const MAMI_PARTICIPANTS = [
  { 
    id: 'MAMI-001', 
    name: 'Hadiza Abubakar', 
    nin: '1234-5678-9012', 
    ward: 'Ward 2', 
    lga: 'Kaga', 
    ussdCode: '*711*2*1#', 
    ussdStatus: 'Success', 
    ussdResponseCode: '200',
    ussdErrorMessage: null,
    ussdTime: '10:15 AM',
    auditStatus: 'Verified',
    biometrics: 'Captured',
    lastSync: '2026-03-25 10:20 AM'
  },
  { 
    id: 'MAMI-002', 
    name: 'Musa Ibrahim', 
    nin: '9876-5432-1098', 
    ward: 'Ward 6', 
    lga: 'Magumeri', 
    ussdCode: '*711*6*1#', 
    ussdStatus: 'Failed', 
    ussdResponseCode: '403',
    ussdErrorMessage: 'Network Timeout',
    ussdTime: '11:30 AM',
    auditStatus: 'Flagged',
    biometrics: 'Pending',
    lastSync: 'Offline'
  },
  { 
    id: 'MAMI-003', 
    name: 'Aisha Bello', 
    nin: '4567-8901-2345', 
    ward: 'Ward 4', 
    lga: 'Kaga', 
    ussdCode: '*711*4*1#', 
    ussdStatus: 'Success', 
    ussdResponseCode: '200',
    ussdErrorMessage: null,
    ussdTime: '09:45 AM',
    auditStatus: 'Verified',
    biometrics: 'Captured',
    lastSync: '2026-03-25 09:50 AM'
  },
  { 
    id: 'MAMI-004', 
    name: 'Zainab Umar', 
    nin: '2345-6789-0123', 
    ward: 'Ward 1', 
    lga: 'Magumeri', 
    ussdCode: '*711*1*1#', 
    ussdStatus: 'Success', 
    ussdResponseCode: '200',
    ussdErrorMessage: null,
    ussdTime: '08:20 AM',
    auditStatus: 'Verified',
    biometrics: 'Captured',
    lastSync: '2026-03-25 08:25 AM'
  },
];

// --- Components ---

const Sidebar = ({ 
  activeRole, 
  setActiveRole, 
  currentView, 
  setCurrentView, 
  isOpen, 
  onClose 
}: { 
  activeRole: UserRole, 
  setActiveRole: (role: UserRole) => void,
  currentView: DashboardView,
  setCurrentView: (view: DashboardView) => void,
  isOpen: boolean,
  onClose: () => void
}) => {
  const canSeeLGAs = ['Admin', 'Executive', 'Operations'].includes(activeRole);
  const canSeeAudit = ['Admin', 'MEAL'].includes(activeRole);
  const canSeeMAMI = ['Admin', 'Operations', 'Humanitarian', 'MEAL'].includes(activeRole);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "w-64 bg-crs-blue text-white h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
              <ShieldAlert className="text-crs-blue w-7 h-7" />
            </div>
            <div>
              <h1 className="font-gotham font-bold text-lg leading-tight flex items-center gap-1">
                SENTINEL PREMIUM
              </h1>
              <p className="text-[10px] opacity-70 tracking-widest uppercase">CRS Nigeria</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => { setCurrentView('Dashboard'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              currentView === 'Dashboard' ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          {canSeeLGAs && (
            <button 
              onClick={() => { setCurrentView('LGAs'); onClose(); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                currentView === 'LGAs' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <MapPin size={18} /> Kaga & Magumeri
            </button>
          )}
          {canSeeAudit && (
            <button 
              onClick={() => { setCurrentView('AuditPacks'); onClose(); }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                currentView === 'AuditPacks' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <FileCheck size={18} /> Audit Packs Premium
              </div>
            </button>
          )}
          {canSeeMAMI && (
            <button 
              onClick={() => { setCurrentView('MAMI'); onClose(); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                currentView === 'MAMI' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <Users size={18} /> MAMI Participants
            </button>
          )}
          {activeRole === 'Admin' && (
            <button 
              onClick={() => { setCurrentView('ActivityLog'); onClose(); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                currentView === 'ActivityLog' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <History size={18} /> Activity Log
            </button>
          )}
          <button 
            onClick={() => { setCurrentView('Help'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              currentView === 'Help' ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <AlertCircle size={18} /> Help & Guide
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block px-2">Switch Profile (Demo Mode)</label>
          <select 
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="w-full bg-white/10 border-none rounded-md text-xs p-2 focus:ring-1 focus:ring-humble-gold outline-none"
          >
            {Object.keys(STAFF_PROFILES).map(role => (
              <option key={role} value={role} className="text-black">{role} - {STAFF_PROFILES[role as UserRole].name}</option>
            ))}
          </select>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-humble-gold flex items-center justify-center text-xs font-bold">
              {STAFF_PROFILES[activeRole].name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{STAFF_PROFILES[activeRole].name}</p>
              <p className="text-[10px] opacity-60 truncate">{STAFF_PROFILES[activeRole].title}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

const Header = ({ 
  isOnline, 
  toggleNetwork, 
  pendingCount, 
  onMenuOpen,
  setCurrentView
}: { 
  isOnline: boolean, 
  toggleNetwork: () => void, 
  pendingCount: number,
  onMenuOpen: () => void,
  setCurrentView: (view: DashboardView) => void
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 lg:ml-64">
      <div className="flex items-center gap-4 lg:gap-6">
        <button onClick={onMenuOpen} className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search LGAs, Wards, or NINs..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-48 md:w-64 focus:ring-2 focus:ring-crs-blue/20 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-full bg-slate-100">
          {isOnline ? (
            <div className="flex items-center gap-2 text-bold-teal font-bold text-[10px] lg:text-xs">
              <Wifi size={14} className="hidden xs:block" /> <span className="hidden xs:inline">4G Signal Restored</span>
              <span className="xs:hidden">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-bold-orange font-bold text-[10px] lg:text-xs">
              <WifiOff size={14} className="hidden xs:block" /> <span className="hidden xs:inline">Offline Mode</span>
              <span className="xs:hidden">Offline</span>
            </div>
          )}
          <button 
            onClick={toggleNetwork}
            className="ml-1 lg:ml-2 p-1 hover:bg-slate-200 rounded-md transition-colors"
            title="Toggle Network State"
          >
            <Radio size={14} className={isOnline ? "text-slate-400" : "text-bold-orange animate-pulse"} />
          </button>
        </div>

        {pendingCount > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-humble-gold/10 text-humble-gold font-bold text-xs">
            {pendingCount} Queued
          </div>
        )}

        <button 
          onClick={() => setCurrentView('Help')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
          title="System Help"
        >
          <AlertCircle size={20} />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Help</span>
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-bold-orange rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

const AlertBanner = ({ message, onAcknowledge }: { message: string, onAcknowledge: () => void }) => (
  <motion.div 
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="bg-bold-orange text-white px-4 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between lg:ml-64 gap-2 shadow-lg z-30"
  >
    <div className="flex items-center gap-3">
      <AlertTriangle className="animate-bounce shrink-0" />
      <span className="font-gotham font-bold tracking-wide text-sm lg:text-base">
        {message}
      </span>
    </div>
    <button 
      onClick={onAcknowledge}
      className="text-xs underline font-bold uppercase tracking-widest shrink-0 hover:text-white/80 transition-colors"
    >
      Acknowledge
    </button>
  </motion.div>
);

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg text-crs-blue">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          trend > 0 ? "bg-bold-teal/10 text-bold-teal" : "bg-bold-orange/10 text-bold-orange"
        )}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-2xl font-gotham font-bold text-crs-blue">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{subValue}</p>
  </div>
);

const RedemptionPulse = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="font-gotham font-bold text-crs-blue">Redemption Pulse Monitor</h3>
        <p className="text-xs text-slate-400">Real-time USSD transaction volume across LGAs</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-bold text-bold-teal uppercase">
          <div className="w-2 h-2 rounded-full bg-bold-teal"></div> Live
        </span>
      </div>
    </div>
    <div className="h-[250px] sm:h-[300px] w-full min-h-[250px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0}>
        <LineChart data={REDEMPTION_DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#00468B" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#00468B', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#EF6E0B', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const DisplacementMetric = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h3 className="font-gotham font-bold text-crs-blue mb-2">Displacement Metric</h3>
    <p className="text-xs text-slate-400 mb-6">Off-grid reach via USSD vs. Smartphone-only platforms</p>
    
    <div className="h-[150px] sm:h-[200px] w-full mb-6 min-h-[150px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={150} minWidth={0}>
        <BarChart data={DISPLACEMENT_METRIC} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" hide />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
            {DISPLACEMENT_METRIC.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="space-y-4">
      {DISPLACEMENT_METRIC.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
            <span className="text-xs font-medium text-slate-600">{item.name}</span>
          </div>
          <span className="text-sm font-bold text-crs-blue">{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>

    <div className="mt-6 pt-6 border-t border-slate-100">
      <p className="narrative text-xs italic text-slate-500 leading-relaxed">
        "The USSD bridge has enabled 24,500 households to transition from vulnerability to recovery, 
        reaching those previously excluded by digital divides."
      </p>
    </div>
  </div>
);

const AuditTable = ({ logActivity }: { logActivity: (action: string, type?: 'info' | 'warning' | 'critical') => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    logActivity('NIN-Verified Audit Report generation initiated', 'info');
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuccess(true);
      logActivity('NIN-Verified Audit Report successfully generated', 'info');
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-3">
      <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-gotham font-bold text-crs-blue flex items-center gap-2">
            NIN-Verified Audit Pack Premium
          </h3>
          <p className="text-xs text-slate-400">Recent CVA distributions in Borno State</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={cn(
            "w-full sm:w-auto text-white px-4 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
            isGenerating ? "bg-slate-400 cursor-not-allowed" : "bg-bold-blue hover:bg-crs-blue"
          )}
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span className="sm:hidden">{isGenerating ? "Generating..." : "Generate Audit Report"}</span>
          <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate One-Click Audit Report for USAID BHA"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-bold-teal text-white px-6 py-2 text-xs font-bold text-center"
          >
            Report generated successfully! Download started.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">LGA / Ward</th>
              <th className="px-6 py-4">Households</th>
              <th className="px-6 py-4">NIN Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RECENT_DISTRIBUTIONS.map((dist) => (
              <tr key={dist.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-xs font-bold text-crs-blue">{dist.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{dist.lga}</span>
                    <span className="text-[10px] text-slate-400">{dist.ward}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs">{dist.households.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    dist.status === 'Verified' ? "bg-bold-teal/10 text-bold-teal" : "bg-bold-orange/10 text-bold-orange"
                  )}>
                    {dist.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{dist.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-crs-blue transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OfflineSyncDemo = ({ isOnline, pendingCount, addEntry }: any) => {
  const [syncStatus, setSyncStatus] = useState<{ show: boolean, message: string, type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleSync = () => {
    if (isOnline && pendingCount > 0) {
      setSyncStatus({ show: true, message: 'Offline data synced successfully!', type: 'success' });
    } else if (!isOnline) {
      setSyncStatus({ show: true, message: 'Entry queued for offline sync', type: 'info' });
    } else {
      setSyncStatus({ show: true, message: 'Data submitted to server', type: 'success' });
    }
    
    setTimeout(() => setSyncStatus(prev => ({ ...prev, show: false })), 3000);
    addEntry();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      <AnimatePresence>
        {syncStatus.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "absolute top-0 left-0 right-0 text-white p-2 text-center text-[10px] font-bold z-10",
              syncStatus.type === 'success' ? "bg-bold-teal" : "bg-humble-gold"
            )}
          >
            {syncStatus.message}
          </motion.div>
        )}
      </AnimatePresence>
      <h3 className="font-gotham font-bold text-crs-blue mb-2">Field Data Entry</h3>
      <p className="text-xs text-slate-400 mb-6">Simulate offline sync capability for field teams</p>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Household NIN</label>
          <input 
            type="text" 
            placeholder="e.g. 12345678901" 
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-crs-blue"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Distribution Type</label>
          <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-crs-blue">
            <option>MAMI Food Basket</option>
            <option>Cash Transfer</option>
            <option>Seed Pack</option>
          </select>
        </div>
        <button 
          onClick={handleSync}
          className="w-full bg-crs-blue text-white py-2 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {isOnline ? <CheckCircle2 size={14} /> : <Download size={14} className="rotate-180" />}
          {isOnline ? "Submit to Server" : "Queue for Sync (Offline)"}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
          <div className="flex items-center gap-1">
            <Radio size={12} className={cn(pendingCount > 0 ? "text-humble-gold animate-pulse" : "text-bold-teal")} />
            <span>Sync Status</span>
          </div>
          <span className={cn(pendingCount > 0 ? "text-humble-gold" : "text-bold-teal")}>
            {pendingCount > 0 ? `${pendingCount} Pending Sync` : "All Synced"}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: pendingCount > 0 ? '40%' : '100%' }}
            className={cn(
              "h-full transition-all duration-500",
              pendingCount > 0 ? "bg-humble-gold" : "bg-bold-teal"
            )}
          />
        </div>
        {pendingCount > 0 && (
          <div className="mt-4 p-3 bg-humble-gold/5 border border-humble-gold/20 rounded-lg">
            <p className="text-[10px] font-bold text-humble-gold uppercase mb-2">Pending Queue</p>
            <div className="space-y-2">
              {[...Array(pendingCount)].map((_, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] text-slate-600">
                  <span className="font-mono">ENTRY_OFFLINE_{i + 104}</span>
                  <span className="italic">Waiting for connection...</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MAMIParticipantsView = ({ activeRole, logActivity }: { activeRole: UserRole, logActivity: (action: string, type?: 'info' | 'warning' | 'critical') => void }) => {
  const [selectedWard, setSelectedWard] = useState('All Wards');
  const [ussdFilter, setUssdFilter] = useState('All Status');
  const [auditFilter, setAuditFilter] = useState('All Audit');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    return MAMI_PARTICIPANTS.filter(p => {
      const matchesWard = selectedWard === 'All Wards' || p.ward === selectedWard;
      const matchesUssd = ussdFilter === 'All Status' || p.ussdStatus === ussdFilter;
      const matchesAudit = auditFilter === 'All Audit' || p.auditStatus === auditFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.nin.includes(searchQuery);
      return matchesWard && matchesUssd && matchesAudit && matchesSearch;
    });
  }, [selectedWard, ussdFilter, auditFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'NIN', 'LGA', 'Ward', 'USSD Code', 'USSD Status', 'USSD Time', 'Response Code', 'Error Message', 'Audit Status', 'Biometrics', 'Last Sync'];
    const rows = filteredParticipants.map(p => [
      p.id, p.name, p.nin, p.lga, p.ward, p.ussdCode, p.ussdStatus, p.ussdTime, p.ussdResponseCode, p.ussdErrorMessage || 'N/A', p.auditStatus, p.biometrics, p.lastSync
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MAMI_Participants_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity('MAMI Participants data exported to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className="font-gotham font-bold text-crs-blue">MAMI Participants Registry</h3>
            <p className="text-xs text-slate-400">Detailed oversight of household redemptions and USSD logs</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-bold-blue text-white rounded-lg text-xs font-bold hover:bg-crs-blue transition-all shadow-md"
            >
              <Download size={14} /> Export CSV
            </button>
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search Name or NIN..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full sm:w-48 outline-none focus:ring-1 focus:ring-crs-blue"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Ward Filter</label>
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-crs-blue outline-none focus:ring-1 focus:ring-crs-blue appearance-none"
            >
              <option>All Wards</option>
              <option>Ward 1</option>
              <option>Ward 2</option>
              <option>Ward 4</option>
              <option>Ward 6</option>
            </select>
            <ChevronRight className="absolute right-2 bottom-2.5 text-slate-400 rotate-90" size={14} />
          </div>
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">USSD Status</label>
            <select 
              value={ussdFilter}
              onChange={(e) => setUssdFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-crs-blue outline-none focus:ring-1 focus:ring-crs-blue appearance-none"
            >
              <option>All Status</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
            <ChevronRight className="absolute right-2 bottom-2.5 text-slate-400 rotate-90" size={14} />
          </div>
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Audit Status</label>
            <select 
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-crs-blue outline-none focus:ring-1 focus:ring-crs-blue appearance-none"
            >
              <option>All Audit</option>
              <option>Verified</option>
              <option>Flagged</option>
            </select>
            <ChevronRight className="absolute right-2 bottom-2.5 text-slate-400 rotate-90" size={14} />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">NIN / Ward</th>
                <th className="px-4 py-3">USSD Transaction</th>
                <th className="px-4 py-3">Response Code</th>
                <th className="px-4 py-3">Error Message</th>
                <th className="px-4 py-3">Audit Info</th>
                <th className="px-4 py-3">Sync Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((p) => (
                <tr 
                  key={p.id} 
                  className={cn(
                    "transition-all duration-300",
                    p.ussdStatus === 'Failed' 
                      ? "bg-bold-orange/5 border-l-4 border-bold-orange" 
                      : selectedWard !== 'All Wards' && p.ward === selectedWard 
                        ? "bg-humble-gold/20 border-l-8 border-humble-gold shadow-sm z-10 relative" 
                        : "hover:bg-slate-50"
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-crs-blue/10 flex items-center justify-center text-crs-blue text-[10px] font-bold">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-crs-blue">{p.name}</span>
                        {selectedWard !== 'All Wards' && p.ward === selectedWard && (
                          <span className="text-[8px] font-bold bg-humble-gold text-white px-1 rounded w-fit uppercase tracking-tighter">Selected Ward</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {['Admin', 'MEAL'].includes(activeRole) ? p.nin : `${p.nin.substring(0, 4)}****${p.nin.substring(p.nin.length - 2)}`}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        selectedWard !== 'All Wards' && p.ward === selectedWard ? "text-bold-orange" : "text-slate-400"
                      )}>
                        {p.lga} - {p.ward}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Smartphone size={12} className="text-crs-blue" />
                        <span className="text-xs font-mono font-bold text-crs-blue">{p.ussdCode}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          p.ussdStatus === 'Success' ? "bg-bold-teal text-white" : "bg-bold-orange text-white"
                        )}>
                          {p.ussdStatus}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {p.ussdTime}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm",
                        p.ussdResponseCode === '200' ? "bg-bold-teal/10 text-bold-teal border border-bold-teal/20" : "bg-bold-orange/10 text-bold-orange border border-bold-orange/20"
                      )}>
                        {p.ussdResponseCode}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        p.ussdResponseCode === '200' ? "text-bold-teal" : "text-bold-orange"
                      )}>
                        {p.ussdResponseCode === '200' ? 'OK' : 
                         p.ussdResponseCode === '403' ? 'Forbidden' : 'Error'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {p.ussdErrorMessage ? (
                      <div className="flex items-start gap-2 bg-bold-orange/5 p-2 rounded-lg border border-bold-orange/10 max-w-[150px]">
                        <AlertCircle size={14} className="text-bold-orange shrink-0 mt-0.5" />
                        <span className="text-[10px] text-bold-orange font-medium leading-tight italic">
                          {p.ussdErrorMessage}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">No errors reported</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit",
                        p.auditStatus === 'Verified' ? "bg-bold-teal/10 text-bold-teal" : "bg-bold-orange/10 text-bold-orange"
                      )}>
                        {p.auditStatus}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit",
                        p.biometrics === 'Captured' ? "bg-crs-blue/10 text-crs-blue" : "bg-slate-100 text-slate-400"
                      )}>
                        {p.biometrics === 'Captured' ? <FileCheck size={12} /> : <Loader2 size={12} className="animate-spin" />}
                        Bio: {p.biometrics}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={cn(
                      "flex flex-col gap-1 px-2 py-1.5 rounded-lg w-fit border",
                      p.lastSync === 'Offline' ? "bg-bold-orange/10 text-bold-orange border-bold-orange/20" : "bg-bold-teal/10 text-bold-teal border-bold-teal/20"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          p.lastSync === 'Offline' ? "bg-bold-orange animate-pulse" : "bg-bold-teal"
                        )}></div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {p.lastSync === 'Offline' ? 'Offline' : 'Synced'}
                        </span>
                      </div>
                      {p.lastSync !== 'Offline' && (
                        <span className="text-[8px] font-medium opacity-70">
                          {p.lastSync}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-crs-blue transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Audit Table (Card-based) */}
        <div className="md:hidden space-y-4">
          {filteredParticipants.map((p) => (
            <div 
              key={p.id} 
              className={cn(
                "p-4 rounded-xl border transition-all duration-300",
                p.ussdStatus === 'Failed'
                  ? "bg-bold-orange/5 border-bold-orange ring-1 border-bold-orange/20"
                  : selectedWard !== 'All Wards' && p.ward === selectedWard 
                    ? "bg-humble-gold/10 border-humble-gold ring-1 ring-humble-gold/20" 
                    : "bg-slate-50 border-slate-200"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-crs-blue/10 flex items-center justify-center text-crs-blue text-xs font-bold">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-crs-blue">{p.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {['Admin', 'MEAL'].includes(activeRole) ? p.nin : `${p.nin.substring(0, 4)}****${p.nin.substring(p.nin.length - 2)}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase",
                    p.auditStatus === 'Verified' ? "bg-bold-teal/10 text-bold-teal" : "bg-bold-orange/10 text-bold-orange"
                  )}>
                    {p.auditStatus}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                    p.lastSync === 'Offline' ? "bg-bold-orange/10 text-bold-orange" : "bg-bold-teal/10 text-bold-teal"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", p.lastSync === 'Offline' ? "bg-bold-orange animate-pulse" : "bg-bold-teal")}></div>
                    {p.lastSync === 'Offline' ? 'Offline' : 'Synced'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">Ward & LGA</p>
                  <p className={cn(
                    "text-[10px] font-bold",
                    selectedWard !== 'All Wards' && p.ward === selectedWard ? "text-bold-orange" : "text-slate-600"
                  )}>
                    {p.lga} - {p.ward}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">USSD Transaction</p>
                  <div className="bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-crs-blue leading-none mb-1">{p.ussdCode}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn(
                        "text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-tighter",
                        p.ussdStatus === 'Success' ? "bg-bold-teal text-white" : "bg-bold-orange text-white"
                      )}>{p.ussdStatus}</span>
                      <span className="text-[7px] font-bold text-slate-400">{p.ussdTime}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">Response & Error</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn(
                      "text-[8px] font-bold px-1 py-0.5 rounded text-white",
                      p.ussdResponseCode === '200' ? "bg-bold-teal" : "bg-bold-orange"
                    )}>
                      {p.ussdResponseCode}
                    </span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-tighter",
                      p.ussdResponseCode === '200' ? "text-bold-teal" : "text-bold-orange"
                    )}>
                      {p.ussdResponseCode === '200' ? 'OK' : 'ERR'}
                    </span>
                  </div>
                  {p.ussdErrorMessage && (
                    <div className="flex items-start gap-1 bg-bold-orange/5 p-1 rounded border border-bold-orange/10">
                      <p className="text-[7px] text-bold-orange font-bold italic leading-tight">{p.ussdErrorMessage}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">Audit & Sync</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                        p.auditStatus === 'Verified' ? "bg-bold-teal/10 text-bold-teal" : "bg-bold-orange/10 text-bold-orange"
                      )}>
                        {p.auditStatus}
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                        p.biometrics === 'Captured' ? "bg-crs-blue/10 text-crs-blue" : "bg-slate-100 text-slate-400"
                      )}>
                        Bio: {p.biometrics}
                      </span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase w-fit border",
                      p.lastSync === 'Offline' ? "bg-bold-orange/10 text-bold-orange border-bold-orange/20" : "bg-bold-teal/10 text-bold-teal border-bold-teal/20"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", p.lastSync === 'Offline' ? "bg-bold-orange animate-pulse" : "bg-bold-teal")}></div>
                      {p.lastSync === 'Offline' ? 'Offline' : 'Synced'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActivityLogView = ({ logs }: { logs: ActivityEntry[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-gotham font-bold text-crs-blue">System Activity Log</h2>
        <p className="text-slate-500 text-sm">Real-time audit trail of all user actions and system events.</p>
      </div>
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Monitoring</span>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-crs-blue/10 flex items-center justify-center text-[10px] font-bold text-crs-blue">
                      {log.user.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.action}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                    log.type === 'critical' ? "bg-red-100 text-red-600" :
                    log.type === 'warning' ? "bg-amber-100 text-amber-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {log.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const HelpView = () => (
  <div className="space-y-8 max-w-4xl">
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-gotham font-bold text-crs-blue mb-6 flex items-center gap-3">
        <AlertCircle className="text-bold-blue" /> System Documentation & Demo Guide
      </h3>
      
      <div className="space-y-8">
        <section>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <LayoutDashboard size={18} className="text-crs-blue" /> 1. Dashboard Overview
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            The main dashboard provides a high-level summary of the <strong>MAMI (Mother and Mid-Upper Arm Circumference)</strong> project. 
            It tracks total households reached, redemption rates via USSD, and NIN verification status. 
            The <strong>Redemption Pulse</strong> shows real-time transaction volume, while the <strong>Displacement Metric</strong> 
            highlights how the USSD bridge reaches off-grid populations that smartphone-only apps miss.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <MapPin size={18} className="text-crs-blue" /> 2. Kaga & Magumeri Regional Oversight
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            This view drills down into specific Local Government Areas (LGAs). You can monitor activity levels 
            and security alerts. The <strong>GIS Heatmap</strong> visualizes transaction density. 
            Click <em>"Load High-Resolution Map"</em> to fetch satellite-verified coordinate data for precise ward-level analysis.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <FileCheck size={18} className="text-crs-blue" /> 3. Audit Packs & Compliance
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Designed for donor reporting (USAID BHA), this section provides one-click audit reports. 
            Every transaction is linked to a <strong>NIN-verified</strong> digital evidence packet, 
            ensuring 100% accountability in high-risk zones.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <WifiOff size={18} className="text-crs-blue" /> 4. Offline-First Architecture
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            The system is built for the field. Use the <strong>Network Toggle</strong> in the header to simulate 
            offline environments. Data entered while offline is queued locally and automatically synced 
            once a connection is restored.
          </p>
        </section>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="font-bold text-crs-blue mb-3">Demo Instructions for Stakeholders:</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
            <li>Switch between <strong>Staff Profiles</strong> in the sidebar to see how the UI adapts for different roles (Admin, MEAL, etc.).</li>
            <li>Toggle the <strong>Offline Mode</strong> and add a mock entry to see the sync queue in action.</li>
            <li>Navigate to <strong>Kaga & Magumeri</strong> and activate the High-Resolution Map layer.</li>
            <li>Generate an <strong>Audit Report</strong> to see the automated compliance workflow.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-crs-blue flex flex-col items-center justify-center p-6 text-white">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl text-slate-900"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-crs-blue rounded-xl flex items-center justify-center mb-4 shadow-lg">
          <ShieldAlert className="text-humble-gold w-12 h-12" />
        </div>
        <h1 className="font-gotham font-bold text-2xl text-crs-blue tracking-tight uppercase">INSECURITY SENTINEL PREMIUM</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">CRS Nigeria Portal</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Staff ID / Email</label>
          <input type="text" defaultValue="wilson.kipkoech@crs.org" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crs-blue/20" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Security Token</label>
          <input type="password" defaultValue="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crs-blue/20" />
        </div>
        <button 
          onClick={onLogin}
          className="w-full bg-crs-blue text-white py-3 rounded-lg font-gotham font-bold text-sm hover:bg-bold-blue transition-all shadow-lg"
        >
          Access Secure Dashboard
        </button>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 text-center">
        <p className="narrative italic text-crs-blue font-bold text-sm">
          "Faith Knows No Bounds"
        </p>
      </div>
    </motion.div>
    <p className="mt-8 text-white/40 text-[10px] uppercase tracking-widest">© 2026 Catholic Relief Services | All Rights Reserved</p>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [currentView, setCurrentView] = useState<DashboardView>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [syncedCount, setSyncedCount] = useState(35000);
  const [showAlert, setShowAlert] = useState(true);
  const [alertMessage, setAlertMessage] = useState("INSECURITY DETECTED: Ward 6 activity flatlined. Evacuate team to Super Camp immediately.");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLayer, setMapLayer] = useState<'Heatmap' | 'Security' | 'Satellite'>('Heatmap');
  const [isOfflineMap, setIsOfflineMap] = useState(false);
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [hasSmsBeenSent, setHasSmsBeenSent] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    { id: '1', user: 'Wilson Kipkoech', action: 'System Login', timestamp: new Date().toISOString(), type: 'info' },
    { id: '2', user: 'Wilson Kipkoech', action: 'Security Alert Acknowledged', timestamp: new Date().toISOString(), type: 'warning' }
  ]);
  const [securityContacts, setSecurityContacts] = useState([
    { name: 'Field Lead - Kaga', phone: '+234 801 234 5678', active: true },
    { name: 'Security Officer', phone: '+234 802 345 6789', active: true }
  ]);

  const logActivity = (action: string, type: 'info' | 'warning' | 'critical' = 'info') => {
    const newEntry: ActivityEntry = {
      id: Date.now().toString(),
      user: STAFF_PROFILES[activeRole].name,
      action,
      timestamp: new Date().toISOString(),
      type
    };
    setActivityLog(prev => [newEntry, ...prev].slice(0, 50));
  };

  useEffect(() => {
    // Simulate real-time alert trigger
    const failedCount = MAMI_PARTICIPANTS.filter(p => p.ussdStatus === 'Failed').length;
    if (failedCount > 0 && !showAlert) {
      setAlertMessage(`CRITICAL ALERT: ${failedCount} USSD transaction failures detected in Magumeri. Investigate network relay.`);
      setShowAlert(true);
    }
  }, [showAlert]);

  useEffect(() => {
    // Automatic SMS alert for specific security events
    const isCriticalEvent = showAlert && (
      alertMessage.includes('Ward 6 Magumeri: Restricted') || 
      alertMessage.includes('CRITICAL ALERT') ||
      alertMessage.includes('EVACUATE')
    );
    
    if (isCriticalEvent && !hasSmsBeenSent) {
      handleSendSmsAlert();
      setHasSmsBeenSent(true);
    }
    if (!showAlert) {
      setHasSmsBeenSent(false);
    }
  }, [showAlert, alertMessage, hasSmsBeenSent]);

  const handleSendSmsAlert = async () => {
    setIsSmsSending(true);
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const kagaLead = securityContacts.find(c => c.name === 'Field Lead - Kaga');
    const securityOfficer = securityContacts.find(c => c.name === 'Security Officer');
    
    if (kagaLead) {
      logActivity(`CRITICAL: SMS Security Alert dispatched to ${kagaLead.name} (${kagaLead.phone})`, 'critical');
    }
    if (securityOfficer) {
      logActivity(`CRITICAL: SMS Security Alert dispatched to ${securityOfficer.name} (${securityOfficer.phone})`, 'critical');
    }
    
    logActivity(`SMS Security Alert broadcast to all ${securityContacts.length} field personnel`, 'critical');
    setIsSmsSending(false);
    
    // Custom notification instead of window.alert
    setAlertMessage(prev => prev + " | SMS ALERTS DISPATCHED");
  };

  const handleLoadMap = () => {
    setIsMapLoading(true);
    logActivity('High-Resolution GIS Map loading initiated', 'info');
    setTimeout(() => {
      setIsMapLoading(false);
      setIsMapLoaded(true);
      logActivity('High-Resolution GIS Map successfully loaded', 'info');
    }, 2500);
  };

  const toggleNetwork = async () => {
    try {
      const res = await fetch('/api/toggle-network', { method: 'POST' });
      const data = await res.json();
      setIsOnline(data.isOnline);
      logActivity(`Network status changed to ${data.isOnline ? 'Online' : 'Offline'}`, data.isOnline ? 'info' : 'warning');
      
      if (data.isOnline && pendingEntries.length > 0) {
        // Simulate batch upload
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: pendingEntries })
        });
        setSyncedCount(prev => prev + pendingEntries.length);
        logActivity(`Synced ${pendingEntries.length} pending entries from offline queue`, 'info');
        setPendingEntries([]);
      }
    } catch (err) {
      console.error("Network toggle failed", err);
      logActivity('Network toggle operation failed', 'critical');
    }
  };

  const addEntry = () => {
    const newEntry = { id: Date.now(), timestamp: new Date().toISOString() };
    if (isOnline) {
      setSyncedCount(prev => prev + 1);
      logActivity('New household entry added (Synced)', 'info');
    } else {
      setPendingEntries(prev => [...prev, newEntry]);
      logActivity('New household entry added (Offline Queue)', 'warning');
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => {
      setIsLoggedIn(true);
      logActivity('System Login', 'info');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          isOnline={isOnline} 
          toggleNetwork={toggleNetwork} 
          pendingCount={pendingEntries.length} 
          onMenuOpen={() => setIsSidebarOpen(true)}
          setCurrentView={setCurrentView}
        />
        
        <AnimatePresence>
          {showAlert && (activeRole === 'Admin' || activeRole === 'Executive') && (
            <AlertBanner 
              message={alertMessage} 
              onAcknowledge={() => {
                setShowAlert(false);
                logActivity('Security Alert Acknowledged', 'info');
              }} 
            />
          )}
        </AnimatePresence>

        <div className="p-4 lg:p-8 lg:ml-64">
          <div className="mb-8">
            <h2 className="text-xl lg:text-2xl font-gotham font-bold text-crs-blue">
              {currentView === 'Dashboard' ? (
                <div className="flex items-center gap-2">
                  {activeRole === 'Admin' ? 'Emergency Coordination Overview Premium' : 
                   activeRole === 'Executive' ? 'CP Performance & Compliance Premium' :
                   activeRole === 'Operations' ? 'Field Activity Tracking Premium' :
                   activeRole === 'Humanitarian' ? 'Dignity & Service Standards Premium' :
                   'MEAL Verification Portal Premium'}
                </div>
              ) : currentView === 'LGAs' ? (
                'Kaga & Magumeri Regional Oversight'
              ) : currentView === 'MAMI' ? (
                'MAMI Participants Registry Premium'
              ) : currentView === 'Help' ? (
                'System Documentation & Demo'
              ) : (
                <div className="flex items-center gap-2">
                  Audit Packs & Compliance Repository Premium
                </div>
              )}
            </h2>
            <p className="narrative text-slate-500 mt-1 text-sm">
              {currentView === 'Dashboard' ? `Focus: ${STAFF_PROFILES[activeRole].focus}` : 
               currentView === 'LGAs' ? 'Monitoring USSD redemptions and security spikes in Borno State' :
               currentView === 'MAMI' ? 'Detailed oversight of household redemptions and USSD logs' :
               currentView === 'Help' ? 'Comprehensive guide for stakeholders and field teams' :
               'NIN-verified distribution packets for donor reporting'}
            </p>
          </div>

          {currentView === 'Dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard 
                  title="Total Households" 
                  value={syncedCount.toLocaleString()} 
                  subValue="MAMI Project Target: 40,000" 
                  icon={Users}
                  trend={12}
                />
                <StatCard 
                  title="Redemption Rate" 
                  value="84.2%" 
                  subValue="Avg. across Kaga & Magumeri" 
                  icon={TrendingUp}
                  trend={-3}
                />
                <StatCard 
                  title="NIN Verified" 
                  value="91.5%" 
                  subValue="Digital Evidence Packets" 
                  icon={FileCheck}
                  trend={5}
                />
                <StatCard 
                  title="Security Status" 
                  value={activeRole === 'Admin' ? "HIGH ALERT" : "STABLE"} 
                  subValue="Ward 6 Magumeri: Restricted" 
                  icon={ShieldAlert}
                  className={activeRole === 'Admin' ? "border-bold-orange" : ""}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
                <RedemptionPulse />
                <DisplacementMetric />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                <AuditTable logActivity={logActivity} />
                <OfflineSyncDemo 
                  isOnline={isOnline} 
                  pendingCount={pendingEntries.length} 
                  addEntry={addEntry} 
                />
                
                {/* SMS & Security Contacts - Admin Only */}
                {activeRole === 'Admin' && (
                  <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bold-orange/10 rounded-lg">
                          <MessageSquare className="text-bold-orange" size={20} />
                        </div>
                        <div>
                          <h3 className="font-gotham font-bold text-crs-blue">SMS Alert System</h3>
                          <p className="text-xs text-slate-500">Immediate notification to field personnel for security events.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleSendSmsAlert}
                        disabled={isSmsSending}
                        className={cn(
                          "w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          isSmsSending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-bold-orange text-white hover:bg-bold-orange/90 shadow-lg shadow-bold-orange/20"
                        )}
                      >
                        {isSmsSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        {isSmsSending ? "Sending..." : "Dispatch SMS Alert"}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registered Field Contacts</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {securityContacts.map((contact, idx) => (
                          <div key={idx} className={cn(
                            "flex items-center justify-between p-3 bg-slate-50 rounded-lg border transition-all",
                            isSmsSending ? "border-bold-orange animate-pulse" : "border-slate-100 hover:border-bold-orange/30"
                          )}>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{contact.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{contact.phone}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isSmsSending ? (
                                <Loader2 className="animate-spin text-bold-orange" size={10} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              )}
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                {isSmsSending ? "Sending Alert..." : "Active"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'LGAs' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RedemptionPulse />
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-gotham font-bold text-crs-blue mb-4 flex items-center justify-between">
                    LGA Specific Metrics
                    <span className="text-[10px] bg-humble-gold/10 text-humble-gold px-2 py-1 rounded font-bold uppercase">Premium Analysis</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Kaga LGA</span>
                        <span className="text-sm font-bold text-bold-teal">92% Active</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-bold-teal" />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                        <span>12,400 Households</span>
                        <span>8 Wards Verified</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-bold-orange">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Magumeri LGA</span>
                        <span className="text-sm font-bold text-bold-orange">45% Active</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-bold-orange" />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                        <span>22,600 Households</span>
                        <span>Ward 6: Restricted</span>
                      </div>
                      <p className="text-[10px] text-bold-orange mt-2 font-bold uppercase">Security spike detected in Ward 6</p>
                    </div>
                  </div>
                </div>
              </div>
              
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-gotham font-bold text-crs-blue">Ward-Level Activity Heatmap</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 mr-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Offline Mode</span>
                        <button 
                          onClick={() => {
                            setIsOfflineMap(!isOfflineMap);
                            logActivity(`Map mode changed to ${!isOfflineMap ? 'Offline' : 'Online'}`, 'info');
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors",
                            isOfflineMap ? "bg-crs-blue" : "bg-slate-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            isOfflineMap ? "right-1" : "left-1"
                          )}></div>
                        </button>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(['Heatmap', 'Security', 'Satellite'] as const).map((layer) => (
                          <button
                            key={layer}
                            onClick={() => {
                              setMapLayer(layer);
                              logActivity(`Map layer changed to ${layer}`, 'info');
                            }}
                            className={cn(
                              "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                              mapLayer === layer ? "bg-white text-crs-blue shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {layer}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-bold-teal"></div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">High Activity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-bold-orange"></div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Security Alert</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-1000",
                      isMapLoaded ? "opacity-100" : "opacity-20 pointer-events-none"
                    )}>
                      {/* Mock Map Grid */}
                      <div 
                        className="grid h-full transition-all duration-500"
                        style={{ 
                          gridTemplateColumns: `repeat(${isMapLoaded ? 24 : 12}, 1fr)`,
                          gridTemplateRows: `repeat(${isMapLoaded ? 24 : 12}, 1fr)`
                        }}
                      >
                        {Array.from({ length: isMapLoaded ? 576 : 144 }).map((_, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              if (isMapLoaded) {
                                const activity = (i % 13 === 0 || i % 17 === 0 || i % 23 === 0) ? 'High' : 'Normal';
                                setSelectedIncident({ 
                                  ward: `Ward ${Math.floor(i/10) + 1}`, 
                                  type: `${activity} Activity Zone`, 
                                  time: 'Live Update',
                                  details: `This region shows ${activity.toLowerCase()} USSD redemption density based on current coordinate pings.`
                                });
                                logActivity(`Map region clicked: Ward ${Math.floor(i/10) + 1}`, 'info');
                              }
                            }}
                            className={cn(
                              "border border-slate-300/30 transition-colors cursor-crosshair",
                              isMapLoaded && mapLayer === 'Heatmap' && (i % 13 === 0 || i % 17 === 0 || i % 23 === 0) ? "bg-bold-teal/20 hover:bg-bold-teal/40" : "hover:bg-slate-200/20",
                              isMapLoaded && mapLayer === 'Security' && (i % 31 === 0 || i % 47 === 0) ? "bg-bold-orange/30 hover:bg-bold-orange/50" : "",
                              isMapLoaded && mapLayer === 'Satellite' ? "bg-slate-800/10" : ""
                            )}
                          ></div>
                        ))}
                      </div>

                      {/* Interactive Security Pins */}
                      {isMapLoaded && mapLayer === 'Security' && (
                        <>
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => {
                              setSelectedIncident({ 
                                ward: 'Ward 6', 
                                type: 'Unusual Activity', 
                                time: '14:20',
                                details: 'USSD transaction volume dropped by 80% in the last hour. Potential network interference or security restriction in place.'
                              });
                              logActivity('Security incident viewed: Ward 6', 'info');
                            }}
                            className="absolute top-[30%] left-[45%] cursor-pointer group"
                          >
                            <div className="p-1 bg-bold-orange rounded-full shadow-lg animate-pulse">
                              <ShieldAlert className="text-white" size={16} />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded whitespace-nowrap z-50">
                              <p className="font-bold">Ward 6: Unusual Activity</p>
                              <p className="opacity-70">Reported at 14:20</p>
                            </div>
                          </motion.div>
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => {
                              setSelectedIncident({ 
                                ward: 'Ward 2', 
                                type: 'Network Outage', 
                                time: '15:05',
                                details: 'Local base station reported power failure. Field teams switching to satellite backup for USSD relay.'
                              });
                              logActivity('Security incident viewed: Ward 2', 'info');
                            }}
                            className="absolute top-[60%] left-[20%] cursor-pointer group"
                          >
                            <div className="p-1 bg-bold-orange rounded-full shadow-lg animate-pulse">
                              <ShieldAlert className="text-white" size={16} />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded whitespace-nowrap z-50">
                              <p className="font-bold">Ward 2: Network Outage</p>
                              <p className="opacity-70">Reported at 15:05</p>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </div>
                    {mapLayer === 'Satellite' && isMapLoaded && !isOfflineMap && (
                      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/borno/1200/800')] bg-cover opacity-40 mix-blend-overlay"></div>
                    )}
                    {isOfflineMap && isMapLoaded && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded border border-slate-200 shadow-sm flex items-center gap-2 z-20">
                        <div className="w-2 h-2 rounded-full bg-crs-blue"></div>
                        <span className="text-[10px] font-bold text-crs-blue uppercase">Offline Cache Active</span>
                      </div>
                    )}
                    <div className="text-center z-10 p-6">
                    {isMapLoading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="text-crs-blue animate-spin mb-4" size={48} />
                        <p className="text-crs-blue font-bold text-sm animate-pulse">Fetching High-Res GIS Data...</p>
                        <p className="text-slate-400 text-[10px] mt-1">Connecting to Sentinel-2 Satellite Feed</p>
                      </div>
                    ) : isMapLoaded ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="text-bold-teal mb-4" size={48} />
                        <p className="text-bold-teal font-bold text-sm">High-Resolution Map Active</p>
                        <p className="text-slate-400 text-[10px] mt-1">Last Updated: Just Now | Precision: 10m</p>
                        <button 
                          onClick={() => setIsMapLoaded(false)}
                          className="mt-4 text-slate-400 text-[10px] font-bold uppercase hover:text-crs-blue transition-colors"
                        >
                          Reset Layer
                        </button>
                      </div>
                    ) : (
                      <>
                        <MapPin className="text-crs-blue mx-auto mb-4 opacity-50" size={48} />
                        <p className="text-slate-500 font-medium text-sm">Interactive GIS Heatmap Layer</p>
                        <p className="text-slate-400 text-xs mt-1">Real-time USSD redemption density by Ward coordinates</p>
                        <button 
                          onClick={handleLoadMap}
                          className="mt-4 bg-crs-blue text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-bold-blue transition-all active:scale-95 shadow-lg"
                        >
                          Load High-Resolution Map
                        </button>
                      </>
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedIncident && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 p-4 bg-slate-900 text-white rounded-lg border-l-4 border-bold-orange relative overflow-hidden"
                      >
                        <button 
                          onClick={() => setSelectedIncident(null)}
                          className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-bold-orange/20 rounded-lg">
                            <ShieldAlert className="text-bold-orange" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              {selectedIncident.ward}: {selectedIncident.type}
                              <span className="text-[10px] bg-bold-orange px-2 py-0.5 rounded uppercase tracking-widest">Incident Report</span>
                            </h4>
                            <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">Timestamp: {selectedIncident.time}</p>
                            <p className="text-xs mt-3 leading-relaxed text-white/80 italic">
                              "{selectedIncident.details || 'No additional details provided for this region.'}"
                            </p>
                            <div className="mt-4 flex gap-3">
                              <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase transition-all">
                                Dispatch Team
                              </button>
                              <button className="px-3 py-1 bg-bold-orange/20 text-bold-orange border border-bold-orange/30 rounded text-[10px] font-bold uppercase transition-all">
                                Escalate to HQ
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mock Hotspots */}
                  <div className={cn(
                    "absolute top-1/4 left-1/3 w-12 h-12 bg-bold-teal/30 rounded-full animate-pulse blur-xl transition-opacity duration-500",
                    isMapLoading ? "opacity-0" : "opacity-100"
                  )}></div>
                  <div className={cn(
                    "absolute bottom-1/3 right-1/4 w-16 h-16 bg-bold-teal/20 rounded-full animate-pulse blur-xl transition-opacity duration-500",
                    isMapLoading ? "opacity-0" : "opacity-100"
                  )}></div>
                  <div className={cn(
                    "absolute top-1/2 right-1/3 w-8 h-8 bg-bold-orange/40 rounded-full animate-pulse blur-lg transition-opacity duration-500",
                    isMapLoading ? "opacity-0" : "opacity-100"
                  )}></div>
                </div>
              </div>

              <AuditTable logActivity={logActivity} />
            </div>
          )}

          {currentView === 'MAMI' && (
            <MAMIParticipantsView activeRole={activeRole} logActivity={logActivity} />
          )}

          {currentView === 'ActivityLog' && (
            <ActivityLogView logs={activityLog} />
          )}

          {currentView === 'AuditPacks' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Audits" value="156" subValue="Q1 2026" icon={FileCheck} />
                <StatCard title="Compliance Rate" value="99.2%" subValue="BHA Standard" icon={CheckCircle2} />
                <StatCard title="Pending Review" value="12" subValue="Requires MEAL Lead" icon={AlertTriangle} />
              </div>
              <AuditTable logActivity={logActivity} />
            </div>
          )}

          {currentView === 'Help' && (
            <HelpView />
          )}
        </div>

        <footer className="mt-auto py-8 px-4 lg:px-8 border-t border-slate-200 bg-white lg:ml-64">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-crs-blue rounded-sm flex items-center justify-center">
                <ShieldAlert className="text-humble-gold w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-crs-blue uppercase tracking-widest">Catholic Relief Services</p>
                <p className="text-[10px] text-slate-400">Nigeria Country Program | Insecurity Sentinel Premium v2.5</p>
              </div>
            </div>
            <p className="narrative italic text-crs-blue font-bold text-sm tracking-wide">
              "Faith Knows No Bounds"
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
