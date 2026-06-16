'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Wallet, History, ArrowUpRight, CheckCircle, Plus, X, ShieldAlert, Package, LayoutDashboard, UploadCloud, Info, Receipt, ExternalLink, Copy, Globe } from 'lucide-react';
import { UserSession } from '../../utils/types';
import { getDashboardData, requestWithdrawal, resolveAnomaly, checkBackendOnline, DashboardData, Order, OrderItem, AnomalyLog, Withdrawal, MOCK_PRODUCTS } from '../../utils/api';
import Sidebar, { SidebarItem } from './Sidebar';

interface Props { user: UserSession; onLogout: () => void; }

export default function AdminView({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendOnline, setBackendOnline] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentWallet, setCurrentWallet] = useState(user.walletAddress);

  const handleChangeWallet = async () => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const win = window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } };
      try {
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setCurrentWallet(accounts[0]);
        }
      } catch {
        alert('Gagal menghubungkan MetaMask. Silakan coba lagi.');
      }
    } else {
      alert('MetaMask tidak terdeteksi! Silakan install ekstensi dompet Web3 di browser Anda.');
    }
  };

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
        const res = await requestWithdrawal(currentWallet);
        alert(res.message); refreshData();
      } else {
        const pendingPaid = localOrders.filter(o => o.status === 'paid' && o.payment_method === 'custody');
        if (pendingPaid.length === 0) return alert('Tidak ada dana USDT yang tersedia untuk ditarik');
        const totalAmount = pendingPaid.reduce((sum, o) => sum + o.total_price_usdt, 0);
        const gasSaved = (pendingPaid.length - 1) * 0.01;
        const newW: Withdrawal = {
          id: Date.now(), merchant_address: currentWallet, amount_usdt: totalAmount, gas_saved_usdt: gasSaved > 0 ? gasSaved : 0,
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

  const displayOrders = (backendOnline && dashboardData) ? dashboardData.recent_orders : localOrders;
  const displayAnomalies = (backendOnline && dashboardData) ? dashboardData.recent_anomalies : localAnomalies;
  const displayWithdrawals = (backendOnline && dashboardData) ? dashboardData.recent_withdrawals : localWithdrawals;

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
              
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#383A40]">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#7F56FF]/20 to-purple-800/20 text-[#7F56FF] flex items-center justify-center border border-[#7F56FF]/30">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-title font-bold text-xl text-off-white">Detail Produk Baru</h3>
                  <p className="text-sm text-grey-muted mt-1">Lengkapi informasi di bawah ini untuk mengunggah produk ke blockchain.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Kiri: Info Dasar */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="text-xs text-grey-muted block mb-2 font-semibold">Nama Produk *</label>
                    <input type="text" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] placeholder:text-[#383A40] transition-colors" placeholder="Contoh: Kopi Gayo Premium 250gr" />
                  </div>
                  
                  <div>
                    <label className="text-xs text-grey-muted mb-2 font-semibold flex items-center gap-1">Deskripsi Produk <Info size={12} className="text-[#7F56FF]"/></label>
                    <textarea rows={4} className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] placeholder:text-[#383A40] transition-colors resize-none" placeholder="Jelaskan detail rasa, komposisi, atau panduan penggunaan produk Anda..."></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-grey-muted block mb-2 font-semibold">Harga Jual (IDR) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-muted text-sm font-bold">Rp</span>
                        <input type="number" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-2 font-semibold">Stok Tersedia *</label>
                      <input type="number" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors" placeholder="Jumlah fisik" />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-2 font-semibold">Kategori</label>
                      <select className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors appearance-none cursor-pointer">
                        <option value="">Pilih kategori...</option>
                        <option value="makanan">Makanan & Minuman</option>
                        <option value="pakaian">Pakaian / Fashion</option>
                        <option value="elektronik">Elektronik</option>
                        <option value="kriya">Kriya & Kerajinan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-2 font-semibold">Berat (Gram)</label>
                      <input type="number" className="w-full bg-[#111214] border border-[#383A40] text-sm text-off-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F56FF] transition-colors" placeholder="Contoh: 250" />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Media & Status */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-grey-muted mb-2 font-semibold flex items-center gap-2">Foto Produk <span className="bg-[#7F56FF]/20 text-[#7F56FF] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Wajib</span></label>
                    <div className="border-2 border-dashed border-[#383A40] hover:border-[#7F56FF] bg-[#111214] rounded-2xl h-48 flex flex-col items-center justify-center text-center p-4 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-[#2B2D31] flex items-center justify-center text-grey-muted group-hover:text-[#7F56FF] group-hover:scale-110 transition-all mb-3 shadow-inner">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-off-white mb-1 group-hover:text-[#7F56FF] transition-colors">Klik atau Tarik Foto</p>
                      <p className="text-xs text-grey-muted">PNG, JPG atau WEBP (Maks. 5MB)</p>
                    </div>
                  </div>

                  <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-4 hover:border-[#7F56FF]/40 transition-colors">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-off-white block">Status Publikasi</span>
                        <span className="text-[11px] text-grey-muted mt-0.5 block">Langsung tampilkan di katalog</span>
                      </div>
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#383A40] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#80FF56]"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#383A40] flex items-center justify-end gap-4">
                <button onClick={() => setShowAddProduct(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-grey-muted hover:text-off-white transition-colors">Batal</button>
                <button onClick={() => {
                   alert('Simulasi: Produk berhasil diunggah ke database dan katalog L2!');
                   setShowAddProduct(false);
                }} className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3 px-8 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(127,86,255,0.4)] hover:shadow-[0_0_30px_rgba(127,86,255,0.6)] transition-all flex items-center gap-2">
                  <Package size={18} /> Terbitkan Produk
                </button>
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

              {/* Anomalies Alert Moved to Bottom */}
              {dashboardData.recent_anomalies.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 shadow-xl mt-10 animate-slideUp w-full">
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
            </>
          )}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <div className="animate-fadeIn">
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <h3 className="font-title font-bold text-xl text-off-white mb-6">Semua Pesanan Masuk</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#383A40] text-grey-muted uppercase tracking-wider font-semibold text-xs">
                        <th className="pb-4 pr-4">Order ID</th>
                        <th className="pb-4 px-4">Tanggal</th>
                        <th className="pb-4 px-4">Pembayaran IDR</th>
                        <th className="pb-4 px-4">Setelmen USDT</th>
                        <th className="pb-4 px-4">Status L2</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#383A40]/50">
                      {displayOrders.length > 0 ? displayOrders.map((o: Order) => (
                        <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-[#111214] transition-colors group cursor-pointer">
                          <td className="py-4 pr-4 font-bold font-mono text-off-white group-hover:text-[#7F56FF] transition-colors">{o.id}</td>
                          <td className="py-4 px-4 text-grey-muted">{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 px-4 font-medium text-off-white">Rp {o.total_price_idr.toLocaleString('id-ID')}</td>
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
                      )) : <tr><td colSpan={5} className="py-12 text-center text-grey-muted">Belum ada pesanan masuk.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Anomalies */}
          {activeTab === 'anomalies' && (
            <div className="animate-fadeIn">
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 text-red-400 mb-8">
                  <ShieldAlert size={28} />
                  <div>
                    <h3 className="font-title font-bold text-xl">Investigasi Anomali Transaksi</h3>
                    <p className="text-sm text-grey-muted mt-1">Sistem blockchain menemukan ketidaksesuaian nilai transfer USDT dengan tagihan invoice Rupiah.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {displayAnomalies.length > 0 ? displayAnomalies.map((log: AnomalyLog) => (
                    <div key={log.id} className="bg-[#111214] border border-[#383A40] p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-red-500/40 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-base font-bold font-mono text-off-white">{log.order_id}</span>
                          <span className={`text-[10px] py-1 px-3 rounded-full font-bold uppercase tracking-wider ${log.status === 'flagged' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#80FF56]/10 text-[#80FF56] border border-[#80FF56]/20'}`}>
                            {log.status === 'flagged' ? 'Menunggu Tindakan' : 'Selesai (Resolved)'}
                          </span>
                        </div>
                        <p className="text-sm text-grey-muted mb-4">{log.notes}</p>
                        <div className="flex flex-wrap items-center gap-6 text-sm font-medium bg-[#1E1F22] py-3 px-5 rounded-xl border border-[#383A40]">
                          <span className="text-grey-muted">Tagihan Sistem: <strong className="text-off-white font-mono">{Number(log.expected_amount_usdt).toFixed(2)} USDT</strong></span>
                          <div className="w-px h-5 bg-[#383A40]"></div>
                          <span className="text-grey-muted">Jumlah Diterima: <strong className="text-red-400 font-mono">{Number(log.actual_amount_usdt).toFixed(2)} USDT</strong></span>
                        </div>
                      </div>
                      
                      {log.status === 'flagged' && (
                        <div className="flex lg:flex-col gap-3 shrink-0">
                          <button onClick={() => handleResolveAnomaly(log.order_id, 'approve')} className="w-full bg-[#80FF56] hover:bg-[#6cde46] text-[#111214] py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(128,255,86,0.2)]">Toleransi & Sahkan</button>
                          <button onClick={() => handleResolveAnomaly(log.order_id, 'refund')} className="w-full bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 py-3 px-6 rounded-xl text-sm font-bold transition-colors">Batalkan Pesanan</button>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#383A40] rounded-2xl">
                      <CheckCircle size={48} className="text-[#80FF56] mb-4 opacity-50" />
                      <h4 className="text-lg font-bold text-off-white">Semua Aman</h4>
                      <p className="text-sm text-grey-muted">Tidak ada anomali transaksi yang perlu diinvestigasi saat ini.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Withdrawals */}
          {activeTab === 'withdrawals' && (
            <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-linear-to-br from-[#7F56FF] to-purple-800 border border-[#7F56FF] p-8 rounded-3xl shadow-[0_0_20px_rgba(127,86,255,0.3)] text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4">
                    <Wallet size={160} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-sm text-white/80 uppercase tracking-wider font-bold mb-3 block">Saldo Tersedia (L2 Custody)</span>
                    <span className="text-4xl font-extrabold font-mono tracking-tight block mb-8">{dashboardData ? Number(dashboardData.metrics.available_withdrawal_usdt).toFixed(2) : '0.00'} <span className="text-xl text-white/70">USDT</span></span>
                    
                    <button onClick={handleWithdraw} disabled={!dashboardData || dashboardData.metrics.available_withdrawal_usdt <= 0} className={`w-full py-4 rounded-xl text-base font-bold transition-all ${(!dashboardData || dashboardData.metrics.available_withdrawal_usdt <= 0) ? 'bg-black/20 text-white/50 cursor-not-allowed' : 'bg-[#80FF56] hover:bg-white text-[#111214] shadow-lg hover:shadow-[0_0_20px_rgba(128,255,86,0.5)]'}`}>
                      Tarik ke Dompet Pribadi
                    </button>
                  </div>
                </div>

                <div className="bg-[#2B2D31] border border-[#383A40] p-6 rounded-3xl shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm text-grey-muted font-bold uppercase tracking-wider">Informasi Dompet Penerima</h4>
                    <button onClick={handleChangeWallet} className="text-xs bg-[#7F56FF]/20 text-[#7F56FF] hover:bg-[#7F56FF] hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
                      Ganti Dompet
                    </button>
                  </div>
                  <div className="bg-[#111214] border border-[#383A40] p-4 rounded-2xl break-all">
                    <span className="font-mono text-[#7F56FF] font-bold text-sm">{currentWallet}</span>
                  </div>
                  <p className="text-xs text-grey-muted mt-3">Pastikan dompet Anda mendukung jaringan Polygon (POL) atau Arbitrum (ETH) untuk menerima stablecoin USDT.</p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#2B2D31] border border-[#383A40] p-8 rounded-3xl shadow-xl flex flex-col">
                <h3 className="font-title font-bold text-xl text-off-white mb-6">Riwayat Penarikan (Batch Withdraw)</h3>
                
                <div className="flex flex-col gap-4 grow">
                  {displayWithdrawals.length > 0 ? displayWithdrawals.map((w: Withdrawal) => (
                    <div key={w.id} className="bg-[#111214] border border-[#383A40] p-5 rounded-2xl hover:border-[#7F56FF]/50 transition-colors">
                      <div className="flex items-center justify-between text-base mb-3">
                        <span className="font-bold text-off-white font-mono">{Number(w.amount_usdt).toFixed(2)} USDT</span>
                        <span className="text-xs text-[#80FF56] bg-[#80FF56]/10 py-1 px-3 rounded-xl font-mono font-bold uppercase border border-[#80FF56]/20 shadow-inner">
                          Gas Dihemat: {Number(w.gas_saved_usdt).toFixed(2)} USDT
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-grey-muted">
                          <span>Ditarik pada: {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="font-mono bg-[#1E1F22] py-1 px-2 rounded-lg border border-[#383A40]">Tx: {w.transaction_hash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  )) : (
                    <div className="grow flex flex-col items-center justify-center py-16 text-center">
                      <History size={48} className="text-[#383A40] mb-4"/>
                      <p className="text-grey-muted">Belum ada riwayat penarikan dana.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Products */}
          {activeTab === 'products' && (
            <div className="animate-fadeIn">
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 shadow-xl text-center py-20">
                <Package size={64} className="text-[#383A40] mx-auto mb-6" />
                <h3 className="text-2xl font-title font-bold text-off-white mb-2">Manajemen Katalog</h3>
                <p className="text-grey-muted mb-8 max-w-md mx-auto">Untuk menambahkan produk, gunakan tombol &quot;+ Tambah Produk&quot; di sudut kanan atas layar. Fitur modifikasi dan hapus produk segera hadir.</p>
                <button onClick={() => setShowAddProduct(true)} className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3 px-6 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(127,86,255,0.4)] transition-all flex items-center gap-2 mx-auto">
                  <Plus size={18} /> Tambah Produk Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E1F22] border border-[#383A40] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative animate-slideUp overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#7F56FF] to-[#80FF56]"></div>
            
            <div className="p-6 border-b border-[#383A40] flex items-center justify-between bg-[#111214]">
              <div>
                <h3 className="font-title font-bold text-xl text-off-white flex items-center gap-2">
                  <Receipt size={24} className="text-[#7F56FF]" />
                  Detail Pesanan
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-sm text-grey-muted">{selectedOrder.id}</span>
                  <span className={`text-[10px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${
                    selectedOrder.status === 'paid' ? 'bg-[#80FF56]/10 text-[#80FF56] border-[#80FF56]/20' : 
                    selectedOrder.status === 'withdrawn' ? 'bg-[#7F56FF]/10 text-[#7F56FF] border-[#7F56FF]/20' : 
                    selectedOrder.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    selectedOrder.status === 'refunded' ? 'bg-grey-muted/10 text-grey-muted border-[#383A40]' : 
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-grey-muted hover:text-off-white hover:bg-[#2B2D31] rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grow custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Kiri: Info Blockchain & Pelanggan */}
                <div className="space-y-6">
                  <div className="bg-[#2B2D31] p-5 rounded-2xl border border-[#383A40]">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-3">Informasi Pelanggan</span>
                    <div className="flex items-center justify-between bg-[#111214] p-3 rounded-xl border border-[#383A40] group hover:border-[#7F56FF]/50 transition-colors">
                      <span className="font-mono text-sm text-[#7F56FF] truncate max-w-[85%]">{selectedOrder.customer_address}</span>
                      <button className="text-grey-muted group-hover:text-off-white transition-colors" title="Salin Address"><Copy size={14} /></button>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-grey-muted">Metode Pembayaran:</span>
                      <span className="font-bold text-off-white capitalize">{selectedOrder.payment_method === 'custody' ? 'Smart Contract (L2)' : 'Direct Transfer'}</span>
                    </div>
                  </div>

                  <div className="bg-[#2B2D31] p-5 rounded-2xl border border-[#383A40]">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-3">Jaringan Blockchain</span>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOrder.blockchain_network === 'polygon' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Globe size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-off-white block capitalize">{selectedOrder.blockchain_network}</span>
                        <span className="text-xs text-grey-muted">Layer 2 Scaling Solution</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-xs text-grey-muted">Transaction Hash:</span>
                      {selectedOrder.transaction_hash ? (
                        <a href={`https://${selectedOrder.blockchain_network === 'polygon' ? 'polygonscan.com' : 'arbiscan.io'}/tx/${selectedOrder.transaction_hash}`} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-[#111214] p-3 rounded-xl border border-[#383A40] hover:border-[#7F56FF] transition-colors group cursor-pointer">
                          <span className="font-mono text-xs text-off-white truncate w-4/5">{selectedOrder.transaction_hash}</span>
                          <ExternalLink size={14} className="text-[#7F56FF]" />
                        </a>
                      ) : (
                        <div className="bg-[#111214] p-3 rounded-xl border border-[#383A40] text-center">
                          <span className="text-xs text-yellow-500 font-mono">Menunggu Konfirmasi Jaringan...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Rincian Finansial */}
                <div className="space-y-6">
                  <div className="bg-linear-to-br from-[#2B2D31] to-[#111214] p-6 rounded-2xl border border-[#383A40] shadow-inner">
                    <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-5 border-b border-[#383A40] pb-2">Rincian Pembayaran</span>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-grey-muted">Total Harga (Fiat IDR)</span>
                        <span className="font-medium text-off-white">Rp {Number(selectedOrder.total_price_idr).toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-grey-muted">Estimasi Kurs (Oracle)</span>
                        <span className="font-mono text-xs text-[#7F56FF]">1 USDT = Rp {(Number(selectedOrder.total_price_idr) / Number(selectedOrder.total_price_usdt)).toFixed(0)}</span>
                      </div>
                      
                      <div className="h-px bg-[#383A40] w-full my-2"></div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-off-white">Setelmen Final</span>
                        <div className="text-right">
                          <span className="font-mono text-xl font-bold text-[#80FF56]">{Number(selectedOrder.total_price_usdt).toFixed(2)} <span className="text-sm">USDT</span></span>
                        </div>
                      </div>

                      <div className="mt-6 bg-[#111214] p-4 rounded-xl border border-[#383A40] flex items-start gap-3">
                        <ShieldAlert size={16} className="text-[#80FF56] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-off-white block mb-1">Penghematan Merchant</span>
                          <p className="text-[10px] text-grey-muted leading-relaxed">
                            Transaksi ini menghemat kurang lebih <strong>{Number(selectedOrder.gas_fee_estimated).toFixed(4)} ETH</strong> biaya Gas jika dibandingkan dengan Layer 1 berkat sistem <em>batching</em> STUMA.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Produk yang Dibeli */}
              <div className="mt-8 bg-[#2B2D31] p-6 rounded-2xl border border-[#383A40]">
                <span className="text-xs text-grey-muted font-bold uppercase tracking-wider block mb-4 border-b border-[#383A40] pb-2">Produk yang Dibeli</span>
                <div className="flex flex-col gap-3">
                  {(selectedOrder.items || [{ product: MOCK_PRODUCTS[selectedOrder.id.charCodeAt(selectedOrder.id.length - 1) % MOCK_PRODUCTS.length], quantity: 1 }]).map((item: OrderItem, idx: number) => {
                    const prod = item.product || (item as unknown as typeof MOCK_PRODUCTS[0]);
                    const qty = item.quantity || 1;
                    return (
                      <div key={idx} className="bg-[#111214] p-4 rounded-xl border border-[#383A40] flex items-center gap-4 group hover:border-[#7F56FF]/50 transition-colors">
                        <Image unoptimized src={prod.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80'} alt={prod.name} width={64} height={64} className="w-16 h-16 object-cover rounded-lg border border-[#383A40]" />
                        <div className="flex-1">
                          <h4 className="text-off-white font-bold text-sm line-clamp-1 group-hover:text-[#7F56FF] transition-colors">{prod.name}</h4>
                          <p className="text-xs text-grey-muted line-clamp-1 mt-1">{prod.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-off-white block">Rp {Number(prod.price_idr || 0).toLocaleString('id-ID')}</span>
                          <span className="text-xs text-[#80FF56] font-mono font-bold bg-[#80FF56]/10 px-2 py-0.5 rounded-md mt-1 inline-block border border-[#80FF56]/20">x{qty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-[#383A40] bg-[#111214] flex justify-end gap-4">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-grey-muted hover:text-off-white hover:bg-[#2B2D31] transition-colors">Tutup</button>
              <button className="bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-2.5 px-6 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(127,86,255,0.3)] transition-all flex items-center gap-2">
                <ExternalLink size={16} /> Buka Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
