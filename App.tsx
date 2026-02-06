import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import PrestationProdModule from './components/PrestationProdModule.tsx';
import PrestationEtuvageModule from './components/PrestationEtuvageModule.tsx';

export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-5);

const DEFAULT_MASTER: MasterData = {
  products: ['Tomate Roma', 'Tomate Cerise', 'Poivron'],
  packagings: ['Caisse 10kg', 'Barquette 500g'],
  clients: ['Client Local', 'Export'],
  suppliers: ['AgriDirect', 'BioGrow'],
  purchaseCategories: ['Intrants', 'Emballages'],
  serviceTypes: ['Triage', 'Conditionnement']
};

const App: React.FC = () => {
  // Chargement sécurisé
  const load = useCallback((key: string, fallback: any) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Erreur LocalStorage [${key}]:`, e);
      return fallback;
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => load('prod_user', null));
  const [activeTab, setActiveTab] = useState<MainTab>('production');
  const [prodSub, setProdSub] = useState<'stats' | 'form' | 'journal' | 'lots'>('stats');
  const [editing, setEditing] = useState<any>(null);

  // Données
  const [records, setRecords] = useState<ProductionRecord[]>(() => load('prod_records', []));
  const [prestationProd, setPrestationProd] = useState<PrestationProdRecord[]>(() => load('prod_prestation_prod', []));
  const [prestationEtuvage, setPrestationEtuvage] = useState<PrestationEtuvageRecord[]>(() => load('prod_prestation_etuvage', []));
  const [users, setUsers] = useState<User[]>(() => load('prod_users', []));
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => load('prod_purchases', []));
  const [stockOuts, setStockOuts] = useState<StockOutRecord[]>(() => load('prod_stock_outs', []));
  const [master, setMaster] = useState<MasterData>(() => load('prod_master_data', DEFAULT_MASTER));

  // Sauvegarde sécurisée
  useEffect(() => {
    const save = (key: string, data: any) => {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
    };
    save('prod_records', records);
    save('prod_prestation_prod', prestationProd);
    save('prod_prestation_etuvage', prestationEtuvage);
    save('prod_users', users);
    save('prod_purchases', purchases);
    save('prod_stock_outs', stockOuts);
    save('prod_master_data', master);
    if (currentUser) save('prod_user', currentUser);
    else localStorage.removeItem('prod_user');
  }, [records, prestationProd, prestationEtuvage, users, purchases, stockOuts, master, currentUser]);

  const handleLogout = useCallback(() => setCurrentUser(null), []);

  if (!currentUser) {
    return (
      <Login 
        onLogin={setCurrentUser} 
        existingUsers={users} 
        onRegisterAdmin={(u) => { setUsers(prev => [...prev, u]); setCurrentUser(u); }} 
      />
    );
  }

  const isAdmin = currentUser.role === 'ADMIN';

  const renderContent = () => {
    switch(activeTab) {
      case 'production':
        return (
          <div className="space-y-6">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-40">
              {['stats', 'form', 'journal', 'lots'].map(t => (
                <button 
                  key={t} onClick={() => { setProdSub(t as any); if(t !== 'form') setEditing(null); }}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${prodSub === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  {t === 'stats' ? 'Tableau' : t === 'form' ? (editing ? 'Édition' : 'Saisie') : t === 'journal' ? 'Journal' : 'Lots'}
                </button>
              ))}
            </div>
            {prodSub === 'stats' && <Dashboard records={records} isAdmin={isAdmin} />}
            {prodSub === 'form' && (
              <RecordForm masterData={master} initialData={editing} onSubmit={(d) => {
                if (editing) setRecords(prev => prev.map(r => r.id === editing.id ? { ...r, ...d } : r));
                else setRecords(prev => [...prev, { ...d, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }]);
                setEditing(null); setProdSub('journal');
              }} />
            )}
            {prodSub === 'journal' && <History records={records} isAdmin={isAdmin} onEdit={(r) => { setEditing(r); setProdSub('form'); }} onDelete={(id) => setRecords(prev => prev.filter(r => r.id !== id))} />}
            {prodSub === 'lots' && <LotTraceability records={records} purchases={purchases} />}
          </div>
        );
      case 'prestation_prod':
        return <PrestationProdModule records={prestationProd} masterData={master} isAdmin={isAdmin} 
          onAdd={d => setPrestationProd(prev => [...prev, { ...d, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
          onUpdate={(id, d) => setPrestationProd(prev => prev.map(r => r.id === id ? { ...r, ...d } : r))}
          onDelete={id => setPrestationProd(prev => prev.filter(r => r.id !== id))} />;
      case 'prestation_etuvage':
        return <PrestationEtuvageModule records={prestationEtuvage} masterData={master} isAdmin={isAdmin}
          onAdd={d => setPrestationEtuvage(prev => [...prev, { ...d, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
          onUpdate={(id, d) => setPrestationEtuvage(prev => prev.map(r => r.id === id ? { ...r, ...d } : r))}
          onDelete={id => setPrestationEtuvage(prev => prev.filter(r => r.id !== id))} />;
      case 'stock':
        return <StockModule purchases={purchases} stockOuts={stockOuts} masterData={master} isAdmin={isAdmin}
          onAddPurchase={p => setPurchases(prev => [...prev, { ...p, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
          onAddStockOut={s => setStockOuts(prev => [...prev, { ...s, id: generateId(), timestamp: Date.now(), userId: currentUser.id, userName: currentUser.name }])}
          onUpdatePurchase={(id, d) => setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...d } : p))}
          onUpdateStockOut={(id, d) => setStockOuts(prev => prev.map(s => s.id === id ? { ...s, ...d } : s))}
          onDeletePurchase={id => setPurchases(prev => prev.filter(p => p.id !== id))}
          onDeleteStockOut={id => setStockOuts(prev => prev.filter(s => s.id !== id))} />;
      case 'insights':
        return <AiInsights records={records} isAdmin={isAdmin} />;
      case 'management':
        return <Management data={master} users={users} onUpdate={setMaster} 
          onUpdatePermissions={(uid, tabs) => setUsers(prev => prev.map(u => u.id === uid ? { ...u, allowedTabs: tabs } : u))}
          onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))}
          onAddUser={u => setUsers(prev => [...prev, u])} />;
      default: return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;