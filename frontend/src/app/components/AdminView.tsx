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

  useEffect(() => { refreshData(); }, [refreshData]);

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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Katalog Produk', icon: <Package size={18} /> },
    { id: 'orders', label: 'Pesanan Masuk', icon: <History size={18} />, badge: dashboardData?.status_counts.pending },
    { id: 'anomalies', label: 'Anomali Transaksi', icon: <ShieldAlert size={18} />, badge: dashboardData?.recent_anomalies.length },
    { id: 'withdrawals', label: 'Riwayat Penarikan', icon: <Wallet size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-charcoal text-off-white font-sans overflow-hidden">
      <Sidebar 
        user={user} items={navItems} activeItem={activeTab} onItemClick={setActiveTab} 
        onLogout={onLogout} accentColor="amber-accent" collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-title text-2xl font-bold text-off-white">Merchant Dashboard</h2>
              <p className="text-sm text-grey-muted">Pantau penjualan, kelola anomali pembayaran, dan withdraw saldo stablecoin.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-amber-accent text-charcoal py-2 px-4 rounded-xl text-xs font-semibold hover:bg-amber-500 transition-all flex items-center gap-1.5 shadow-md shadow-amber-accent/15">
                <Plus size={14} /><span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {/* Add Product Form */}
          {showAddProduct && (
            <div className="bg-charcoal-light border border-border-color rounded-2xl p-6 shadow-xl relative animate-fadeIn mb-8">
              <button onClick={() => setShowAddProduct(false)} className="absolute top-4 right-4 p-1.5 text-grey-muted hover:text-off-white hover:bg-charcoal rounded-lg transition-colors"><X size={16} /></button>
              <h3 className="font-title font-bold text-lg text-off-white mb-4">Tambah Produk Baru ke Katalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="text-xs text-grey-muted block mb-1 font-semibold">Nama Produk</label><input type="text" className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-accent" /></div>
                <div><label className="text-xs text-grey-muted block mb-1 font-semibold">Harga (IDR)</label><input type="number" className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-accent" /></div>
                <div><label className="text-xs text-grey-muted block mb-1 font-semibold">Stok Awal</label><input type="number" className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-accent" /></div>
                <div className="md:col-span-3 flex justify-end"><button onClick={() => setShowAddProduct(false)} className="bg-amber-accent text-charcoal py-2 px-6 rounded-xl text-xs font-semibold">Simpan</button></div>
              </div>
            </div>
          )}

          {/* Anomalies Alert */}
          {dashboardData && dashboardData.recent_anomalies.length > 0 && activeTab === 'dashboard' && (
            <div className="bg-red-500/5 border border-red-500/35 rounded-2xl p-5 shadow-lg mb-8">
              <div className="flex items-center gap-2 text-red-400 mb-4"><ShieldAlert size={20} /><h3 className="font-title font-bold text-base">Deteksi Anomali Transaksi (Butuh Verifikasi Manual)</h3></div>
              <div className="flex flex-col gap-3">
                {dashboardData.recent_anomalies.map((log: AnomalyLog) => (
                  <div key={log.id} className="bg-charcoal-dark border border-red-500/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2"><span className="text-xs font-bold font-mono text-red-400">{log.order_id}</span><span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 py-0.5 px-2 rounded-full font-semibold uppercase">Flagged</span></div>
                      <p className="text-xs text-grey-muted mt-1.5">{log.notes}</p>
                      <div className="flex flex-wrap items-center gap-x-4 mt-2.5 text-[11px] font-medium"><span className="text-grey-muted">Tagihan: <strong className="text-off-white font-mono">{Number(log.expected_amount_usdt).toFixed(2)} USDT</strong></span><span className="text-grey-muted">Dikirim: <strong className="text-red-400 font-mono">{Number(log.actual_amount_usdt).toFixed(2)} USDT</strong></span></div>
                    </div>
                    {log.status === 'flagged' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleResolveAnomaly(log.order_id, 'approve')} className="bg-lime-green text-charcoal py-1.5 px-3 rounded-lg text-xs font-bold hover:scale-105 transition-transform">Setujui Lunas</button>
                        <button onClick={() => handleResolveAnomaly(log.order_id, 'refund')} className="bg-charcoal border border-border-color text-red-400 hover:bg-red-500/10 py-1.5 px-3 rounded-lg text-xs font-bold">Batalkan</button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div><span className="text-[10px] text-grey-muted block uppercase tracking-wider font-semibold">Total Pendapatan</span><span className="text-2xl font-bold text-off-white font-title block mt-1.5">Rp {dashboardData.metrics.total_sales_idr.toLocaleString('id-ID')}</span><span className="text-xs font-semibold text-lime-green font-mono block mt-1">{Number(dashboardData.metrics.total_sales_usdt).toFixed(2)} USDT</span></div>
                  <div className="w-12 h-12 rounded-xl bg-lime-green/10 flex items-center justify-center text-lime-green"><ArrowUpRight size={24} /></div>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div><span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Gas Fee Dihemat</span><span className="text-2xl font-bold text-lime-green font-mono block mt-1.5">{Number(dashboardData.metrics.total_gas_saved_usdt).toFixed(2)} USDT</span></div>
                  <div className="w-12 h-12 rounded-xl bg-amber-accent/10 flex items-center justify-center text-amber-accent"><CheckCircle size={24} /></div>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div><span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Dana Siap Tarik</span><span className="text-2xl font-bold text-off-white font-mono block mt-1.5">{Number(dashboardData.metrics.available_withdrawal_usdt).toFixed(2)} USDT</span>
                    <button onClick={handleWithdraw} disabled={dashboardData.metrics.available_withdrawal_usdt <= 0} className={`mt-2 py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${dashboardData.metrics.available_withdrawal_usdt <= 0 ? 'bg-border-color text-grey-muted' : 'bg-lime-green text-charcoal'}`}>Withdraw Batch</button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-lime-green-light flex items-center justify-center text-lime-green"><Wallet size={24} /></div>
                </div>
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div><span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Status Pesanan</span>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="text-center"><span className="text-xs font-bold text-off-white">{dashboardData.status_counts.paid + dashboardData.status_counts.withdrawn}</span><span className="text-[9px] text-grey-muted block">Lunas</span></div>
                      <div className="w-px h-6 bg-border-color"></div>
                      <div className="text-center"><span className="text-xs font-bold text-amber-accent">{dashboardData.status_counts.pending}</span><span className="text-[9px] text-grey-muted block">Pending</span></div>
                      <div className="w-px h-6 bg-border-color"></div>
                      <div className="text-center"><span className="text-xs font-bold text-red-400">{dashboardData.status_counts.anomaly}</span><span className="text-[9px] text-grey-muted block">Anomali</span></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-charcoal-dark border border-border-color flex items-center justify-center text-grey-muted"><History size={24} /></div>
                </div>
              </div>

              {/* Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg flex flex-col">
                  <h3 className="font-title font-bold text-base text-off-white mb-4">Riwayat Pesanan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-color text-grey-muted uppercase tracking-wider font-semibold">
                          <th className="pb-3 pr-2">ID</th>
                          <th className="pb-3 px-2">Total Harga</th>
                          <th className="pb-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color/50">
                        {dashboardData.recent_orders.length > 0 ? dashboardData.recent_orders.map((o: Order) => (
                          <tr key={o.id} className="hover:bg-charcoal-dark/20">
                            <td className="py-3.5 pr-2 font-bold font-mono text-off-white">{o.id}</td>
                            <td className="py-3.5 px-2">
                              <div className="font-medium text-off-white">Rp {o.total_price_idr.toLocaleString('id-ID')}</div>
                              <div className="text-[10px] text-lime-green font-mono font-medium">{Number(o.total_price_usdt).toFixed(2)} USDT</div>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border ${o.status === 'paid' ? 'bg-lime-green/10 text-lime-green border-lime-green/20' : o.status === 'withdrawn' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : o.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' : o.status === 'refunded' ? 'bg-grey-muted/10 text-grey-muted border-grey-muted/20' : 'bg-amber-accent/10 text-amber-accent border-amber-accent/20'}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={3} className="py-8 text-center text-grey-muted">Belum ada riwayat transaksi.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="lg:col-span-4 bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg flex flex-col">
                  <h3 className="font-title font-bold text-base text-off-white mb-4">Riwayat Penarikan Batch</h3>
                  <div className="flex flex-col gap-3 grow">
                    {dashboardData.recent_withdrawals.length > 0 ? dashboardData.recent_withdrawals.map((w: Withdrawal) => (
                      <div key={w.id} className="bg-charcoal-dark border border-border-color/60 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-off-white font-mono">{Number(w.amount_usdt).toFixed(2)} USDT</span>
                          <span className="text-[10px] text-lime-green font-mono font-semibold">Saved: +{Number(w.gas_saved_usdt).toFixed(2)}</span>
                        </div>
                      </div>
                    )) : <div className="grow flex items-center justify-center py-8 text-center text-grey-muted text-xs">Belum ada penarikan.</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <Package size={48} className="text-border-color mb-4" />
              <h3 className="text-lg font-title font-bold">Menu {navItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="text-sm text-grey-muted">Halaman ini dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
