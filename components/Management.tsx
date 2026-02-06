
import React, { useState, useRef, useEffect } from 'react';
import { MasterData, User, MainTab } from '../types.ts';
import { saveToGoogleDrive, restoreFromGoogleDrive, initGoogleDriveApi } from '../services/googleDriveService.ts';

interface ManagementProps {
  data: MasterData;
  users: User[];
  onUpdate: (newData: MasterData) => void;
  onUpdatePermissions: (userId: string, allowedTabs: MainTab[]) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser?: (user: User) => void;
  onResetPassword?: (userId: string, newPass: string) => void;
}

const Management: React.FC<ManagementProps> = ({ 
  data, 
  users, 
  onUpdate, 
  onUpdatePermissions, 
  onDeleteUser,
  onAddUser,
  onResetPassword 
}) => {
  const [newItem, setNewItem] = useState({ products: '', packagings: '', clients: '', suppliers: '', purchaseCategories: '', serviceTypes: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean, error: string | null, lastAction: string | null }>({ loading: false, error: null, lastAction: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initGoogleDriveApi().catch(console.error);
  }, []);

  const addItem = (category: keyof MasterData) => {
    const val = (newItem[category] as string).trim();
    if (!val) return;
    if ((data[category] as string[]).includes(val)) {
      alert("Cet élément existe déjà.");
      return;
    }
    const updated = { ...data, [category]: [...(data[category] as string[]), val] };
    onUpdate(updated);
    setNewItem({ ...newItem, [category]: '' });
  };

  const removeItem = (category: keyof MasterData, item: string) => {
    if (!confirm(`Supprimer "${item}" de la liste ?`)) return;
    const updated = { ...data, [category]: (data[category] as string[]).filter(i => i !== item) };
    onUpdate(updated);
  };

  const togglePermission = (user: User, tab: MainTab) => {
    let newTabs = [...user.allowedTabs];
    if (newTabs.includes(tab)) {
      newTabs = newTabs.filter(t => t !== tab);
    } else {
      newTabs.push(tab);
    }
    onUpdatePermissions(user.id, newTabs);
  };

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) return alert("Remplissez tous les champs.");
    
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return alert("Ce nom d'utilisateur est déjà pris.");
    }

    const operator: User = {
      id: crypto.randomUUID(),
      name: newUser.name,
      username: newUser.username.toLowerCase(),
      password: newUser.password,
      role: 'OPERATOR',
      createdAt: Date.now(),
      allowedTabs: ['production']
    };

    if (onAddUser) onAddUser(operator);
    setNewUser({ name: '', username: '', password: '' });
    setShowAddUser(false);
  };

  const handleGoogleSave = async () => {
    setSyncStatus({ loading: true, error: null, lastAction: 'sauvegarde' });
    try {
      await saveToGoogleDrive();
      setSyncStatus({ loading: false, error: null, lastAction: 'sauvegarde_ok' });
      alert("✅ Sauvegarde réussie sur le Cloud !\n\nVous pouvez maintenant restaurer ces données sur n'importe quel autre appareil en utilisant le même compte Google.");
    } catch (err: any) {
      console.error(err);
      setSyncStatus({ loading: false, error: "Échec de la connexion Google Drive.", lastAction: null });
      alert("❌ Erreur de sauvegarde. Vérifiez votre connexion Internet et vos autorisations Google.");
    }
  };

  const handleGoogleRestore = async () => {
    if (!confirm("⚠️ ATTENTION : La restauration va REMPLACER toutes les données actuelles de cet appareil par celles du Cloud. Continuer ?")) return;
    setSyncStatus({ loading: true, error: null, lastAction: 'restauration' });
    try {
      const json = await restoreFromGoogleDrive();
      if (json) {
        Object.keys(json).forEach(key => {
          if (key.startsWith('prod_')) {
            localStorage.setItem(key, json[key]);
          }
        });
        setSyncStatus({ loading: false, error: null, lastAction: 'restauration_ok' });
        alert("✅ Données récupérées avec succès ! L'application va redémarrer pour appliquer les changements.");
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus({ loading: false, error: err.message || "Erreur lors de la récupération.", lastAction: null });
      alert("❌ Aucune sauvegarde trouvée ou erreur réseau.");
    }
  };

  const exportDatabase = () => {
    const fullData = {
      prod_users: localStorage.getItem('prod_users'),
      prod_records: localStorage.getItem('prod_records'),
      prod_prestation_prod: localStorage.getItem('prod_prestation_prod'),
      prod_prestation_etuvage: localStorage.getItem('prod_prestation_etuvage'),
      prod_purchases: localStorage.getItem('prod_purchases'),
      prod_stock_outs: localStorage.getItem('prod_stock_outs'),
      prod_master_data: localStorage.getItem('prod_master_data'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_haddoud_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("Remplacer les données locales par ce fichier ?")) {
          Object.keys(json).forEach(key => {
            if (key.startsWith('prod_')) localStorage.setItem(key, json[key]);
          });
          window.location.reload();
        }
      } catch (err) { alert("Fichier invalide."); }
    };
    reader.readAsText(file);
  };

  const Section = ({ title, category, placeholder, icon, color }: { title: string, category: keyof MasterData, placeholder: string, icon: string, color: string }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 h-full">
      <h3 className={`text-sm font-black ${color} uppercase tracking-wider flex justify-between items-center`}>
        <span>{icon} {title}</span>
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{(data[category] as string[]).length}</span>
      </h3>
      <div className="flex gap-2">
        <input 
          type="text"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={newItem[category] as string}
          onChange={(e) => setNewItem({ ...newItem, [category]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && addItem(category)}
        />
        <button onClick={() => addItem(category)} className="bg-slate-800 text-white p-2 rounded-xl hover:bg-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1 no-scrollbar">
        {(data[category] as string[]).map(item => (
          <div key={item} className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
            {item}
            <button onClick={() => removeItem(category, item)} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="px-2">
        <h2 className="text-2xl font-black text-slate-900">Administration</h2>
        <p className="text-xs text-slate-500">Synchronisez vos données pour les retrouver sur tous vos appareils.</p>
      </div>

      {/* Module Cloud Sync - Focus utilisateur */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-white/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17.5 19c.7 0 1.3-.2 1.8-.7.5-.4.7-1 .7-1.8 0-1.2-.8-2.2-2-2.5.1-.3.2-.6.2-1 0-1.7-1.3-3-3-3-.4 0-.8.1-1.1.2C13.5 8.6 11.9 7 10 7c-2.2 0-4 1.8-4 4 0 .3 0 .5.1.8C4.3 12.3 3 13.9 3 15.8c0 2.1 1.7 3.8 3.8 3.8h10.7z"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Synchronisation Cloud</h3>
            <p className="text-xs text-blue-200/60 font-medium">Connectez-vous à ets.haddoudmoncef@gmail.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <button 
            disabled={syncStatus.loading}
            onClick={handleGoogleSave}
            className={`flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-[2rem] transition-all ${syncStatus.loading && syncStatus.lastAction === 'sauvegarde' ? 'bg-white/5 opacity-50' : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sauvegarder</span>
          </button>

          <button 
            disabled={syncStatus.loading}
            onClick={handleGoogleRestore}
            className={`flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-[2rem] border-2 transition-all ${syncStatus.loading && syncStatus.lastAction === 'restauration' ? 'opacity-50' : 'border-white/20 hover:bg-white/5'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Récupérer</span>
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-[10px] leading-relaxed text-blue-100/60">
          <p className="font-bold text-blue-200 mb-1">MODE D'EMPLOI MULTI-APPAREILS :</p>
          1. Cliquez sur <b>Sauvegarder</b> sur cet appareil.<br/>
          2. Sur votre nouvel appareil, connectez-vous et cliquez sur <b>Récupérer</b>.<br/>
          3. Les deux appareils seront alors identiques.
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilitaires locaux</h4>
        <div className="flex gap-2">
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={importDatabase} />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[10px] font-black uppercase">Import JSON</button>
          <button onClick={exportDatabase} className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase">Export JSON</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Opérateurs</h4>
            <button onClick={() => setShowAddUser(!showAddUser)} className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase">{showAddUser ? 'Annuler' : '+ Ajouter'}</button>
          </div>
          {showAddUser && (
            <form onSubmit={handleCreateOperator} className="bg-white p-6 rounded-3xl border-2 border-amber-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="Nom complet" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="Identifiant de connexion" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
              <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="Mot de passe" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-3 rounded-xl uppercase text-[10px]">Créer le compte</button>
            </form>
          )}
          <div className="space-y-3">
            {users.filter(u => u.role === 'OPERATOR').map(user => (
              <div key={user.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm">{user.name[0]}</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">{user.name}</span>
                      <span className="text-[9px] font-bold text-slate-400">Login: {user.username}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => confirm(`Supprimer ${user.name} ?`) && onDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                  {['production', 'prestation_prod', 'prestation_etuvage', 'stock', 'insights'].map(tab => (
                    <button key={tab} onClick={() => togglePermission(user, tab as MainTab)} className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${user.allowedTabs.includes(tab as MainTab) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{tab.split('_')[0]}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section title="Produits" category="products" placeholder="Ex: Tomate Roma" icon="📦" color="text-slate-800" />
          <Section title="Emballages" category="packagings" placeholder="Ex: Caisse 10kg" icon="🏷️" color="text-slate-800" />
          <Section title="Clients" category="clients" placeholder="Ex: Client Export" icon="🏢" color="text-slate-800" />
          <Section title="Services" category="serviceTypes" placeholder="Ex: Calibrage" icon="⚙️" color="text-purple-600" />
          <Section title="Fournisseurs" category="suppliers" placeholder="Ex: AgriPlus" icon="🤝" color="text-emerald-700" />
          <Section title="Catégories Stock" category="purchaseCategories" placeholder="Ex: Intrants" icon="📂" color="text-emerald-700" />
        </div>
      </div>
    </div>
  );
};

export default Management;
