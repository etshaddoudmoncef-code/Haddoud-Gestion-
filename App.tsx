import React, { useState, useEffect, useMemo } from 'react';
import { 
  ProductionRecord, PurchaseRecord, StockOutRecord, 
  PrestationProdRecord, PrestationEtuvageRecord, 
  User, MasterData, MainTab 
} from './types.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import RecordForm from './components/RecordForm.tsx';
import History from './components/History.tsx';
import AiInsights from './components/AiInsights.tsx';
import Login from './components/Login.tsx';
import Management from './components/Management.tsx';
import StockModule from './components/StockModule.tsx';
import LotTraceability from './components/LotTraceability.tsx';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const DEFAULT_MASTER: MasterData = {
  products: ['Tomate Roma', 'Tomate Cerise', 'Poivron'],
  packagings: ['Caisse 10kg', 'Barquette 500g'],
  clients: ['Client Local', 'Export'],
  suppliers: ['AgriDirect', 'BioGrow'],
  purchaseCategories: ['Intrants', 'Emballages'],
  serviceTypes: ['Triage', 'Conditionnement']
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('h_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<MainTab>('production');
  const [prodSub, setProdSub] = useState<'stats' | 'form' | 'journal' | 'lots'>('stats');
  const [editing, setEditing] = useState<any>(null);

  // Persistence helpers
  const [records, setRecords] = useState<ProductionRecord[]>(() => JSON.parse(localStorage.getItem('h_records') || '[]'));
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('h_users') || '[]'));
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => JSON.parse(localStorage.getItem('h_purchases') || '[]'));
  const [stockOuts, setStockOuts] = useState<StockOutRecord[]>(() => JSON.parse(localStorage.getItem('h_stockouts') || '[]'));
  const [master, setMaster] = useState<MasterData>(() => JSON.parse(localStorage.getItem('h_master') || JSON.stringify(DEFAULT_MASTER)));

  useEffect(() => {
    localStorage.setItem('h_records', JSON.stringify(records));
    localStorage.setItem('h_users', JSON.stringify(users));
    localStorage.setItem('h_purchases', JSON.stringify(purchases));
    localStorage.setItem('h_stockouts', JSON.stringify(stockOuts));
    localStorage.setItem('h_master', JSON.stringify(master));
    if (currentUser) localStorage.setItem('h_user', JSON.stringify(currentUser));
    else localStorage.removeItem('h_user');
  }, [records, users, purchases, stockOuts, master, currentUser]);

  const isAdmin = currentUser?.role === 'ADMIN';

  if (!currentUser) return <Login onLogin={setCurrentUser} existingUsers={users} onRegisterAdmin={(u) => { setUsers([...users, u]); setCurrentUser(u); }} />;

  const renderTabContent = () => {
    switch(activeTab) {
      case 'production':
        return (
          <div className="space-y-6">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 sticky top-[72px] lg:top-4 z-40 overflow-x-auto no-scrollbar">
              {[
                { id: 'stats', label: 'Stats' },
                { id: 'form', label: editing ? 'Édition' : 'Saisie' },
                { id: 'journal', label: 'Journal' },
                { id: 'lots', label: 'Traçabilité' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setProdSub(t.id as any); if(t.id !== 'form') setEditing(null); }}
                  className={`flex-1 min-w-[80px] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${prodSub === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {prodSub === 'stats' && <Dashboard records={records} isAdmin={isAdmin} />}
            {prodSub === 'form' && (
              <RecordForm 
                masterData={master} 
                initialData={editing} 
                onSubmit={(d) => {
                  if (editing) {
                    setRecords(prev => prev.map(r => r.id === editing.id ? { ...r, ...d } : r));
                    setEditing(null);
                  } else {
                    setRecords([...records, { ...d, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }]);
                  }
                  setProdSub('journal');
                }} 
              />
            )}
            {prodSub === 'journal' && (
              <History 
                records={records} 
                isAdmin={isAdmin} 
                onEdit={(r) => { setEditing(r); setProdSub('form'); }} 
                onDelete={(id) => setRecords(prev => prev.filter(r => r.id !== id))} 
              />
            )}
            {prodSub === 'lots' && <LotTraceability records={records} purchases={purchases} />}
          </div>
        );
      case 'stock':
        return (
          <StockModule 
            purchases={purchases} stockOuts={stockOuts} masterData={master} isAdmin={isAdmin}
            onAddPurchase={p => setPurchases([...purchases, { ...p, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
            onAddStockOut={s => setStockOuts([...stockOuts, { ...s, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
            onDeletePurchase={id => setPurchases(prev => prev.filter(p => p.id !== id))}
            onDeleteStockOut={id => setStockOuts(prev => prev.filter(s => s.id !== id))}
          />
        );
      case 'insights':
        return <AiInsights records={records} isAdmin={isAdmin} />;
      case 'management':
        return (
          <Management 
            data={master} users={users} onUpdate={setMaster} 
            onUpdatePermissions={(uid, tabs) => setUsers(prev => prev.map(u => u.id === uid ? { ...u, allowedTabs: tabs } : u))}
            onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))}
            onAddUser={u => setUsers([...users, u])}
          />
        );
      default: return <div className="p-20 text-center text-slate-400 italic">Module en cours de développement...</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={currentUser} onLogout={() => setCurrentUser(null)}>
      {renderTabContent()}
    </Layout>
  );
};

export default App;