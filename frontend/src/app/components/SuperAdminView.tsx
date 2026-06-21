'use client';
import React, { useState } from 'react';
import { Shield, Users, Activity, Settings, BarChart3, Database, Zap, Globe, ArrowUpRight, X, ShieldAlert } from 'lucide-react';
import { UserSession } from '../../utils/types';
import Sidebar, { SidebarItem } from './Sidebar';

interface Merchant {
  id: string; name: string; wallet: string; vol: string; status: 'active' | 'flagged' | 'pending'; joined: string;
  email: string; products: number; orders: number; city: string;
}

const INITIAL_MERCHANTS: Merchant[] = [
  { id: 'M-1001', name: 'Batik Nusantara Solo', wallet: '0x37c8D8Db16a9A1f87B64d6Bc1F4a1c5d809110B6', vol: '2,450.80', status: 'active', joined: '12 Jan 2026', email: 'batik@nusantara.id', products: 24, orders: 186, city: 'Solo' },
  { id: 'M-1002', name: 'Kopi Gayo Aceh Premium', wallet: '0x8a2f9C3b1D7e5A4F6B8c0E2d3A1f9C7b5D913D91', vol: '1,820.50', status: 'active', joined: '28 Feb 2026', email: 'info@kopigayo.co.id', products: 8, orders: 142, city: 'Banda Aceh' },
  { id: 'M-1003', name: 'Kerajinan Rotan Lombok', wallet: '0x5bc1E4a2D3f6B8c9A0d1F7e3C5b2A4d6E8f07E42', vol: '980.25', status: 'active', joined: '15 Mar 2026', email: 'rotan@lombok.com', products: 15, orders: 67, city: 'Lombok' },
  { id: 'M-829', name: 'Sepatu Cibaduyut Store', wallet: '0x9ef3B1c2D4a5E6f7A8b9C0d1E2f3A4b5C6d7A108', vol: '3,210.00', status: 'flagged', joined: '03 Apr 2026', email: 'store@cibaduyut.id', products: 12, orders: 203, city: 'Bandung' },
  { id: 'M-1249', name: 'Madu Sumbawa Organik', wallet: '0x2d4aA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d66F55', vol: '0.00', status: 'pending', joined: '21 Jun 2026', email: 'madu@sumbawa.org', products: 3, orders: 0, city: 'Sumbawa' },
];

interface Props { user: UserSession; onLogout: () => void; }

export default function SuperAdminView({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

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

          {/* Tab: Manajemen UMKM */}
          {activeTab === 'merchants' && (
            <div className="animate-fadeIn">
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl mb-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-title font-bold text-xl text-off-white">Daftar Merchant UMKM</h3>
                    <p className="text-sm text-grey-muted mt-1">Kelola dan pantau status semua toko terdaftar di ekosistem STUMA.</p>
                  </div>
                  <span className="text-xs bg-[#111214] border border-[#383A40] py-1.5 px-4 rounded-full text-grey-muted font-semibold">Total: 1,248 Merchant</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#383A40] text-grey-muted uppercase tracking-wider font-semibold text-xs">
                        <th className="pb-4 pr-4">ID Toko</th>
                        <th className="pb-4 px-4">Nama Merchant</th>
                        <th className="pb-4 px-4">Wallet Address</th>
                        <th className="pb-4 px-4">Volume (USDT)</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 pl-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#383A40]/50">
                      {merchants.map(m => (
                        <tr key={m.id} className="hover:bg-[#111214] transition-colors group">
                          <td className="py-4 pr-4 font-mono font-bold text-off-white group-hover:text-[#7F56FF] transition-colors">{m.id}</td>
                          <td className="py-4 px-4 font-medium text-off-white">{m.name}</td>
                          <td className="py-4 px-4 font-mono text-xs text-grey-muted">{m.wallet.substring(0,6)}...{m.wallet.substring(m.wallet.length-4)}</td>
                          <td className="py-4 px-4 font-mono font-bold text-[#80FF56]">{m.vol}</td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-extrabold uppercase py-1 px-3 rounded-full border ${m.status === 'active' ? 'bg-[#80FF56]/10 text-[#80FF56] border-[#80FF56]/20' : m.status === 'flagged' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                              {m.status === 'active' ? 'Aktif' : m.status === 'flagged' ? 'Ditandai' : 'Menunggu'}
                            </span>
                          </td>
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedMerchant(m)} className="text-xs bg-[#7F56FF]/20 text-[#7F56FF] hover:bg-[#7F56FF] hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Detail</button>
                              {m.status === 'pending' && <button onClick={() => { setMerchants(prev => prev.map(x => x.id === m.id ? {...x, status: 'active'} : x)); alert(`Merchant ${m.name} berhasil di-approve!`); }} className="text-xs bg-[#80FF56]/20 text-[#80FF56] hover:bg-[#80FF56] hover:text-[#111214] px-3 py-1.5 rounded-lg font-bold transition-colors">Approve</button>}
                              {m.status === 'flagged' && <button onClick={() => setSelectedMerchant(m)} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Investigasi</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Merchant Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg">
                  <span className="text-xs text-grey-muted uppercase tracking-wider font-bold block mb-2">Menunggu Verifikasi</span>
                  <span className="text-3xl font-extrabold text-yellow-500 font-mono">{merchants.filter(m => m.status === 'pending').length}</span>
                  <p className="text-[11px] text-grey-muted mt-3">Merchant baru menunggu approval KYC</p>
                </div>
                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg">
                  <span className="text-xs text-grey-muted uppercase tracking-wider font-bold block mb-2">Ditandai (Flagged)</span>
                  <span className="text-3xl font-extrabold text-red-400 font-mono">{merchants.filter(m => m.status === 'flagged').length}</span>
                  <p className="text-[11px] text-grey-muted mt-3">Merchant dengan anomali transaksi</p>
                </div>
                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg">
                  <span className="text-xs text-grey-muted uppercase tracking-wider font-bold block mb-2">Aktif</span>
                  <span className="text-3xl font-extrabold text-[#80FF56] font-mono">{merchants.filter(m => m.status === 'active').length}</span>
                  <p className="text-[11px] text-grey-muted mt-3">Merchant dengan status aktif</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Status Jaringan L2 */}
          {activeTab === 'network' && (
            <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Polygon */}
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center font-bold text-xl">P</div>
                  <div>
                    <h3 className="font-title font-bold text-xl text-off-white">Polygon (POL)</h3>
                    <p className="text-xs text-grey-muted mt-0.5">Layer 2 ZK-Rollup · Mainnet</p>
                  </div>
                  <span className="ml-auto flex items-center gap-2 text-sm font-bold text-[#80FF56]"><span className="w-2.5 h-2.5 rounded-full bg-[#80FF56] animate-pulse shadow-[0_0_8px_#80FF56]"></span>Online</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'RPC Endpoint', value: 'polygon-rpc.stuma.id', color: 'text-[#7F56FF]' },
                    { label: 'Block Terakhir', value: '#18,429,910', color: 'text-off-white' },
                    { label: 'Gas Price (Avg)', value: '32 Gwei', color: 'text-[#80FF56]' },
                    { label: 'Transaksi STUMA', value: '9,263 txns', color: 'text-off-white' },
                    { label: 'Latency', value: '~120ms', color: 'text-[#80FF56]' },
                    { label: 'Uptime (30d)', value: '99.97%', color: 'text-[#80FF56]' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center bg-[#111214] border border-[#383A40] p-4 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                      <span className="text-sm text-grey-muted font-medium">{r.label}</span>
                      <span className={`font-mono font-bold text-sm ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Arbitrum */}
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#80FF56]/10 text-[#80FF56] flex items-center justify-center font-bold text-xl">A</div>
                  <div>
                    <h3 className="font-title font-bold text-xl text-off-white">Arbitrum (ETH)</h3>
                    <p className="text-xs text-grey-muted mt-0.5">Layer 2 Optimistic Rollup · Mainnet</p>
                  </div>
                  <span className="ml-auto flex items-center gap-2 text-sm font-bold text-[#80FF56]"><span className="w-2.5 h-2.5 rounded-full bg-[#80FF56] animate-pulse shadow-[0_0_8px_#80FF56]"></span>Online</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'RPC Endpoint', value: 'arbitrum-rpc.stuma.id', color: 'text-[#80FF56]' },
                    { label: 'Block Terakhir', value: '#231,842,100', color: 'text-off-white' },
                    { label: 'Gas Price (Avg)', value: '0.1 Gwei', color: 'text-[#80FF56]' },
                    { label: 'Transaksi STUMA', value: '4,987 txns', color: 'text-off-white' },
                    { label: 'Latency', value: '~85ms', color: 'text-[#80FF56]' },
                    { label: 'Uptime (30d)', value: '99.99%', color: 'text-[#80FF56]' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center bg-[#111214] border border-[#383A40] p-4 rounded-2xl hover:border-[#80FF56]/50 transition-colors">
                      <span className="text-sm text-grey-muted font-medium">{r.label}</span>
                      <span className={`font-mono font-bold text-sm ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Oracle Status */}
              <div className="lg:col-span-2 bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <h3 className="font-title font-bold text-xl text-off-white mb-6">Status Oracle & Price Feed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#111214] border border-[#383A40] p-5 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-2">USDT/IDR Rate</span>
                    <span className="text-2xl font-extrabold text-off-white font-mono">Rp 16,420</span>
                    <p className="text-[11px] text-[#80FF56] mt-2 font-bold">Sumber: CoinGecko API</p>
                  </div>
                  <div className="bg-[#111214] border border-[#383A40] p-5 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-2">Update Terakhir</span>
                    <span className="text-2xl font-extrabold text-off-white font-mono">2m ago</span>
                    <p className="text-[11px] text-grey-muted mt-2 font-medium">Interval refresh: 5 menit</p>
                  </div>
                  <div className="bg-[#111214] border border-[#383A40] p-5 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-2">Deviasi Harga 24h</span>
                    <span className="text-2xl font-extrabold text-[#80FF56] font-mono">±0.12%</span>
                    <p className="text-[11px] text-grey-muted mt-2 font-medium">Dalam batas toleransi normal</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Smart Contracts */}
          {activeTab === 'smartcontracts' && (
            <div className="animate-fadeIn space-y-8">
              {[
                { name: 'StumaPaymentCustody', network: 'Polygon', addr: '0x7F56FF...a3b8c2', status: 'Deployed', balance: '4,280.50 USDT', txCount: '6,142', desc: 'Kontrak utama untuk menerima & menahan dana USDT pelanggan sebelum batch withdrawal oleh merchant.' },
                { name: 'StumaPaymentCustody', network: 'Arbitrum', addr: '0x80FF56...d9e1f4', status: 'Deployed', balance: '1,920.30 USDT', txCount: '3,121', desc: 'Mirror deployment pada jaringan Arbitrum untuk opsi biaya gas lebih rendah.' },
                { name: 'StumaBatchWithdraw', network: 'Polygon', addr: '0x26C6DA...5f7a09', status: 'Deployed', balance: '—', txCount: '892', desc: 'Mengelola proses batch withdrawal agar merchant bisa menarik dana secara kolektif, menghemat ~90% biaya gas.' },
              ].map((c, i) => (
                <div key={i} className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl hover:border-[#7F56FF]/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center"><Database size={24}/></div>
                      <div>
                        <h3 className="font-title font-bold text-lg text-off-white">{c.name}</h3>
                        <span className="text-xs text-grey-muted">{c.network} Mainnet</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase py-1.5 px-4 rounded-full bg-[#80FF56]/10 text-[#80FF56] border border-[#80FF56]/20">{c.status}</span>
                  </div>
                  <p className="text-sm text-grey-muted mb-6 leading-relaxed">{c.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#111214] border border-[#383A40] p-4 rounded-2xl">
                      <span className="text-[10px] text-grey-muted uppercase tracking-wider font-bold block mb-1">Contract Address</span>
                      <span className="font-mono text-sm text-[#7F56FF] font-bold">{c.addr}</span>
                    </div>
                    <div className="bg-[#111214] border border-[#383A40] p-4 rounded-2xl">
                      <span className="text-[10px] text-grey-muted uppercase tracking-wider font-bold block mb-1">Balance</span>
                      <span className="font-mono text-sm text-[#80FF56] font-bold">{c.balance}</span>
                    </div>
                    <div className="bg-[#111214] border border-[#383A40] p-4 rounded-2xl">
                      <span className="text-[10px] text-grey-muted uppercase tracking-wider font-bold block mb-1">Total Transaksi</span>
                      <span className="font-mono text-sm text-off-white font-bold">{c.txCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Pengaturan Sistem */}
          {activeTab === 'settings' && (
            <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <h3 className="font-title font-bold text-xl text-off-white mb-6">Konfigurasi Platform</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Auto-Approve Merchant Baru', desc: 'Aktifkan untuk melewati proses verifikasi manual', on: false },
                    { label: 'Notifikasi Anomali Real-time', desc: 'Kirim alert ke Telegram saat anomali terdeteksi', on: true },
                    { label: 'Cron Job Batch Withdrawal', desc: 'Eksekusi otomatis setiap 6 jam', on: true },
                    { label: 'Mode Maintenance', desc: 'Nonaktifkan transaksi pelanggan sementara', on: false },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#111214] border border-[#383A40] rounded-2xl p-5 flex items-center justify-between hover:border-[#7F56FF]/40 transition-colors">
                      <div>
                        <span className="text-sm font-bold text-off-white block">{s.label}</span>
                        <span className="text-[11px] text-grey-muted mt-0.5 block">{s.desc}</span>
                      </div>
                      <div className="relative shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked={s.on} />
                        <div className="w-11 h-6 bg-[#383A40] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#80FF56] cursor-pointer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                  <h3 className="font-title font-bold text-xl text-off-white mb-6">Parameter Oracle</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-grey-muted font-semibold mb-2 block">Interval Refresh Harga (menit)</label>
                      <input type="number" defaultValue={5} className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted font-semibold mb-2 block">Toleransi Deviasi Maksimum (%)</label>
                      <input type="number" defaultValue={2.0} step={0.1} className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted font-semibold mb-2 block">Sumber Data Harga</label>
                      <select className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors cursor-pointer">
                        <option>CoinGecko API (Default)</option>
                        <option>Chainlink Oracle</option>
                        <option>Binance Price Feed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                  <h3 className="font-title font-bold text-xl text-off-white mb-4">Gas Fee Threshold</h3>
                  <p className="text-sm text-grey-muted mb-6">Batas maksimum gas fee per transaksi sebelum sistem menunda batch.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-grey-muted font-semibold mb-2 block">Polygon (Gwei)</label>
                      <input type="number" defaultValue={100} className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted font-semibold mb-2 block">Arbitrum (Gwei)</label>
                      <input type="number" defaultValue={1} className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors font-mono" />
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(127,86,255,0.3)] transition-all">Simpan Pengaturan</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Merchant Detail Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111214]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2B2D31] border border-[#383A40] max-w-lg w-full rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slideUp">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedMerchant.status === 'active' ? 'bg-[#80FF56]' : selectedMerchant.status === 'flagged' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <button onClick={() => setSelectedMerchant(null)} className="absolute top-5 right-5 p-2 text-grey-muted hover:text-off-white hover:bg-[#383A40] rounded-xl transition-colors z-20"><X size={20}/></button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl ${selectedMerchant.status === 'active' ? 'bg-[#80FF56]/10 text-[#80FF56]' : selectedMerchant.status === 'flagged' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'}`}>{selectedMerchant.name.charAt(0)}</div>
              <div>
                <h3 className="font-title font-bold text-xl text-off-white">{selectedMerchant.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-grey-muted">{selectedMerchant.id}</span>
                  <span className={`text-[10px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${selectedMerchant.status === 'active' ? 'bg-[#80FF56]/10 text-[#80FF56] border-[#80FF56]/20' : selectedMerchant.status === 'flagged' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {selectedMerchant.status === 'active' ? 'Aktif' : selectedMerchant.status === 'flagged' ? 'Ditandai' : 'Menunggu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Email', value: selectedMerchant.email },
                { label: 'Kota', value: selectedMerchant.city },
                { label: 'Bergabung', value: selectedMerchant.joined },
                { label: 'Jumlah Produk', value: String(selectedMerchant.products) },
                { label: 'Total Pesanan', value: String(selectedMerchant.orders) },
                { label: 'Volume USDT', value: selectedMerchant.vol + ' USDT' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center bg-[#111214] border border-[#383A40] p-3.5 rounded-xl">
                  <span className="text-sm text-grey-muted">{r.label}</span>
                  <span className="text-sm font-bold text-off-white">{r.value}</span>
                </div>
              ))}
              <div className="bg-[#111214] border border-[#383A40] p-3.5 rounded-xl">
                <span className="text-xs text-grey-muted block mb-1.5">Wallet Address</span>
                <span className="font-mono text-xs text-[#7F56FF] font-bold break-all">{selectedMerchant.wallet}</span>
              </div>
            </div>

            {selectedMerchant.status === 'flagged' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-red-400 block">Anomali Terdeteksi</span>
                  <p className="text-xs text-grey-muted mt-1">Terdapat ketidaksesuaian pembayaran pada beberapa transaksi merchant ini.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {selectedMerchant.status === 'pending' && (
                <button onClick={() => { setMerchants(prev => prev.map(x => x.id === selectedMerchant.id ? {...x, status: 'active'} : x)); setSelectedMerchant(prev => prev ? {...prev, status: 'active'} : null); alert(`Merchant ${selectedMerchant.name} berhasil di-approve!`); }} className="flex-1 bg-[#80FF56] hover:bg-[#6cde46] text-[#111214] py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(128,255,86,0.2)]">
                  Approve Merchant
                </button>
              )}
              {selectedMerchant.status === 'flagged' && (
                <>
                  <button onClick={() => { setMerchants(prev => prev.map(x => x.id === selectedMerchant.id ? {...x, status: 'active'} : x)); setSelectedMerchant(prev => prev ? {...prev, status: 'active'} : null); alert('Merchant dinyatakan aman dan status dikembalikan ke Aktif.'); }} className="flex-1 bg-[#80FF56] hover:bg-[#6cde46] text-[#111214] py-3 rounded-xl text-sm font-bold transition-all">Nyatakan Aman</button>
                  <button onClick={() => { setMerchants(prev => prev.filter(x => x.id !== selectedMerchant.id)); setSelectedMerchant(null); alert('Merchant di-suspend dari platform.'); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-bold transition-all">Suspend</button>
                </>
              )}
              <button onClick={() => setSelectedMerchant(null)} className="flex-1 bg-[#383A40] hover:bg-[#4a4c52] text-off-white py-3 rounded-xl text-sm font-bold transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
