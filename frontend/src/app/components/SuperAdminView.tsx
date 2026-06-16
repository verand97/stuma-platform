'use client';
import React, { useState } from 'react';
import { Shield, Users, Activity, Settings, BarChart3, Database } from 'lucide-react';
import { UserSession } from '../../utils/types';
import Sidebar, { SidebarItem } from './Sidebar';

interface Props { user: UserSession; onLogout: () => void; }

export default function SuperAdminView({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const navItems: SidebarItem[] = [
    { id: 'overview', label: 'Platform Overview', icon: <BarChart3 size={18} /> },
    { id: 'merchants', label: 'Manajemen UMKM', icon: <Users size={18} />, badge: 3 },
    { id: 'network', label: 'Status Jaringan L2', icon: <Activity size={18} /> },
    { id: 'smartcontracts', label: 'Smart Contracts', icon: <Database size={18} /> },
    { id: 'settings', label: 'Pengaturan Sistem', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-charcoal text-off-white font-sans overflow-hidden">
      <Sidebar 
        user={user} items={navItems} activeItem={activeTab} onItemClick={setActiveTab} 
        onLogout={onLogout} accentColor="cyan-accent" collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-title text-2xl font-bold text-off-white flex items-center gap-2">
                <Shield className="text-cyan-accent" /> Super Admin Control
              </h2>
              <p className="text-sm text-grey-muted">Pantau keseluruhan ekosistem STUMA dan metrik sistem.</p>
            </div>
            <div className="bg-charcoal-dark border border-border-color py-2 px-4 rounded-xl flex flex-col">
               <span className="text-[10px] text-grey-muted uppercase tracking-wider font-semibold">Status Chainstack RPC</span>
               <span className="text-xs font-bold text-lime-green flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-green animate-pulse"></span> Sehat (99.9% Uptime)</span>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Global Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl shadow-md border-t-2 border-t-cyan-accent">
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Total Nilai Transaksi</span>
                  <span className="text-2xl font-bold text-off-white font-mono block mt-2">14,250.50 USDT</span>
                  <p className="text-[10px] text-lime-green mt-1">↑ 12.5% dari bulan lalu</p>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl shadow-md border-t-2 border-t-cyan-accent">
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">UMKM Aktif</span>
                  <span className="text-2xl font-bold text-off-white font-title block mt-2">1,248</span>
                  <p className="text-[10px] text-lime-green mt-1">↑ 43 toko baru minggu ini</p>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl shadow-md border-t-2 border-t-cyan-accent">
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Total Gas Dihemat</span>
                  <span className="text-2xl font-bold text-off-white font-mono block mt-2">850.20 USDT</span>
                  <p className="text-[10px] text-grey-muted mt-1">Estimasi penghematan batching</p>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl shadow-md border-t-2 border-t-cyan-accent">
                  <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Pending Withdrawals</span>
                  <span className="text-2xl font-bold text-off-white font-mono block mt-2">45</span>
                  <p className="text-[10px] text-grey-muted mt-1">Menunggu eksekusi cron job</p>
                </div>
              </div>

              {/* Network Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg">
                  <h3 className="font-title font-bold text-base text-off-white mb-4">Volume Jaringan L2</h3>
                  <div className="flex flex-col gap-4">
                    <div className="bg-charcoal-dark p-4 rounded-xl border border-border-color">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-purple-400">Polygon (POL)</span>
                        <span className="text-xs text-grey-muted">65%</span>
                      </div>
                      <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full w-[65%]"></div>
                      </div>
                    </div>
                    <div className="bg-charcoal-dark p-4 rounded-xl border border-border-color">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-400">Arbitrum (ETH)</span>
                        <span className="text-xs text-grey-muted">35%</span>
                      </div>
                      <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full w-[35%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg">
                  <h3 className="font-title font-bold text-base text-off-white mb-4">Log Sistem Terbaru</h3>
                  <div className="space-y-3 font-mono text-[10px]">
                     <div className="flex gap-3 text-grey-muted"><span className="text-lime-green">[INFO]</span><span>Cron withdrawal batch sukses dieksekusi. tx: 0x8f...2a</span></div>
                     <div className="flex gap-3 text-grey-muted"><span className="text-cyan-accent">[SYNC]</span><span>Oracle CoinGecko harga USDT diperbarui: Rp 16,420</span></div>
                     <div className="flex gap-3 text-grey-muted"><span className="text-red-400">[WARN]</span><span>Anomali pembayaran terdeteksi pada toko ID: M-829</span></div>
                     <div className="flex gap-3 text-grey-muted"><span className="text-lime-green">[INFO]</span><span>Pendaftaran UMKM baru dikonfirmasi: M-1249</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <Shield size={48} className="text-border-color mb-4" />
              <h3 className="text-lg font-title font-bold">Menu {navItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="text-sm text-grey-muted">Modul kontrol dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
