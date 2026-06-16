'use client';
import React, { useState } from 'react';
import { Shield, Users, Activity, Settings, BarChart3, Database, Zap, Globe, ArrowUpRight } from 'lucide-react';
import { UserSession } from '../../utils/types';
import Sidebar, { SidebarItem } from './Sidebar';

interface Props { user: UserSession; onLogout: () => void; }

export default function SuperAdminView({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const navItems: SidebarItem[] = [
    { id: 'overview', label: 'Platform Overview', icon: <BarChart3 size={20} /> },
    { id: 'merchants', label: 'Manajemen UMKM', icon: <Users size={20} />, badge: 3 },
    { id: 'network', label: 'Status Jaringan L2', icon: <Activity size={20} /> },
    { id: 'smartcontracts', label: 'Smart Contracts', icon: <Database size={20} /> },
    { id: 'settings', label: 'Pengaturan Sistem', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#1E1F22] text-off-white font-sans overflow-hidden selection:bg-[#7F56FF] selection:text-white">
      <Sidebar 
        user={user} items={navItems} activeItem={activeTab} onItemClick={setActiveTab} 
        onLogout={onLogout} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#80FF56]/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#7F56FF]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-title text-3xl font-bold text-off-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center">
                  <Shield size={24} />
                </div>
                Super Admin Control
              </h2>
              <p className="text-sm text-grey-muted mt-2">Pantau metrik global ekosistem STUMA dan orkestrasi jaringan Web3.</p>
            </div>
            <div className="bg-[#2B2D31] border border-[#383A40] py-3 px-5 rounded-2xl flex flex-col shadow-lg">
               <span className="text-[10px] text-grey-muted uppercase tracking-widest font-bold mb-1">Status RPC Node</span>
               <span className="text-sm font-bold text-[#80FF56] flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#80FF56] animate-pulse shadow-[0_0_10px_#80FF56]"></span> 
                 Sehat (99.9% Uptime)
               </span>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Global Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slideUp">
                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#7F56FF]/20 rounded-bl-full flex items-start justify-end p-3 text-[#7F56FF]"><Globe size={20}/></div>
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-bold mb-3">Total Transaksi</span>
                  <span className="text-3xl font-extrabold text-off-white font-mono block tracking-tight">14,250.50</span>
                  <span className="text-sm text-[#7F56FF] font-bold font-mono">USDT</span>
                  <p className="text-[11px] text-[#80FF56] mt-4 flex items-center gap-1 font-bold"><ArrowUpRight size={14}/> 12.5% dari bulan lalu</p>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#7F56FF]/20 rounded-bl-full flex items-start justify-end p-3 text-[#7F56FF]"><Users size={20}/></div>
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-bold mb-3">Merchant Aktif</span>
                  <span className="text-3xl font-extrabold text-off-white font-title block tracking-tight">1,248</span>
                  <span className="text-sm text-grey-muted font-medium">Toko UMKM Terdaftar</span>
                  <p className="text-[11px] text-[#80FF56] mt-4 flex items-center gap-1 font-bold"><ArrowUpRight size={14}/> 43 toko baru minggu ini</p>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#80FF56]/20 rounded-bl-full flex items-start justify-end p-3 text-[#80FF56]"><Zap size={20}/></div>
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-bold mb-3">Total Gas Dihemat</span>
                  <span className="text-3xl font-extrabold text-[#80FF56] font-mono block tracking-tight">850.20</span>
                  <span className="text-sm text-[#80FF56] font-bold font-mono">USDT</span>
                  <p className="text-[11px] text-grey-muted mt-4 font-medium">Estimasi penghematan batching</p>
                </div>

                <div className="bg-linear-to-br from-[#7F56FF] to-purple-800 border border-[#7F56FF] p-6 rounded-3xl shadow-[0_0_20px_rgba(127,86,255,0.3)] text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-20"><Activity size={100}/></div>
                  <span className="text-xs text-white/80 block uppercase tracking-wider font-bold mb-3">Antrean Withdraw</span>
                  <span className="text-3xl font-extrabold font-mono block tracking-tight">45</span>
                  <span className="text-sm text-white/90 font-medium">Transaksi Pending</span>
                  <p className="text-[11px] text-white/70 mt-4 font-medium">Menunggu eksekusi cron job otomatis</p>
                </div>
              </div>

              {/* Network Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-title font-bold text-xl text-off-white">Volume Jaringan Layer 2</h3>
                    <span className="text-xs bg-[#111214] py-1 px-3 rounded-full text-grey-muted font-semibold border border-[#383A40]">7 Hari Terakhir</span>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div className="bg-[#111214] p-5 rounded-2xl border border-[#383A40] hover:border-[#7F56FF]/50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#7F56FF]/10 flex items-center justify-center text-[#7F56FF] font-bold">P</div>
                           <span className="font-bold text-off-white">Polygon (POL)</span>
                        </div>
                        <span className="text-lg font-bold font-mono text-[#7F56FF]">65%</span>
                      </div>
                      <div className="w-full bg-[#2B2D31] h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-linear-to-r from-purple-500 to-[#7F56FF] h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(127,86,255,0.5)]"></div>
                      </div>
                    </div>

                    <div className="bg-[#111214] p-5 rounded-2xl border border-[#383A40] hover:border-[#80FF56]/50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#80FF56]/10 flex items-center justify-center text-[#80FF56] font-bold">A</div>
                           <span className="font-bold text-off-white">Arbitrum (ETH)</span>
                        </div>
                        <span className="text-lg font-bold font-mono text-[#80FF56]">35%</span>
                      </div>
                      <div className="w-full bg-[#2B2D31] h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-linear-to-r from-green-500 to-[#80FF56] h-full w-[35%] rounded-full shadow-[0_0_10px_rgba(128,255,86,0.5)]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-title font-bold text-xl text-off-white">Log Sistem (Real-time)</h3>
                    <Activity size={20} className="text-[#80FF56] animate-pulse" />
                  </div>
                  
                  <div className="bg-[#111214] rounded-2xl border border-[#383A40] p-5 grow font-mono text-xs overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-8 bg-linear-to-b from-[#111214] to-transparent z-10"></div>
                    <div className="space-y-4 pt-2 relative z-0">
                       <div className="flex gap-3 text-grey-muted group hover:bg-[#2B2D31] p-1 -mx-1 rounded transition-colors"><span className="text-[#80FF56] font-bold shrink-0">[INFO]</span><span className="truncate group-hover:text-off-white transition-colors">Cron withdrawal batch sukses dieksekusi. tx: 0x8f...2a</span></div>
                       <div className="flex gap-3 text-grey-muted group hover:bg-[#2B2D31] p-1 -mx-1 rounded transition-colors"><span className="text-[#7F56FF] font-bold shrink-0">[SYNC]</span><span className="truncate group-hover:text-off-white transition-colors">Oracle CoinGecko harga USDT diperbarui: Rp 16,420</span></div>
                       <div className="flex gap-3 text-grey-muted group hover:bg-[#2B2D31] p-1 -mx-1 rounded transition-colors"><span className="text-red-400 font-bold shrink-0">[WARN]</span><span className="truncate group-hover:text-off-white transition-colors">Anomali pembayaran terdeteksi pada toko ID: M-829</span></div>
                       <div className="flex gap-3 text-grey-muted group hover:bg-[#2B2D31] p-1 -mx-1 rounded transition-colors"><span className="text-[#80FF56] font-bold shrink-0">[INFO]</span><span className="truncate group-hover:text-off-white transition-colors">Pendaftaran UMKM baru dikonfirmasi: M-1249</span></div>
                       <div className="flex gap-3 text-grey-muted group hover:bg-[#2B2D31] p-1 -mx-1 rounded transition-colors"><span className="text-[#7F56FF] font-bold shrink-0">[SYNC]</span><span className="truncate group-hover:text-off-white transition-colors">Indexing block #18429910 on Polygon POS...</span></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-[#111214] to-transparent z-10"></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center py-32 opacity-60">
              <Shield size={64} className="text-[#383A40] mb-6" />
              <h3 className="text-2xl font-title font-bold text-off-white mb-2">Modul {navItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="text-grey-muted">Halaman kontrol administrator sedang dalam tahap pembaruan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
