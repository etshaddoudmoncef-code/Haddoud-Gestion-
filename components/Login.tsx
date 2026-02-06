import React, { useState, useEffect } from 'react';
import { User, UserRole, MainTab } from '../types.ts';
import { generateId } from '../App.tsx';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('prod_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (allUsers.length === 0) {
      setMode('register');
    }
  }, [allUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = allUsers.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }

    const newUser: User = {
      id: generateId(),
      name: username.trim(),
      username: username.trim().toLowerCase(),
      password: password,
      role: 'ADMIN',
      createdAt: Date.now(),
      allowedTabs: ['production', 'prestation_prod', 'prestation_etuvage', 'stock', 'insights', 'management']
    };

    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem('prod_users', JSON.stringify(updatedUsers));
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 animate-in fade-in duration-500">
      <div className="w-full max-sm mb-12 sm:mb-0 max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-1 tracking-tighter uppercase leading-tight">Haddoud Moncef</h1>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">
              {allUsers.length === 0 ? "Configuration Initiale" : "Espace Sécurisé"}
            </p>
          </div>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Utilisateur</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Identifiant"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Mot de passe</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs mt-4"
              >
                Se connecter
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterAdmin} className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-4">
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                  Configuration initiale des <b>Ets Haddoud Moncef</b>. Veuillez créer le compte administrateur.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  placeholder="Ex: admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Mot de passe</label>
                <input
                  type="password"
                  placeholder="4 caractères min."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs mt-4"
              >
                Lancer le système
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;