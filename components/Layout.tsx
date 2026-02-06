
import React from 'react';
import { ICONS } from '../constants.tsx';
import { User, MainTab } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const getTabLabel = (tab: MainTab) => {
    switch(tab) {
      case 'production': return 'Production';
      case 'prestation_prod': return 'Prestations de Production';
      case 'prestation_etuvage': return 'Étuvage';
      case 'stock': return 'Stocks';
      case 'insights': return 'Analyses IA';
      case 'management': return 'Gestion';
      default: return tab;
    }
  };

  const isTabAllowed = (tab: MainTab) => {
    if (user.role === 'ADMIN') return true;
    if (tab === 'management') return false;
    return user.allowedTabs.includes(tab);
  };

  const menuItems: { id: MainTab; label: string; icon: React.ReactNode; color: string; allowed: boolean }[] = [
    { id: 'production', label: 'Production', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, color: 'text-blue-600', allowed: isTabAllowed('production') },
    { id: 'prestation_prod', label: 'Prestations', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-4-7 4v12Z"/><path d="M7 22v-8"/><path d="M17 22v-8"/><path d="M12 22v-5"/></svg>, color: 'text-purple-600', allowed: isTabAllowed('prestation_prod') },
    { id: 'prestation_etuvage', label: 'Étuvage', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12c0 2 2 4 4 4s4-2 4-4-2-4-4-4-4 2-4 4Z"/><path d="M12 12c0 2 2 4 4 4s4-2 4-4-2-4-4-4-4 2-4 4Z"/><path d="M8 8s1-4 4-4 4 4 4 4"/><path d="M8 16s1 4 4 4 4-4 4-4"/></svg>, color: 'text-orange-600', allowed: isTabAllowed('prestation_etuvage') },
    { id: 'stock', label: 'Stocks', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>, color: 'text-emerald-600', allowed: isTabAllowed('stock') },
    { id: 'insights', label: 'Analyses IA', icon: <ICONS.Ai className="w-5 h-5" />, color: 'text-indigo-600', allowed: isTabAllowed('insights') },
    { id: 'management', label: 'Gestion', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>, color: 'text-amber-600', allowed: user.role === 'ADMIN' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white sticky top-0 h-screen shadow-2xl z-50">
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter text-blue-400 leading-tight uppercase">Ets Haddoud Moncef</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Système de Gestion</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.filter(item => item.allowed).map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-red-600/20 hover:border-red-600/30 transition-all text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen pb-24 lg:pb-0">
        <header className={`lg:hidden ${user.role === 'ADMIN' ? 'bg-slate-900' : 'bg-blue-700'} text-white p-4 shadow-lg sticky top-0 z-50 transition-colors`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${user.role === 'ADMIN' ? 'bg-amber-500 text-slate-900' : 'bg-blue-600 text-white'}`}>
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm font-bold flex items-center gap-2 leading-none uppercase">
                  {user.name}
                </h1>
                <p className="text-[10px] text-blue-200 mt-1 opacity-80 uppercase tracking-widest font-black">
                  {getTabLabel(activeTab)}
                </p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* BOTTOM NAV (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex p-2 z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] overflow-x-auto no-scrollbar">
          <div className="flex min-w-full justify-between gap-1">
            {menuItems.filter(item => item.allowed).map(item => (
              <button 
                key={item.id} 
                onClick={() => onTabChange(item.id)} 
                className={`flex flex-col items-center gap-1 flex-1 min-w-[60px] transition-all ${activeTab === item.id ? item.color : 'text-slate-400 opacity-60'}`}
              >
                <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-slate-50' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter">{item.label === 'Étuvage' ? 'Étuage' : item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
