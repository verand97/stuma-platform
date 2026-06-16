'use client';

import React, { useState } from 'react';
import { ShoppingBag, LayoutDashboard, Shield, ArrowRight, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import { UserRole, ROLE_CONFIG, MOCK_USERS, UserSession } from '../../utils/types';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
  onBackToLanding: () => void;
}

const ROLE_ICONS = {
  pelanggan: ShoppingBag,
  admin: LayoutDashboard,
  superadmin: Shield,
};

const ROLE_COLORS = {
  pelanggan: {
    bg: 'bg-[#7F56FF]/10',
    border: 'border-[#7F56FF]/30',
    hoverBorder: 'hover:border-[#7F56FF]',
    text: 'text-[#7F56FF]',
    shadow: 'hover:shadow-[0_0_15px_rgba(127,86,255,0.15)]',
  },
  admin: {
    bg: 'bg-[#FFA726]/10',
    border: 'border-[#FFA726]/30',
    hoverBorder: 'hover:border-[#FFA726]',
    text: 'text-[#FFA726]',
    shadow: 'hover:shadow-[0_0_15px_rgba(255,167,38,0.15)]',
  },
  superadmin: {
    bg: 'bg-[#26C6DA]/10',
    border: 'border-[#26C6DA]/30',
    hoverBorder: 'hover:border-[#26C6DA]',
    text: 'text-[#26C6DA]',
    shadow: 'hover:shadow-[0_0_15px_rgba(38,198,218,0.15)]',
  },
};

export default function LoginScreen({ onLogin, onBackToLanding }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // States for standard form mode (UI mock)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const roles: UserRole[] = ['pelanggan', 'admin', 'superadmin'];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate and return a role.
    // Here, we proceed to show the mock role selector.
    setShowRoleSelect(true);
  };

  return (
    <div className="min-h-screen bg-[#1E1F22] flex flex-col items-center justify-center p-4 relative overflow-hidden text-off-white font-sans selection:bg-[#7F56FF] selection:text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7F56FF]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#80FF56]/5 blur-[120px]" />
      </div>

      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 text-grey-muted hover:text-off-white transition-colors z-20"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {!showRoleSelect ? (
        <div className="relative z-10 w-full max-w-md bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-2xl animate-slideUp">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-[#7F56FF] to-purple-800 flex items-center justify-center font-bold text-white text-2xl shadow-[0_0_15px_rgba(127,86,255,0.4)] mb-4">
              S
            </div>
            <h2 className="font-title text-2xl font-bold">
              {authMode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </h2>
            <p className="text-sm text-grey-muted mt-1 text-center">
              Platform e-commerce UMKM Web3 pertama di Indonesia
            </p>
          </div>

          <div className="flex bg-[#111214] border border-[#383A40] rounded-xl p-1 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                authMode === 'login' ? 'bg-[#7F56FF] text-white shadow-md' : 'text-grey-muted hover:text-off-white'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                authMode === 'register' ? 'bg-[#7F56FF] text-white shadow-md' : 'text-grey-muted hover:text-off-white'
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            {authMode === 'register' && (
              <div>
                <label className="text-xs text-grey-muted font-semibold mb-1.5 block">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#7F56FF] text-off-white placeholder:text-[#383A40]"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs text-grey-muted font-semibold mb-1.5 block">Alamat Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@contoh.com"
                  className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#7F56FF] text-off-white placeholder:text-[#383A40]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-grey-muted font-semibold mb-1.5 block">Kata Sandi</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#7F56FF] text-off-white placeholder:text-[#383A40]"
                />
              </div>
            </div>

            {authMode === 'login' && (
              <div className="flex justify-end">
                <a href="#" className="text-xs text-[#7F56FF] hover:text-[#80FF56] transition-colors font-semibold">Lupa kata sandi?</a>
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-2 bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(127,86,255,0.3)] hover:shadow-[0_0_25px_rgba(127,86,255,0.5)]"
            >
              {authMode === 'login' ? 'Masuk ke STUMA' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#383A40] text-center">
             <p className="text-xs text-grey-muted mb-4">Atau hubungkan langsung dengan Web3 Wallet</p>
             <button 
               onClick={() => setShowRoleSelect(true)}
               className="w-full bg-transparent border border-[#383A40] hover:border-[#80FF56] text-off-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:text-[#80FF56]"
             >
               <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px]">🦊</span>
               Hubungkan MetaMask
             </button>
          </div>
        </div>
      ) : (
        /* Role Selection Mock / Demo State */
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-fadeIn">
          <div className="text-center mb-10">
            <h2 className="font-title text-3xl font-bold mb-3 text-off-white">Pilih Mode Akun (Simulasi Demo)</h2>
            <p className="text-grey-muted text-sm">Pilih peran pengguna di bawah ini untuk mensimulasikan login ke dashboard masing-masing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {roles.map((role, idx) => {
              const config = ROLE_CONFIG[role];
              const colors = ROLE_COLORS[role];
              const Icon = ROLE_ICONS[role];
              
              // Use mock user data but override name/email if provided in registration
              const baseUser = MOCK_USERS[role];
              const userToLogin = {
                ...baseUser,
                name: (authMode === 'register' && name) ? name : baseUser.name,
                email: (email) ? email : baseUser.email,
              };

              return (
                <button
                  key={role}
                  onClick={() => onLogin(userToLogin)}
                  className={`group relative bg-[#2B2D31] border ${colors.border} ${colors.hoverBorder} rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 ${colors.shadow}`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="font-title font-bold text-lg text-off-white mb-1.5">
                    {config.label}
                  </h3>
                  <p className="text-xs text-grey-muted leading-relaxed mb-5">
                    {config.description}
                  </p>

                  <div className="bg-[#111214] border border-[#383A40] rounded-xl p-3 mb-4">
                    <p className="text-[11px] text-grey-muted">
                      <span className="text-off-white font-semibold">{userToLogin.name}</span>
                    </p>
                    <p className="text-[10px] text-grey-muted font-mono mt-1 truncate">
                      {userToLogin.walletAddress.substring(0, 10)}...{userToLogin.walletAddress.substring(36)}
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 ${colors.text} text-xs font-semibold group-hover:gap-3 transition-all`}>
                    <span>Lanjutkan sebagai {config.label}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
          <button 
            onClick={() => setShowRoleSelect(false)}
            className="mt-8 text-sm text-grey-muted hover:text-off-white transition-colors"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
