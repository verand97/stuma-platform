'use client';

import React, { useState } from 'react';
import { ShoppingBag, LayoutDashboard, Shield, ArrowRight, ArrowLeft, Mail, Lock, User as UserIcon, Wallet } from 'lucide-react';
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
    glow: 'group-hover:shadow-[0_0_30px_rgba(127,86,255,0.2)]',
  },
  admin: {
    bg: 'bg-[#FFA726]/10',
    border: 'border-[#FFA726]/30',
    hoverBorder: 'hover:border-[#FFA726]',
    text: 'text-[#FFA726]',
    glow: 'group-hover:shadow-[0_0_30px_rgba(255,167,38,0.2)]',
  },
  superadmin: {
    bg: 'bg-[#80FF56]/10',
    border: 'border-[#80FF56]/30',
    hoverBorder: 'hover:border-[#80FF56]',
    text: 'text-[#80FF56]',
    glow: 'group-hover:shadow-[0_0_30px_rgba(128,255,86,0.2)]',
  },
};

export default function LoginScreen({ onLogin, onBackToLanding }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // States for standard form mode (UI mock)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  // Simple local DB for prototype
  const [userDb, setUserDb] = useState<Record<string, UserSession>>(() => {
    if (typeof window !== 'undefined') {
      const savedDb = localStorage.getItem('stuma_users_db');
      if (savedDb) {
        return JSON.parse(savedDb);
      }
      const initialDb = {
        [MOCK_USERS.superadmin.email]: MOCK_USERS.superadmin,
        [MOCK_USERS.admin.email]: MOCK_USERS.admin,
        [MOCK_USERS.pelanggan.email]: MOCK_USERS.pelanggan,
      };
      localStorage.setItem('stuma_users_db', JSON.stringify(initialDb));
      return initialDb;
    }
    return {};
  });

  const handleMetaMaskLogin = async () => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const win = window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } };
      try {
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          
          const metaMaskUser: UserSession = {
            name: 'Web3 Admin',
            email: 'admin@web3.eth',
            role: 'admin',
            walletAddress: walletAddress,
          };
          onLogin(metaMaskUser);
        }
      } catch {
        alert('Gagal menghubungkan MetaMask. Silakan coba lagi.');
      }
    } else {
      alert('MetaMask tidak terdeteksi! Silakan install ekstensi dompet Web3 di browser Anda.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists in our local DB
    if (userDb[email]) {
      // If user exists, log them in immediately with their saved role
      onLogin(userDb[email]);
      return;
    }

    // If user does not exist (new user), we force them to choose a role
    setShowRoleSelect(true);
  };

  const handleRoleSelection = (role: UserRole) => {
    const baseUser = MOCK_USERS[role];
    const newUser: UserSession = {
      ...baseUser,
      name: name || baseUser.name,
      email: email || baseUser.email,
      role: role, // Explicitly set the role they chose
    };

    // Save to local DB so they can't change it later
    const updatedDb = { ...userDb, [newUser.email]: newUser };
    setUserDb(updatedDb);
    localStorage.setItem('stuma_users_db', JSON.stringify(updatedDb));

    // Proceed to login
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex w-full font-sans selection:bg-[#7F56FF] selection:text-white">
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Abstract Animated Background matching Landing Page */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F56FF]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#80FF56]/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
          {/* Gradient overlay to ensure text is readable */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0A0A0C]/50 to-[#0A0A0C]/90"></div>
        </div>

        {/* Content Top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#7F56FF] to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-[0_0_20px_rgba(127,86,255,0.4)]">
            S
          </div>
          <span className="font-title text-2xl font-bold tracking-tight text-white">STUMA</span>
        </div>

        {/* Content Middle */}
        <div className="relative z-10 mb-20 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111214]/80 backdrop-blur-md border border-[#383A40] text-off-white text-[10px] font-bold uppercase tracking-widest mb-6">
            <Shield size={12} className="text-[#80FF56]" /> Portal Masuk Aman
          </div>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-title font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
            Web3 E-Commerce <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-[#7F56FF]">
              Masa Depan UMKM
            </span>
          </h1>
          <p className="text-lg text-grey-muted leading-relaxed">
            STUMA mengeliminasi biaya payment gateway tradisional. Transaksi 100% menggunakan USDT di jaringan Layer 2 dengan sistem <span className="text-white font-semibold border-b border-[#7F56FF]/50 pb-0.5">Batch Withdrawal</span> yang menekan gas fee hingga 95%.
          </p>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-grey-muted font-bold uppercase tracking-widest">
          <span>© {new Date().getFullYear()} STUMA Platform</span>
          <span className="w-1 h-1 bg-[#383A40] rounded-full"></span>
          <a href="#" className="hover:text-white transition-colors">Bantuan Web3</a>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#0A0A0C] border-l border-[#383A40]/50 z-20 overflow-y-auto">
        {/* Mobile Background Effects (only visible on mobile) */}
        <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-[#7F56FF]/10 rounded-full blur-[100px]"></div>
        </div>

        <button 
          onClick={onBackToLanding}
          className="absolute top-6 left-6 lg:left-8 flex items-center gap-2 text-grey-muted hover:text-white bg-[#111214] border border-[#383A40] px-4 py-2 rounded-full transition-all hover:border-[#7F56FF]/50 z-30 group text-sm font-semibold shadow-md"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        {!showRoleSelect ? (
          <div className="relative z-10 w-full max-w-md animate-slideUp mt-10 lg:mt-0">
            <div className="flex flex-col mb-8">
              <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {authMode === 'login' ? 'Selamat Datang' : 'Buat Akun Web3'}
              </h2>
              <p className="text-sm text-grey-muted mt-2">
                Masuk ke ekosistem e-commerce desentralisasi
              </p>
            </div>

            {/* Toggle Login/Register */}
            <div className="flex bg-[#111214] border border-[#383A40] rounded-xl p-1 mb-8 relative">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold z-10 transition-colors ${
                  authMode === 'login' ? 'text-white' : 'text-grey-muted hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold z-10 transition-colors ${
                  authMode === 'register' ? 'text-[#0A0A0C]' : 'text-grey-muted hover:text-white'
                }`}
              >
                Daftar
              </button>
              {/* Sliding highlight */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out ${
                  authMode === 'login' ? 'bg-[#383A40] translate-x-0' : 'bg-[#80FF56] translate-x-full'
                }`}
              ></div>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] text-grey-muted font-bold uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted group-focus-within:text-[#7F56FF] transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#7F56FF] focus:ring-1 focus:ring-[#7F56FF] text-white placeholder:text-[#383A40] transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-[11px] text-grey-muted font-bold uppercase tracking-widest mb-2 block">Alamat Email / ENS</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted group-focus-within:text-[#7F56FF] transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@domain.com atau nama.eth"
                    className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#7F56FF] focus:ring-1 focus:ring-[#7F56FF] text-white placeholder:text-[#383A40] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] text-grey-muted font-bold uppercase tracking-widest block">Kata Sandi</label>
                  {authMode === 'login' && (
                    <a href="#" className="text-xs text-[#80FF56] hover:text-white transition-colors font-bold">Lupa sandi?</a>
                  )}
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted group-focus-within:text-[#7F56FF] transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#7F56FF] focus:ring-1 focus:ring-[#7F56FF] text-white placeholder:text-[#383A40] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-linear-to-r from-[#7F56FF] to-indigo-600 hover:from-[#6c42f0] hover:to-indigo-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(127,86,255,0.3)] hover:shadow-[0_0_30px_rgba(127,86,255,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {authMode === 'login' ? 'Masuk ke STUMA' : 'Selesaikan Pendaftaran'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#383A40]">
               <div className="relative flex items-center justify-center mb-6">
                  <span className="absolute bg-[#0A0A0C] px-4 text-[10px] uppercase tracking-widest text-grey-muted font-bold z-10">Atau Web3 Login</span>
                  <div className="w-full h-px bg-[#383A40]"></div>
               </div>
               
               <button 
                 onClick={handleMetaMaskLogin}
                 className="w-full bg-[#111214] border border-[#383A40] hover:border-orange-500/50 text-white py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 group"
               >
                 <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Wallet size={14} className="text-orange-400"/>
                 </div>
                 Hubungkan MetaMask
               </button>
            </div>
          </div>
        ) : (
          /* Role Selection State */
          <div className="relative z-10 w-full max-w-md lg:max-w-xl flex flex-col animate-fadeIn mt-10 lg:mt-0">
            <div className="mb-10">
              <h2 className="font-title text-3xl sm:text-4xl font-extrabold mb-3 text-white tracking-tight">Pilih Jenis Akun</h2>
              <p className="text-grey-muted text-sm sm:text-base leading-relaxed">Selamat datang, <span className="text-white font-bold">{name || email.split('@')[0]}</span>! Silakan pilih bagaimana Anda ingin menggunakan platform STUMA hari ini.</p>
            </div>
            
            <div className="flex flex-col gap-5 w-full">
              {['pelanggan', 'admin'].map((role, idx) => {
                const typedRole = role as UserRole;
                const config = ROLE_CONFIG[typedRole];
                const colors = ROLE_COLORS[typedRole];
                const Icon = ROLE_ICONS[typedRole];
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelection(typedRole)}
                    className={`group relative bg-[#111214] border border-[#383A40] ${colors.hoverBorder} rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.glow} overflow-hidden`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    {/* Decorative background glow per card */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none ${colors.bg.replace('/10', '')}`}></div>

                    <div className="flex items-start gap-6">
                      <div className={`shrink-0 w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={28} />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-title font-bold text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-grey-muted transition-all">
                          {config.label}
                        </h3>
                        <p className="text-sm text-grey-muted leading-relaxed mb-4">
                          {role === 'pelanggan' ? 'Jelajahi ribuan produk UMKM dan belanja dengan aman menggunakan crypto.' : 'Kelola toko Anda, terima pembayaran stablecoin tanpa potongan gateway.'}
                        </p>
                        
                        <div className={`inline-flex items-center gap-2 ${colors.text} text-xs font-bold uppercase tracking-widest`}>
                          <span>Pilih & Lanjutkan</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
