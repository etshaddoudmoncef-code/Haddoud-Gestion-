import React, { useState, useEffect, useMemo } from 'react';
import { ProductionRecord, PurchaseRecord, StockOutRecord, PrestationProdRecord, PrestationEtuvageRecord, User, MasterData, MainTab } from './types.ts';
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

// Générateur d'ID robuste pour Android (Fallback si crypto.randomUUID est absent)
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const DEFAULT_MASTER_DATA: MasterData = {
  products: ['Tomate (Roma)', 'Poivron (Rouge)', 'Concombre'],
  packagings: ['Vrac (Sacs)', 'Caisse 10kg', 'Barquette 500g'],
  clients: ['Client A', 'Client B'],
  suppliers: ['AgriPlus', 'EcoPack', 'Fertilo'],
  purchaseCategories: ['Intrants', 'Emballages', 'Petit Matériel', 'Maintenance'],
  serviceTypes: ['Triage', 'Lavage', 'Calibrage', 'Conditionnement']
};

type ProductionSubTab = 'stats' | 'entry' | 'history' | 'lots';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('production');
  const [prodSubTab, setProdSubTab] = useState<ProductionSubTab>('stats');
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prod_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('prod_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [allRecords, setAllRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('prod_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [allPrestationProd, setAllPrestationProd] = useState<PrestationProdRecord[]>(() => {
    const saved = localStorage.getItem('prod_prestation_prod');
    return saved ? JSON.parse(saved) : [];
  });

  const [allPrestationEtuvage, setAllPrestationEtuvage] = useState<PrestationEtuvageRecord[]>(() => {
    const saved = localStorage.getItem('prod_prestation_etuvage');
    return saved ? JSON.parse(saved) : [];
  });

  const [allPurchases, setAllPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('prod_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [allStockOuts, setAllStockOuts] = useState<StockOutRecord[]>(() => {
    const saved = localStorage.getItem('prod_stock_outs');
    return saved ? JSON.parse(saved) : [];
  });

  const [masterData, setMasterData] = useState<MasterData>(() => {
    const saved = localStorage.getItem('prod_master_data');
    return saved ? JSON.parse(saved) : DEFAULT_MASTER_DATA;
  });

  useEffect(() => {
    if (currentUser) {
      const updatedUser = allUsers.find(u => u.id === currentUser.id);
      if (updatedUser && (
        JSON.stringify(updatedUser.allowedTabs) !== JSON.stringify(currentUser.allowedTabs) ||
        updatedUser.password !== currentUser.password
      )) {
        setCurrentUser(updatedUser);
      }
    }
  }, [allUsers]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      if (!currentUser.allowedTabs.includes(activeTab)) {
        setActiveTab(currentUser.allowedTabs[0] || 'production');
      }
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prod_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('prod_current_user');
    }
    localStorage.setItem('prod_users', JSON.stringify(allUsers));
    localStorage.setItem('prod_records', JSON.stringify(allRecords));
    localStorage.setItem('prod_prestation_prod', JSON.stringify(allPrestationProd));
    localStorage.setItem('prod_prestation_etuvage', JSON.stringify(allPrestationEtuvage));
    localStorage.setItem('prod_purchases', JSON.stringify(allPurchases));
    localStorage.setItem('prod_stock_outs', JSON.stringify(allStockOuts));
    localStorage.setItem('prod_master_data', JSON.stringify(masterData));
  }, [currentUser, allUsers, allRecords, allPrestationProd, allPrestationEtuvage, allPurchases, allStockOuts, masterData]);

  const userRecords = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return allRecords;
    return allRecords.filter(r => r.userId === currentUser.id);
  }, [allRecords, currentUser]);

  const handleAddRecord = (data: Omit<ProductionRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    const newRecord: ProductionRecord = { ...data, id: generateId(), userId: currentUser.id, userName: currentUser.name, timestamp: Date.now() };
    setAllRecords(prev => [...prev, newRecord]);
    setProdSubTab('history');
  };

  const handleUpdateRecord = (id: string, data: Partial<ProductionRecord>) => {
    setAllRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    setEditingRecord(null);
    setProdSubTab('history');
  };

  const handleUpdateUserPermissions = (userId: string, allowedTabs: MainTab[]) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, allowedTabs } : u));
  };

  const handleResetPassword = (userId: string, newPassword: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'production':
        return (
          <div className="space-y-4">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-x-auto no-scrollbar">
              {['stats', 'entry', 'history', 'lots'].map((t) => (
                <button 
                  key={t}
                  onClick={() => {
                    setProdSubTab(t as any);
                    if (t !== 'entry') setEditingRecord(null);
                  }}
                  className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${prodSubTab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t === 'stats' ? 'Stats' : t === 'entry' ? 'Saisie' : t === 'history' ? 'Journal' : 'Lots'}
                </button>
              ))}
            </div>
            {prodSubTab === 'stats' && <Dashboard records={userRecords} isAdmin={currentUser.role === 'ADMIN'} />}
            {prodSubTab === 'entry' && (
              <RecordForm 
                onSubmit={editingRecord ? (data) => handleUpdateRecord(editingRecord.id, data) : handleAddRecord} 
                masterData={masterData} 
                initialData={editingRecord || undefined}
              />
            )}
            {prodSubTab === 'history' && (
              <History 
                records={userRecords} 
                onDelete={(id) => setAllRecords(r => r.filter(x => x.id !== id))} 
                onEdit={(record) => {
                  setEditingRecord(record);
                  setProdSubTab('entry');
                }}
                isAdmin={currentUser.role === 'ADMIN'} 
              />
            )}
            {prodSubTab === 'lots' && <LotTraceability records={allRecords} purchases={allPurchases} />}
          </div>
        );
      case 'prestation_prod':
        return (
          <PrestationProdModule 
            records={allPrestationProd} 
            masterData={masterData} 
            onAdd={(d) => setAllPrestationProd(p => [...p, { ...d, id: generateId(), userId: currentUser.id, userName: currentUser.name, timestamp: Date.now() }])} 
            onUpdate={(id, d) => setAllPrestationProd(p => p.map(r => r.id === id ? { ...r, ...d } : r))}
            onDelete={(id) => setAllPrestationProd(p => p.filter(r => r.id !== id))} 
            isAdmin={currentUser.role === 'ADMIN'} 
          />
        );
      case 'prestation_etuvage':
        return (
          <PrestationEtuvageModule 
            records={allPrestationEtuvage} 
            masterData={masterData} 
            onAdd={(d) => setAllPrestationEtuvage(p => [...p, { ...d, id: generateId(), userId: currentUser.id, userName: currentUser.name, timestamp: Date.now() }])} 
            onUpdate={(id, d) => setAllPrestationEtuvage(p => p.map(r => r.id === id ? { ...r, ...d } : r))}
            onDelete={(id) => setAllPrestationEtuvage(p => p.filter(r => r.id !== id))} 
            isAdmin={currentUser.role === 'ADMIN'} 
          />
        );
      case 'stock':
        return (
          <StockModule 
            purchases={allPurchases} 
            stockOuts={allStockOuts} 
            masterData={masterData} 
            onAddPurchase={(d) => setAllPurchases(p => [...p, { ...d, id: generateId(), userId: currentUser.id, userName: currentUser.name, timestamp: Date.now() }])} 
            onAddStockOut={(d) => setAllStockOuts(s => [...s, { ...d, id: generateId(), userId: currentUser.id, userName: currentUser.name, timestamp: Date.now() }])} 
            onUpdatePurchase={(id, d) => setAllPurchases(p => p.map(r => r.id === id ? { ...r, ...d } : r))}
            onUpdateStockOut={(id, d) => setAllStockOuts(s => s.map(r => r.id === id ? { ...r, ...d } : r))}
            onDeletePurchase={(id) => setAllPurchases(p => p.filter(r => r.id !== id))} 
            onDeleteStockOut={(id) => setAllStockOuts(s => s.filter(r => r.id !== id))}
            isAdmin={currentUser.role === 'ADMIN'}
          />
        );
      case 'insights':
        return <AiInsights records={userRecords} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'management':
        return (
          <Management 
            data={masterData} 
            users={allUsers} 
            onUpdate={setMasterData} 
            onUpdatePermissions={handleUpdateUserPermissions} 
            onDeleteUser={(id) => setAllUsers(u => u.filter(x => x.id !== id))}
            onAddUser={(user) => setAllUsers(prev => [...prev, user])}
            onResetPassword={handleResetPassword}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={currentUser} onLogout={() => setCurrentUser(null)}>
      {renderContent()}
    </Layout>
  );
};

export default App;