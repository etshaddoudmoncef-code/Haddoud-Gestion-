import React, { useState } from 'react';
import { User, MainTab } from '../types.ts';
import { generateId } from '../App.tsx';

interface Props {
  onLogin: (u: User) => void;
  existingUsers: User[];
  onRegisterAdmin: (u: User) => void;
}

const Login: React.FC<Props> = ({ onLogin, existingUsers, onRegisterAdmin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const isFirstRun = existingUsers.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFirstRun) {
      const admin: User = {
        id: generateId(), name: user, username: user.toLowerCase(), password: pass,
        role: 'ADMIN', createdAt: Date.now(), allowedTabs: ['production', 'prestation_prod', 'prestation_etuvage', 'stock', 'insights', 'management']
      };
      onRegisterAdmin(admin);
    } else {
      const found = existingUsers.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);
      if (found) onLogin(found);
      else setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900 p-10 text-white text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Haddoud Moncef</h1>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            {isFirstRun ? 'Configuration Initiale' : 'Espace Sécurisé'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
          <div className="space-y-4">
            <input 
              className="w-full bg-slate-100 rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
              placeholder="Utilisateur" value={user} onChange={e => setUser(e.target.value)} required 
            />
            <input 
              type="password" className="w-full bg-slate-100 rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
              placeholder="Mot de passe" value={pass} onChange={e => setPass(e.target.value)} required 
            />
          </div>
          <button className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            {isFirstRun ? 'Créer le compte Administrateur' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;