import React from 'react';
import { User, MainTab } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const tabs: { id: MainTab; label: string; icon: string; color: string; adminOnly?: boolean }[] = [
    { id: 'production', label: 'Production', icon: '📦', color: 'text-blue-600' },
    { id: 'prestation_prod', label: 'Prestations', icon: '⚙️', color: 'text-purple-600' },
    { id: 'prestation_etuvage', label: 'Étuvage', icon: '🔥', color: 'text-orange-600' },
    { id: 'stock', label: 'Stocks', icon: '🏢', color: 'text-emerald-600' },
    { id: 'insights', label: 'Analyses IA', icon: '✨', color: 'text-indigo-600' },
    { id: 'management', label: 'Gestion', icon: '🛠️', color: 'text-slate-800', adminOnly: true },
  ];

  const filteredTabs = tabs.filter(t => user.role === 'ADMIN' || (t.adminOnly ? false : user.allowedTabs.includes(t.id)));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white sticky top-0 h-screen p-8 shadow-2xl">
        <h1 className="text-xl font-black tracking-tighter text-blue-400 uppercase mb-12">Haddoud Moncef</h1>
        <nav className="flex-1 space-y-2">
          {filteredTabs.map(t => (
            <button 
              key={t.id} onClick={() => onTabChange(t.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate text-sm">{user.name}</p>
            <p className="text-[10px] font-black uppercase text-slate-500">{user.role}</p>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">🚪</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md text-sm">
                {user.name[0].toUpperCase()}
             </div>
             <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Ets Haddoud</p>
                <p className="text-sm font-bold text-slate-900 leading-none">
                  {tabs.find(t => t.id === activeTab)?.label}
                </p>
             </div>
          </div>
          <button onClick={onLogout} className="p-2 bg-slate-100 rounded-xl text-lg">🚪</button>
        </header>

        <main className="flex-1 p-4 lg:p-12 max-w-7xl mx-auto w-full pb-32 lg:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-50 flex justify-between gap-1 overflow-x-auto no-scrollbar shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
          {filteredTabs.map(t => (
            <button 
              key={t.id} onClick={() => onTabChange(t.id)}
              className={`flex flex-col items-center gap-1 min-w-[64px] flex-1 py-2 rounded-xl transition-all ${activeTab === t.id ? 'bg-slate-50 ' + t.color : 'text-slate-300'}`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-tighter">{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;