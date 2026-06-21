'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Zap, Globe, CheckCircle2, ChevronRight, Play, Database, Lock, Activity, Users } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-off-white font-sans selection:bg-[#7F56FF] selection:text-white overflow-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0A0A0C]/80 backdrop-blur-xl border-[#383A40]/50 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7F56FF] to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(127,86,255,0.4)] group-hover:scale-105 transition-transform duration-300">
              S
            </div>
            <span className="font-title text-2xl font-bold tracking-tight text-white group-hover:text-[#80FF56] transition-colors">STUMA</span>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-semibold text-grey-muted">
            <a href="#ekosistem" className="hover:text-white hover:-translate-y-0.5 transition-all">Ekosistem</a>
            <a href="#infrastruktur" className="hover:text-white hover:-translate-y-0.5 transition-all">Infrastruktur L2</a>
            <a href="#keunggulan" className="hover:text-white hover:-translate-y-0.5 transition-all">Keunggulan</a>
          </div>
          <button 
            onClick={onNavigateToAuth}
            className="group relative px-6 py-2.5 rounded-full font-bold overflow-hidden bg-[#111214] border border-[#383A40] hover:border-[#7F56FF] transition-all"
          >
            <div className="absolute inset-0 w-0 bg-linear-to-r from-[#7F56FF] to-indigo-600 transition-all duration-400 ease-out group-hover:w-full"></div>
            <span className="relative flex items-center gap-2 group-hover:text-white text-grey-muted transition-colors">
              Masuk Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-20 px-6">
        {/* Abstract Video / Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F56FF]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#80FF56]/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <video 
            autoPlay loop muted playsInline 
            className="absolute top-0 left-0 w-full h-full object-cover opacity-[0.15] mix-blend-screen pointer-events-none"
            poster="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
          >
            <source src="https://cdn.pixabay.com/video/2021/09/11/88211-604085526_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0A0A0C]/80 to-[#0A0A0C]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-10">
          
          {/* Left: Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111214]/80 backdrop-blur-md border border-[#383A40] text-[#80FF56] text-xs font-bold uppercase tracking-widest mb-8 animate-slideUp shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80FF56] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#80FF56]"></span>
              </span>
              Mainnet Live on Polygon & Arbitrum
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-title font-extrabold tracking-tight mb-8 leading-[1.1] animate-slideUp" style={{ animationDelay: '100ms' }}>
              Web3 E-Commerce <br/>
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-linear-to-r from-[#7F56FF] to-indigo-500 blur-2xl opacity-40"></span>
                <span className="relative text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-[#7F56FF]">
                  Masa Depan UMKM
                </span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-grey-muted leading-relaxed mb-10 animate-slideUp" style={{ animationDelay: '200ms' }}>
              STUMA mengeliminasi biaya payment gateway tradisional. Transaksi 100% menggunakan USDT di jaringan Layer 2 dengan sistem <span className="text-white font-semibold border-b border-[#7F56FF]/50 pb-0.5">Batch Withdrawal</span> yang menekan gas fee hingga 95%.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 animate-slideUp" style={{ animationDelay: '300ms' }}>
              <button onClick={onNavigateToAuth} className="w-full sm:w-auto bg-[#7F56FF] hover:bg-[#6c42f0] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(127,86,255,0.4)] hover:shadow-[0_0_40px_rgba(127,86,255,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3">
                Mulai Berjualan <ArrowRight size={20} />
              </button>
              <a href="#ekosistem" className="w-full sm:w-auto bg-[#111214]/50 backdrop-blur-md border border-[#383A40] hover:border-[#80FF56] hover:bg-[#80FF56]/5 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 hover:-translate-y-1">
                <Play size={20} className="text-[#80FF56]" /> Tonton Demo
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 animate-slideUp" style={{ animationDelay: '400ms' }}>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-2 border-[#0A0A0C] bg-[#1E1F22] flex items-center justify-center shadow-md z-${5-i}`}>
                    <Users size={18} className="text-grey-muted"/>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 text-[#80FF56] font-bold">★</div>)}
                </div>
                <p className="text-sm font-medium text-white mt-1">Dipercaya 1,200+ Merchant Aktif</p>
              </div>
            </div>
          </div>

          {/* Right: Interactive Mockup Animation */}
          <div className="relative animate-slideUp hidden lg:block" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-linear-to-tr from-[#7F56FF] to-[#80FF56] rounded-[2.5rem] blur-3xl opacity-20"></div>
            <div className="relative bg-[#111214]/80 backdrop-blur-xl border border-[#383A40] p-6 rounded-[2.5rem] shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              
              {/* Fake Browser Chrome */}
              <div className="flex items-center gap-2 mb-6 border-b border-[#383A40] pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#80FF56]/80"></div>
                </div>
                <div className="mx-auto bg-[#1E1F22] px-4 py-1.5 rounded-full text-[10px] text-grey-muted font-mono flex items-center gap-2">
                  <Lock size={10} className="text-[#80FF56]" /> stuma.id/dashboard
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-32 h-4 bg-[#2B2D31] rounded-full"></div>
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#7F56FF] to-indigo-600"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1E1F22] p-4 rounded-2xl border border-[#383A40]">
                    <div className="w-8 h-8 rounded-lg bg-[#80FF56]/10 text-[#80FF56] flex items-center justify-center mb-3"><Activity size={16}/></div>
                    <div className="w-16 h-3 bg-[#383A40] rounded-full mb-2"></div>
                    <div className="text-2xl font-mono font-bold text-white">4,250.80</div>
                  </div>
                  <div className="bg-[#1E1F22] p-4 rounded-2xl border border-[#383A40]">
                    <div className="w-8 h-8 rounded-lg bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center mb-3"><Zap size={16}/></div>
                    <div className="w-16 h-3 bg-[#383A40] rounded-full mb-2"></div>
                    <div className="text-2xl font-mono font-bold text-white">0.001 gwei</div>
                  </div>
                </div>
                {/* Simulated live incoming transaction */}
                <div className="bg-linear-to-r from-[#80FF56]/10 to-transparent border border-[#80FF56]/20 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#80FF56]/20 flex items-center justify-center animate-pulse"><div className="w-3 h-3 bg-[#80FF56] rounded-full"></div></div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1">New TX: 0x3aF...9c2</p>
                      <p className="text-[10px] text-[#80FF56]">Confirmed (L2 Arbitrum)</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#80FF56]">+45.00 USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Strip */}
      <div className="border-y border-[#383A40] bg-[#111214]/50 backdrop-blur-md py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-70">
          <p className="text-sm font-bold text-grey-muted uppercase tracking-widest">Infrastruktur Web3 yang Digunakan</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <span className="font-title font-bold text-xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-[#8247E5] rounded-full"></div> Polygon</span>
            <span className="font-title font-bold text-xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-[#28A0F0] rounded-full"></div> Arbitrum</span>
            <span className="font-title font-bold text-xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-[#627EEA] rounded-full"></div> Ethereum</span>
            <span className="font-title font-bold text-xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-[#2775CA] rounded-full"></div> Chainlink</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Feature Section */}
      <section id="ekosistem" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-title font-bold mb-6 max-w-2xl leading-tight">Sistem arsitektur yang didesain untuk <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7F56FF] to-[#80FF56]">Efisiensi Ekstrim.</span></h2>
            <p className="text-xl text-grey-muted max-w-2xl">Bukan sekadar gateway pembayaran biasa. STUMA mengombinasikan teknologi Layer 2 dan Smart Contracts untuk memotong biaya pihak ketiga secara permanen.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            
            {/* Bento 1: Smart Contracts (Span 2) */}
            <div className="md:col-span-2 bg-[#111214] border border-[#383A40] rounded-4xl p-10 relative overflow-hidden group hover:border-[#7F56FF]/50 transition-colors">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7F56FF]/10 blur-[80px] rounded-full group-hover:bg-[#7F56FF]/20 transition-colors"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-[#7F56FF]/10 text-[#7F56FF] rounded-2xl flex items-center justify-center mb-6">
                  <Database size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Smart Contract Escrow</h3>
                  <p className="text-grey-muted leading-relaxed max-w-md">Dana ditahan dengan aman oleh protokol terdesentralisasi hingga barang diterima. Transparan, otomatis, tanpa intervensi pihak ketiga.</p>
                </div>
              </div>
            </div>

            {/* Bento 2: Gas Fee (Span 1) */}
            <div className="bg-[#111214] border border-[#383A40] rounded-4xl p-10 relative overflow-hidden group hover:border-[#80FF56]/50 transition-colors flex flex-col justify-center items-center text-center">
              <div className="absolute inset-0 bg-linear-to-b from-[#80FF56]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-6xl font-black font-mono text-[#80FF56] mb-2 tracking-tighter">95%</h4>
              <p className="text-white font-bold text-lg mb-2">Potongan Gas Fee</p>
              <p className="text-sm text-grey-muted">Dengan mekanisme Batch Withdrawal inovatif.</p>
            </div>

            {/* Bento 3: Oracle (Span 1) */}
            <div className="bg-[#111214] border border-[#383A40] rounded-4xl p-10 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Oracle</h3>
              <p className="text-grey-muted leading-relaxed">Konversi otomatis IDR ke USDT saat checkout dengan presisi tinggi dari Chainlink & CoinGecko.</p>
            </div>

            {/* Bento 4: Keamanan (Span 2) */}
            <div className="md:col-span-2 bg-[#1E1F22] border border-[#383A40] rounded-4xl p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Keamanan Tingkat Militer Web3</h3>
                <p className="text-grey-muted leading-relaxed mb-6">Arsitektur non-custodial memastikan Anda sepenuhnya menguasai dana Anda. Tidak ada pembekuan akun sepihak, tidak ada chargeback palsu.</p>
                <ul className="space-y-3">
                  {['Verifikasi kriptografi untuk setiap transaksi', 'Audit smart contract berkala', 'Proteksi re-entrancy attack'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                      <CheckCircle2 size={18} className="text-[#80FF56]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10 border-t border-[#383A40] bg-linear-to-b from-[#111214] to-[#0A0A0C]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block p-4 rounded-3xl bg-[#7F56FF]/10 mb-8">
            <Zap size={40} className="text-[#7F56FF]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-title font-extrabold mb-8">Siap Merevolusi <br/> Bisnis Anda?</h2>
          <p className="text-xl text-grey-muted mb-12 max-w-2xl mx-auto">Bergabunglah dengan ribuan merchant UMKM yang telah beralih ke masa depan e-commerce desentralisasi.</p>
          <button onClick={onNavigateToAuth} className="bg-white hover:bg-[#80FF56] text-[#0A0A0C] px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(128,255,86,0.4)] hover:-translate-y-2 flex items-center justify-center gap-3 mx-auto">
            Daftar Sekarang - Gratis <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0C] pt-20 pb-10 border-t border-[#383A40] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7F56FF] to-indigo-600 flex items-center justify-center font-bold text-white text-xl">
              S
            </div>
            <span className="font-title text-2xl font-bold tracking-tight text-white">STUMA</span>
          </div>
          <div className="flex gap-6 text-sm font-semibold text-grey-muted">
            <a href="#" className="hover:text-white transition-colors">Dokumentasi API</a>
            <a href="#" className="hover:text-white transition-colors">Smart Contracts</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
        <div className="text-center text-xs text-grey-muted/40 font-medium uppercase tracking-widest">
          © {new Date().getFullYear()} STUMA L2 Gateway Ecosystem. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
