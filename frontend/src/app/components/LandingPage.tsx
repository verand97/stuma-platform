'use client';
import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Globe, Wallet } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#1E1F22] text-off-white font-sans selection:bg-[#7F56FF] selection:text-white overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#1E1F22]/80 backdrop-blur-md border-b border-[#383A40]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7F56FF] to-purple-800 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(127,86,255,0.4)]">
              S
            </div>
            <span className="font-title text-2xl font-bold tracking-tight">STUMA</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-grey-muted">
            <a href="#fitur" className="hover:text-off-white transition-colors">Fitur Utama</a>
            <a href="#solusi" className="hover:text-off-white transition-colors">Solusi UMKM</a>
            <a href="#teknologi" className="hover:text-off-white transition-colors">Teknologi</a>
          </div>
          <button 
            onClick={onNavigateToAuth}
            className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(127,86,255,0.3)] hover:shadow-[0_0_30px_rgba(127,86,255,0.5)] flex items-center gap-2"
          >
            Mulai Sekarang <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7F56FF] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#80FF56] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#80FF56]/10 border border-[#80FF56]/20 text-[#80FF56] text-xs font-bold uppercase tracking-wider mb-8 animate-slideUp">
            <Globe size={14} /> Resolusi Pembayaran UMKM Masa Depan
          </div>
          
          <h1 className="text-5xl md:text-7xl font-title font-extrabold tracking-tight mb-8 leading-tight animate-slideUp" style={{ animationDelay: '100ms' }}>
            Stablecoin Trade for <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7F56FF] to-[#80FF56]">
              UMKM Advancement
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-grey-muted max-w-3xl mx-auto mb-12 animate-slideUp" style={{ animationDelay: '200ms' }}>
            Platform e-commerce revolusioner yang memfasilitasi transaksi menggunakan stablecoin USDT di jaringan Layer 2. Tekan biaya operasional, maksimalkan keuntungan.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: '300ms' }}>
            <button onClick={onNavigateToAuth} className="w-full sm:w-auto bg-[#7F56FF] hover:bg-[#6c42f0] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(127,86,255,0.4)] flex items-center justify-center gap-2">
              Masuk / Daftar <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-[#383A40] hover:border-[#80FF56] hover:text-[#80FF56] text-off-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              <Wallet size={20} /> Pelajari Lanjut
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 bg-[#111214] border-t border-[#383A40]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-4">Mengapa Memilih STUMA?</h2>
            <p className="text-grey-muted max-w-2xl mx-auto">Sistem yang dirancang khusus untuk memecahkan masalah tingginya biaya transaksi pada e-commerce konvensional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1E1F22] border border-[#383A40] p-8 rounded-3xl hover:border-[#80FF56]/50 transition-colors group">
              <div className="w-14 h-14 bg-[#80FF56]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} className="text-[#80FF56]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Keamanan Blockchain</h3>
              <p className="text-grey-muted leading-relaxed">
                Transaksi Anda diverifikasi dan diamankan oleh smart contract desentralisasi. Bebas manipulasi dan transparan.
              </p>
            </div>

            <div className="bg-[#1E1F22] border border-[#383A40] p-8 rounded-3xl hover:border-[#7F56FF]/50 transition-colors group">
              <div className="w-14 h-14 bg-[#7F56FF]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} className="text-[#7F56FF]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Biaya Transaksi Rendah</h3>
              <p className="text-grey-muted leading-relaxed">
                Dengan jaringan Layer 2 (Polygon & Arbitrum) dan sistem Batching, hemat biaya gas hingga 90%.
              </p>
            </div>

            <div className="bg-[#1E1F22] border border-[#383A40] p-8 rounded-3xl hover:border-[#80FF56]/50 transition-colors group">
              <div className="w-14 h-14 bg-linear-to-br from-[#7F56FF]/20 to-[#80FF56]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} className="text-off-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Konversi Real-Time</h3>
              <p className="text-grey-muted leading-relaxed">
                Integrasi Oracle memastikan konversi harga Rupiah (IDR) ke USDT selalu akurat secara real-time saat pelanggan checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1F22] py-12 border-t border-[#383A40] text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-linear-to-tr from-[#7F56FF] to-purple-800 flex items-center justify-center font-bold text-white text-xl mb-6">
          S
        </div>
        <p className="text-grey-muted font-medium mb-2">STUMA Platform</p>
        <p className="text-sm text-grey-muted/60">Membangun ekosistem UMKM yang mandiri dan berdaya saing global.</p>
        <div className="mt-8 text-xs text-grey-muted/40">
          © 2026 STUMA. Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
