'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, History, ArrowUpRight, CheckCircle, Plus, X, ShieldAlert, Package, LayoutDashboard } from 'lucide-react';
import { UserSession } from '../../utils/types';
import { getDashboardData, requestWithdrawal, resolveAnomaly, checkBackendOnline, DashboardData, Order, AnomalyLog, Withdrawal } from '../../utils/api';
import Sidebar, { SidebarItem } from './Sidebar';

interface Props { user: UserSession; onLogout: () => void; }

export default function AdminView({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendOnline, setBackendOnline] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Local state for mock
  const [localOrders, setLocalOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') { const s = localStorage.getItem('stuma_orders'); return s ? JSON.parse(s) : []; } return [];
  });
  const [localAnomalies, setLocalAnomalies] = useState<AnomalyLog[]>(() => {
    if (typeof window !== 'undefined') { const s = localStorage.getItem('stuma_anomalies'); return s ? JSON.parse(s) : []; } return [];
  });
  const [localWithdrawals, setLocalWithdrawals] = useState<Withdrawal[]>(() => {
    if (typeof window !== 'undefined') { const s = localStorage.getItem('stuma_withdrawals'); return s ? JSON.parse(s) : []; } return [];
  });

  const refreshData = useCallback(async () => {
    setBackendOnline(await checkBackendOnline());
    setDashboardData(await getDashboardData(localOrders, localAnomalies, localWithdrawals));
  }, [localOrders, localAnomalies, localWithdrawals]);

  useEffect(() => {
    const t = setTimeout(() => { refreshData(); }, 0);
    return () => clearTimeout(t);
  }, [refreshData]);

  // Sync state updates with localStorage for offline mock
  useEffect(() => { if (localOrders.length > 0) localStorage.setItem('stuma_orders', JSON.stringify(localOrders)); }, [localOrders]);
  useEffect(() => { if (localAnomalies.length > 0) localStorage.setItem('stuma_anomalies', JSON.stringify(localAnomalies)); }, [localAnomalies]);
  useEffect(() => { if (localWithdrawals.length > 0) localStorage.setItem('stuma_withdrawals', JSON.stringify(localWithdrawals)); }, [localWithdrawals]);

  const handleWithdraw = async () => {
    try {
      if (backendOnline) {
        const res = await requestWithdrawal(user.walletAddress);
        alert(res.message); refreshData();
      } else {
        const pendingPaid = localOrders.filter(o => o.status === 'paid' && o.payment_method === 'custody');
        if (pendingPaid.length === 0) return alert('Tidak ada dana USDT yang tersedia untuk ditarik');
        const totalAmount = pendingPaid.reduce((sum, o) => sum + o.total_price_usdt, 0);
        const gasSaved = (pendingPaid.length - 1) * 0.01;
        const newW: Withdrawal = {
          id: Date.now(), merchant_address: user.walletAddress, amount_usdt: totalAmount, gas_saved_usdt: gasSaved > 0 ? gasSaved : 0,
          status: 'completed', transaction_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          created_at: new Date().toISOString()
        };
        setLocalWithdrawals(prev => [newW, ...prev]);
        setLocalOrders(prev => prev.map(o => o.status === 'paid' && o.payment_method === 'custody' ? { ...o, status: 'withdrawn' } : o));
        alert('Mock Withdrawal Sukses: ' + totalAmount.toFixed(2) + ' USDT masuk ke dompet!');
        setTimeout(refreshData, 500);
      }
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal melakukan penarikan'); }
  };

  const handleResolveAnomaly = async (orderId: string, action: 'approve' | 'refund') => {
    try {
      if (backendOnline) {
        const res = await resolveAnomaly(orderId, action); alert(res.message); refreshData();
      } else {
        setLocalAnomalies(prev => prev.filter(a => a.order_id !== orderId));
        setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: action === 'approve' ? 'paid' : 'refunded' } : o));
        alert(`Status anomali diselesaikan dengan tindakan: ${action === 'approve' ? 'APPROVE' : 'REFUND'}`);
        setTimeout(refreshData, 500);
      }
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal menyelesaikan anomali'); }
  };

  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dasbor Merchant', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Katalog Produk', icon: <Package size={20} /> },
    { id: 'orders', label: 'Pesanan Masuk', icon: <History size={20} />, badge: dashboardData?.status_counts.pending },
    { id: 'anomalies', label: 'Anomali Pembayaran', icon: <ShieldAlert size={20} />, badge: dashboardData?.recent_anomalies.length },
    { id: 'withdrawals', label: 'Dompet USDT', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#1E1F22] text-off-white font-sans overflow-hidden selection:bg-[#7F56FF] selection:text-white">
      <Sidebar 
        user={user} items={navItems} activeItem={activeTab} onItemClick={setActiveTab} 
        onLogout={onLogout} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7F56FF]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-title text-3xl font-bold text-off-white">Dasbor Penjualan</h2>
              <p className="text-sm text-grey-muted mt-1">Pantau performa toko, kelola pesanan USDT, dan tarik saldo.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-[#2B2D31] border border-[#383A40] px-4 py-2 rounded-full text-xs">
                <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#80FF56] animate-pulse shadow-[0_0_8px_#80FF56]' : 'bg-red-500'}`}></div>
                <span className="text-grey-muted">Sistem:</span>
                <span className={backendOnline ? 'text-[#80FF56] font-bold' : 'text-red-500 font-bold'}>{backendOnline ? 'Online' : 'Offline Mode'}</span>
              </div>
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(127,86,255,0.3)]">
                <Plus size={16} /><span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {/* Add Product Form */}
          {showAddProduct && (
            <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-2xl relative animate-slideUp mb-10">
              <button onClick={() => setShowAddProduct(false)} className="absolute top-6 right-6 p-2 text-grey-muted hover:text-off-white hover:bg-[#383A40] rounded-xl transition-colors"><X size={20} /></button>
              <h3 className="font-title font-bold text-xl text-off-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center">
                  <Package size={20} />
                </div>
                Tambah Produk Baru ke Katalog
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="text-xs text-grey-muted block mb-2 font-semibold">Nama Produk</label><input type="text" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] placeholder:text-[#383A40]" placeholder="Contoh: Kopi Gayo" /></div>
                <div><label className="text-xs text-grey-muted block mb-2 font-semibold">Harga (IDR)</label><input type="number" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] placeholder:text-[#383A40]" placeholder="Rp" /></div>
                <div><label className="text-xs text-grey-muted block mb-2 font-semibold">Stok Awal</label><input type="number" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] placeholder:text-[#383A40]" placeholder="0" /></div>
                <div className="md:col-span-3 flex justify-end mt-2"><button onClick={() => setShowAddProduct(false)} className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3 px-8 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(127,86,255,0.3)] transition-all">Simpan ke Database</button></div>
              </div>
            </div>
          )}

          {/* Anomalies Alert */}
          {dashboardData && dashboardData.recent_anomalies.length > 0 && activeTab === 'dashboard' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 shadow-xl mb-10 animate-slideUp">
              <div className="flex items-center gap-3 text-red-400 mb-6"><ShieldAlert size={24} className="animate-pulse" /><h3 className="font-title font-bold text-lg">Peringatan: Anomali Transaksi Ditemukan</h3></div>
              <div className="flex flex-col gap-4">
                {dashboardData.recent_anomalies.map((log: AnomalyLog) => (
                  <div key={log.id} className="bg-[#111214] border border-red-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-red-500/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2"><span className="text-sm font-bold font-mono text-off-white">{log.order_id}</span><span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 py-1 px-2.5 rounded-full font-bold uppercase tracking-wider">Investigasi Diperlukan</span></div>
                      <p className="text-sm text-grey-muted">{log.notes}</p>
                      <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-medium bg-[#1E1F22] py-2 px-4 rounded-lg">
                        <span className="text-grey-muted">Seharusnya: <strong className="text-off-white font-mono">{Number(log.expected_amount_usdt).toFixed(2)} USDT</strong></span>
                        <div className="w-px h-4 bg-[#383A40]"></div>
                        <span className="text-grey-muted">Diterima: <strong className="text-red-400 font-mono">{Number(log.actual_amount_usdt).toFixed(2)} USDT</strong></span>
                      </div>
                    </div>
                    {log.status === 'flagged' && (
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => handleResolveAnomaly(log.order_id, 'approve')} className="bg-[#80FF56] hover:bg-[#6cde46] text-[#111214] py-2.5 px-5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(128,255,86,0.2)]">Sahkan Pembayaran</button>
                        <button onClick={() => handleResolveAnomaly(log.order_id, 'refund')} className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 py-2.5 px-5 rounded-xl text-sm font-bold transition-colors">Batalkan Pesanan</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && dashboardData && (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slideUp">
                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#7F56FF]/10 rounded-full blur-xl group-hover:bg-[#7F56FF]/20 transition-all"></div>
                  <div>
                    <span className="text-xs text-grey-muted uppercase tracking-wider font-semibold mb-2 block">Total Pendapatan (IDR)</span>
                    <span className="text-3xl font-extrabold text-off-white font-title tracking-tight">Rp {dashboardData.metrics.total_sales_idr.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#383A40]/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-grey-muted">Nilai Konversi</span>
                    <span className="text-sm font-bold text-[#80FF56] font-mono">{Number(dashboardData.metrics.total_sales_usdt).toFixed(2)} USDT</span>
                  </div>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#80FF56]/10 rounded-full blur-xl group-hover:bg-[#80FF56]/20 transition-all"></div>
                  <div>
                    <span className="text-xs text-grey-muted uppercase tracking-wider font-semibold mb-2 block">Estimasi Gas Dihemat</span>
                    <span className="text-3xl font-extrabold text-[#80FF56] font-mono tracking-tight">{Number(dashboardData.metrics.total_gas_saved_usdt).toFixed(2)} <span className="text-lg">USDT</span></span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#383A40]/50 flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#80FF56]" />
                    <span className="text-xs font-medium text-grey-muted">Via Batching Smart Contract</span>
                  </div>
                </div>

                <div className="bg-linear-to-br from-[#7F56FF] to-purple-800 border border-[#7F56FF] p-6 rounded-3xl flex flex-col justify-between shadow-[0_0_20px_rgba(127,86,255,0.3)] text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4">
                    <Wallet size={120} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs text-white/80 uppercase tracking-wider font-semibold mb-2 block">Dana Siap Tarik (Custody)</span>
                    <span className="text-3xl font-extrabold font-mono tracking-tight">{Number(dashboardData.metrics.available_withdrawal_usdt).toFixed(2)} USDT</span>
                  </div>
                  <button onClick={handleWithdraw} disabled={dashboardData.metrics.available_withdrawal_usdt <= 0} className={`relative z-10 mt-6 py-3 w-full rounded-xl text-sm font-bold transition-all ${dashboardData.metrics.available_withdrawal_usdt <= 0 ? 'bg-black/20 text-white/50 cursor-not-allowed' : 'bg-[#80FF56] hover:bg-white text-[#111214] shadow-lg'}`}>
                    Tarik Dana (Batch Withdraw)
                  </button>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl flex flex-col justify-between shadow-lg">
                  <span className="text-xs text-grey-muted uppercase tracking-wider font-semibold mb-4 block">Status Pesanan L2</span>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#80FF56]"></div><span className="text-sm text-off-white">Lunas / Selesai</span></div><span className="font-bold text-off-white font-mono">{dashboardData.status_counts.paid + dashboardData.status_counts.withdrawn}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-sm text-grey-muted">Pending Blockchain</span></div><span className="font-bold text-off-white font-mono">{dashboardData.status_counts.pending}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div><span className="text-sm text-grey-muted">Anomali Terdeteksi</span></div><span className="font-bold text-red-400 font-mono">{dashboardData.status_counts.anomaly}</span></div>
                  </div>
                </div>
              </div>

              {/* Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div className="lg:col-span-8 bg-[#2B2D31] border border-[#383A40] rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-title font-bold text-lg text-off-white">Riwayat Transaksi Terbaru</h3>
                    <button className="text-xs text-[#7F56FF] hover:text-white font-semibold transition-colors flex items-center gap-1">Lihat Semua <ArrowUpRight size={14}/></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#383A40] text-grey-muted uppercase tracking-wider font-semibold text-xs">
                          <th className="pb-4 pr-4">Order ID</th>
                          <th className="pb-4 px-4">Pembayaran IDR</th>
                          <th className="pb-4 px-4">Setelmen USDT</th>
                          <th className="pb-4 px-4">Status L2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#383A40]/50">
                        {dashboardData.recent_orders.length > 0 ? dashboardData.recent_orders.map((o: Order) => (
                          <tr key={o.id} className="hover:bg-[#111214] transition-colors group">
                            <td className="py-4 pr-4 font-bold font-mono text-off-white group-hover:text-[#7F56FF] transition-colors">{o.id}</td>
                            <td className="py-4 px-4 text-grey-muted font-medium">Rp {o.total_price_idr.toLocaleString('id-ID')}</td>
                            <td className="py-4 px-4 font-mono font-bold text-[#80FF56]">{Number(o.total_price_usdt).toFixed(2)}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-extrabold uppercase py-1 px-3 rounded-full border ${
                                o.status === 'paid' ? 'bg-[#80FF56]/10 text-[#80FF56] border-[#80FF56]/20' : 
                                o.status === 'withdrawn' ? 'bg-[#7F56FF]/10 text-[#7F56FF] border-[#7F56FF]/20' : 
                                o.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                o.status === 'refunded' ? 'bg-grey-muted/10 text-grey-muted border-[#383A40]' : 
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={4} className="py-12 text-center text-grey-muted">Belum ada riwayat transaksi yang tercatat.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-[#2B2D31] border border-[#383A40] rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-title font-bold text-lg text-off-white">Aktivitas Penarikan</h3>
                    <div className="w-8 h-8 rounded-full bg-[#7F56FF]/10 text-[#7F56FF] flex items-center justify-center"><Wallet size={14}/></div>
                  </div>
                  <div className="flex flex-col gap-4 grow">
                    {dashboardData.recent_withdrawals.length > 0 ? dashboardData.recent_withdrawals.map((w: Withdrawal) => (
                      <div key={w.id} className="bg-[#111214] border border-[#383A40] p-4 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-bold text-off-white font-mono">{Number(w.amount_usdt).toFixed(2)} USDT</span>
                          <span className="text-[10px] text-[#80FF56] bg-[#80FF56]/10 py-1 px-2 rounded-lg font-mono font-bold uppercase">Hemat Gas: {Number(w.gas_saved_usdt).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-grey-muted">
                           <span>{new Date(w.created_at).toLocaleDateString('id-ID')}</span>
                           <span className="font-mono truncate max-w-[120px]">{w.transaction_hash}</span>
                        </div>
                      </div>
                    )) : <div className="grow flex flex-col items-center justify-center py-12 text-center"><Wallet size={32} className="text-[#383A40] mb-3"/><p className="text-grey-muted text-sm">Belum ada penarikan.</p></div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center py-32 opacity-60">
              <Package size={64} className="text-[#383A40] mb-6" />
              <h3 className="text-2xl font-title font-bold text-off-white mb-2">Modul {navItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="text-grey-muted">Halaman fungsional ini sedang dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
