'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ShoppingBag, CheckCircle, Trash2, X, Info, ShieldAlert, History, Package, LogOut, RefreshCw, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { UserSession } from '../../utils/types';
import { getProducts, createOrder, triggerBlockchainWebhook, Product, Order } from '../../utils/api';

interface Props { user: UserSession; onLogout: () => void; onUpdateSession: (user: UserSession) => void; }

export default function CustomerView({ user, onLogout, onUpdateSession }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'shop'|'orders'|'wallet'>('shop');
  // Wallet change states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletChangeStep, setWalletChangeStep] = useState<'idle'|'confirming'|'connecting'|'success'>('idle');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletHistory, setWalletHistory] = useState<{address: string; changedAt: string; method: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stuma_wallet_history_' + user.email);
      return saved ? JSON.parse(saved) : [{ address: user.walletAddress, changedAt: new Date().toISOString(), method: 'Pendaftaran Awal' }];
    }
    return [{ address: user.walletAddress, changedAt: new Date().toISOString(), method: 'Pendaftaran Awal' }];
  });
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon'|'arbitrum'>('polygon');
  const [paymentMethod, setPaymentMethod] = useState<'custody'|'direct'>('custody');
  const [walletUsdtBalance, setWalletUsdtBalance] = useState(50.00);
  const [walletNativeBalance, setWalletNativeBalance] = useState(1.5);
  const [checkoutOrder, setCheckoutOrder] = useState<Order|null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle'|'converting'|'gas_estimating'|'signing'|'webhook'|'success'|'anomaly'>('idle');
  const [simulateAnomaly, setSimulateAnomaly] = useState(false);
  const [, setUsdtRate] = useState(16400);
  const [txHash, setTxHash] = useState('');
  const [myOrders, setMyOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') { const s = localStorage.getItem('stuma_customer_orders_' + user.email); return s ? JSON.parse(s) : []; }
    return [];
  });

  const refreshProducts = useCallback(async () => { setProducts(await getProducts()); }, []);
  useEffect(() => {
    const t = setTimeout(() => { refreshProducts(); }, 0);
    return () => clearTimeout(t);
  }, [refreshProducts]);
  useEffect(() => { if (myOrders.length > 0) localStorage.setItem('stuma_customer_orders_' + user.email, JSON.stringify(myOrders)); }, [myOrders, user.email]);
  useEffect(() => { localStorage.setItem('stuma_wallet_history_' + user.email, JSON.stringify(walletHistory)); }, [walletHistory, user.email]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleManualWalletChange = () => {
    if (!newWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress)) {
      alert('Format alamat dompet tidak valid. Harus berformat 0x... dengan 42 karakter.');
      return;
    }
    if (newWalletAddress.toLowerCase() === user.walletAddress.toLowerCase()) {
      alert('Alamat ini sama dengan dompet Anda saat ini.');
      return;
    }
    setWalletChangeStep('confirming');
  };

  const confirmWalletChange = (address: string, method: string) => {
    const updatedUser: UserSession = { ...user, walletAddress: address };
    const newHistoryEntry = { address, changedAt: new Date().toISOString(), method };
    setWalletHistory(prev => [newHistoryEntry, ...prev]);
    onUpdateSession(updatedUser);
    setWalletChangeStep('success');
    setNewWalletAddress('');
    setTimeout(() => {
      setWalletChangeStep('idle');
      setShowWalletModal(false);
    }, 2500);
  };

  const handleMetaMaskWalletChange = async () => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const win = window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } };
      setWalletChangeStep('connecting');
      try {
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          if (walletAddress.toLowerCase() === user.walletAddress.toLowerCase()) {
            alert('Dompet MetaMask ini sama dengan dompet Anda saat ini.');
            setWalletChangeStep('idle');
            return;
          }
          confirmWalletChange(walletAddress, 'MetaMask');
        }
      } catch {
        alert('Gagal menghubungkan MetaMask. Silakan coba lagi.');
        setWalletChangeStep('idle');
      }
    } else {
      alert('MetaMask tidak terdeteksi! Silakan install ekstensi dompet Web3.');
    }
  };

  const addToCart = (p: Product) => {
    const ex = cart.find(i => i.product.id === p.id);
    if (ex) setCart(cart.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { product: p, quantity: 1 }]);
  };
  const removeFromCart = (id: number) => setCart(cart.filter(i => i.product.id !== id));
  const getCartTotal = () => cart.reduce((s, i) => s + i.product.price_idr * i.quantity, 0);

  const startCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutStep('converting');
    const items = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
    try {
      const res = await createOrder({ items, blockchain_network: selectedNetwork, payment_method: paymentMethod, customer_address: user.walletAddress });
      setCheckoutOrder(res.order); setUsdtRate(res.usdt_rate);
      setMyOrders(prev => [res.order, ...prev]);
      setTimeout(() => { setCheckoutStep('gas_estimating'); setTimeout(() => setCheckoutStep('signing'), 1500); }, 1500);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal'); setCheckoutStep('idle'); }
  };

  const completePayment = async () => {
    if (!checkoutOrder) return;
    setCheckoutStep('webhook');
    const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTxHash(mockHash);
    const expected = checkoutOrder.total_price_usdt;
    const actual = simulateAnomaly ? parseFloat((expected - 1.5).toFixed(6)) : expected;
    setWalletUsdtBalance(prev => Math.max(0, parseFloat((prev - actual).toFixed(6))));
    const gasCost = selectedNetwork === 'polygon' ? (checkoutOrder.gas_fee_estimated || 0.005) : (checkoutOrder.gas_fee_estimated || 0.015);
    setWalletNativeBalance(prev => Math.max(0, parseFloat((prev - gasCost).toFixed(6))));
    try {
      await triggerBlockchainWebhook({ tx_hash: mockHash, order_id: checkoutOrder.id, amount_usdt: actual });
      setTimeout(() => {
        if (simulateAnomaly) {
          setMyOrders(prev => prev.map(o => o.id === checkoutOrder.id ? { ...o, status: 'anomaly', transaction_hash: mockHash } : o));
          setCheckoutStep('anomaly');
        } else {
          setMyOrders(prev => prev.map(o => o.id === checkoutOrder.id ? { ...o, status: 'paid', transaction_hash: mockHash } : o));
          setCheckoutStep('success'); setCart([]);
        }
      }, 2000);
    } catch { alert('Gagal verifikasi'); setCheckoutStep('idle'); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1E1F22] text-off-white font-sans selection:bg-[#7F56FF] selection:text-white">
      {/* Top bar */}
      <header className="bg-[#111214] border-b border-[#383A40] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#7F56FF] to-purple-800 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(127,86,255,0.4)]">S</div>
            <div>
              <h1 className="font-title text-xl font-bold text-off-white tracking-tight flex items-center gap-2">
                STUMA 
                <span className="text-[10px] uppercase bg-[#7F56FF]/20 text-[#7F56FF] border border-[#7F56FF]/30 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">Pelanggan</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet info */}
            <div className="hidden md:flex items-center gap-3 bg-[#2B2D31] border border-[#383A40] py-2 px-4 rounded-xl text-xs shadow-inner">
              <Wallet size={14} className="text-grey-muted" />
              <span className="text-[#80FF56] font-bold font-mono">{walletUsdtBalance.toFixed(2)} USDT</span>
              <span className="text-[#383A40]">|</span>
              <span className="text-[#7F56FF] font-bold font-mono">{walletNativeBalance.toFixed(2)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</span>
            </div>
            <select value={selectedNetwork} onChange={e => setSelectedNetwork(e.target.value as 'polygon'|'arbitrum')} className="bg-[#2B2D31] text-off-white border border-[#383A40] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#7F56FF] font-semibold cursor-pointer">
              <option value="polygon">Polygon (POL)</option>
              <option value="arbitrum">Arbitrum (ETH)</option>
            </select>
            <div className="flex items-center gap-3 bg-[#111214] py-1.5 px-1.5 pr-4 rounded-full border border-[#383A40]">
              <div className="w-8 h-8 rounded-full bg-[#7F56FF]/20 text-[#7F56FF] flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
              <div className="hidden sm:block"><p className="text-xs font-bold text-off-white leading-tight">{user.name}</p></div>
            </div>
            <button onClick={onLogout} className="p-2.5 text-grey-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" title="Keluar"><LogOut size={18} /></button>
          </div>
        </div>
        {/* Sub nav */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-2">
          {[{ id: 'shop' as const, label: 'Katalog Belanja', icon: <ShoppingBag size={16}/> }, { id: 'orders' as const, label: 'Pesanan Saya', icon: <History size={16}/> }, { id: 'wallet' as const, label: 'Dompet Saya', icon: <Wallet size={16}/> }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 py-3 px-6 rounded-t-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-[#1E1F22] text-[#7F56FF] border-t-2 border-t-[#7F56FF] border-l border-r border-[#383A40]' : 'text-grey-muted hover:text-off-white bg-transparent'}`}>
              {t.icon}<span>{t.label}</span>
              {t.id === 'orders' && myOrders.length > 0 && <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-[#7F56FF] text-white' : 'bg-[#383A40] text-off-white'}`}>{myOrders.length}</span>}
            </button>
          ))}
        </div>
      </header>

      <main className="grow max-w-7xl mx-auto px-4 md:px-8 py-10 w-full relative">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#7F56FF]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {activeTab === 'wallet' ? (
          /* Wallet Management Tab */
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-title text-3xl font-bold text-off-white mb-2">Dompet Saya</h2>
                <p className="text-sm text-grey-muted">Kelola alamat dompet kripto untuk transaksi USDT di STUMA.</p>
              </div>
            </div>

            {/* Current Wallet Card */}
            <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8 mb-6 relative overflow-hidden group hover:border-[#7F56FF]/50 transition-colors">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7F56FF]/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#7F56FF]/20 text-[#7F56FF] flex items-center justify-center shadow-[0_0_20px_rgba(127,86,255,0.2)]">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="font-title font-bold text-lg text-off-white">Dompet Aktif</h3>
                    <p className="text-xs text-grey-muted">Alamat dompet yang terhubung ke akun Anda</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-[#80FF56]/10 text-[#80FF56] text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border border-[#80FF56]/20">
                      <span className="w-2 h-2 rounded-full bg-[#80FF56] animate-pulse"></span>
                      Terhubung
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-2">Alamat Wallet (EVM)</span>
                      <p className="font-mono text-sm text-off-white break-all leading-relaxed">{user.walletAddress}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(user.walletAddress)}
                      className="shrink-0 p-3 rounded-xl bg-[#2B2D31] border border-[#383A40] hover:border-[#7F56FF] text-grey-muted hover:text-[#7F56FF] transition-all hover:scale-105"
                      title="Salin alamat"
                    >
                      {copiedAddress ? <Check size={18} className="text-[#80FF56]" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#111214] border border-[#383A40] rounded-xl p-4">
                    <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-1">Saldo USDT</span>
                    <span className="font-mono font-extrabold text-lg text-[#80FF56]">{walletUsdtBalance.toFixed(2)}</span>
                  </div>
                  <div className="bg-[#111214] border border-[#383A40] rounded-xl p-4">
                    <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-1">{selectedNetwork === 'polygon' ? 'POL' : 'ETH'} Balance</span>
                    <span className="font-mono font-extrabold text-lg text-[#7F56FF]">{walletNativeBalance.toFixed(4)}</span>
                  </div>
                  <div className="bg-[#111214] border border-[#383A40] rounded-xl p-4">
                    <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-1">Jaringan</span>
                    <span className="font-bold text-off-white uppercase text-sm">{selectedNetwork}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setShowWalletModal(true); setWalletChangeStep('idle'); setNewWalletAddress(''); }}
                  className="w-full sm:w-auto bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3.5 px-8 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(127,86,255,0.3)] hover:shadow-[0_0_30px_rgba(127,86,255,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Ganti Dompet
                </button>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-6 flex items-start gap-4">
              <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-yellow-500 mb-1">Peringatan Keamanan</h4>
                <p className="text-xs text-grey-muted leading-relaxed">
                  Mengganti alamat dompet akan mengarahkan semua transaksi masa depan ke alamat baru. Pastikan Anda memiliki akses penuh ke dompet baru sebelum mengganti. Transaksi lama yang sudah selesai tidak akan terpengaruh.
                </p>
              </div>
            </div>

            {/* Wallet History */}
            <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-8">
              <h3 className="font-title font-bold text-lg text-off-white mb-6 flex items-center gap-2">
                <History size={20} className="text-[#7F56FF]" />
                Riwayat Perubahan Dompet
              </h3>
              {walletHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <History size={40} className="text-[#383A40] mx-auto mb-4" />
                  <p className="text-grey-muted text-sm">Belum ada riwayat perubahan dompet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {walletHistory.map((entry, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111214] border rounded-2xl p-5 transition-colors ${idx === 0 ? 'border-[#7F56FF]/30' : 'border-[#383A40]'}`}>
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-[#7F56FF]/20 text-[#7F56FF]' : 'bg-[#383A40]/30 text-grey-muted'}`}>
                          <Wallet size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-mono text-xs text-off-white truncate max-w-[280px]">{entry.address}</p>
                            {idx === 0 && <span className="text-[9px] font-extrabold uppercase bg-[#7F56FF]/20 text-[#7F56FF] px-2 py-0.5 rounded-full border border-[#7F56FF]/30">Aktif</span>}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-grey-muted">
                            <span className="font-medium">{entry.method}</span>
                            <span className="w-1 h-1 rounded-full bg-[#383A40]"></span>
                            <span>{new Date(entry.changedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(entry.address)}
                        className="shrink-0 p-2 rounded-lg text-grey-muted hover:text-[#7F56FF] hover:bg-[#7F56FF]/10 transition-colors"
                        title="Salin alamat"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Products */}
            <div className="lg:col-span-8">
              <h2 className="font-title text-3xl font-bold text-off-white mb-2">Katalog UMKM Pilihan</h2>
              <p className="text-sm text-grey-muted mb-8">Dukung produk lokal berkualitas dengan transaksi kripto berbiaya murah.</p>
              
              {products.length === 0 ? (
                <div className="flex flex-col items-center py-24 bg-[#2B2D31] rounded-3xl border border-dashed border-[#383A40]">
                  <Package size={48} className="text-[#383A40] mb-4 animate-pulse" />
                  <p className="text-grey-muted text-sm font-medium">Mengunduh data katalog...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-[#2B2D31] border border-[#383A40] rounded-3xl overflow-hidden hover:border-[#7F56FF]/50 transition-all duration-300 flex flex-col group hover:shadow-[0_0_20px_rgba(127,86,255,0.1)]">
                      <div className="h-48 relative bg-[#111214] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                        {p.stock <= 5 && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold uppercase py-1.5 px-3 rounded-full shadow-lg">Sisa {p.stock}</span>}
                      </div>
                      <div className="p-5 flex flex-col grow">
                        <h3 className="font-title font-bold text-lg text-off-white group-hover:text-[#7F56FF] transition-colors line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-grey-muted mt-2 mb-5 line-clamp-2 leading-relaxed">{p.description}</p>
                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-[#383A40]/50">
                          <div>
                            <span className="text-[10px] text-grey-muted block uppercase tracking-wider font-semibold mb-0.5">Harga Rupiah</span>
                            <span className="text-lg font-extrabold text-off-white font-title tracking-tight">Rp {p.price_idr.toLocaleString('id-ID')}</span>
                          </div>
                          <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${p.stock <= 0 ? 'bg-[#111214] text-[#383A40] cursor-not-allowed' : 'bg-[#7F56FF] hover:bg-[#6c42f0] text-white shadow-[0_0_15px_rgba(127,86,255,0.3)] hover:scale-105'}`}>
                             <ShoppingBag size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Payment config */}
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-6 shadow-xl">
                <h3 className="font-title font-bold text-sm uppercase tracking-wider text-grey-muted mb-4 flex items-center gap-2"><Wallet size={16} className="text-[#7F56FF]"/>Opsi Smart Contract</h3>
                <div className="grid grid-cols-2 gap-2 bg-[#111214] border border-[#383A40] p-1.5 rounded-2xl mb-3">
                  {(['custody','direct'] as const).map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center transition-all ${paymentMethod === m ? 'bg-[#7F56FF] text-white shadow-lg' : 'text-grey-muted hover:text-off-white'}`}>
                      <span>{m === 'custody' ? 'USDT Custody' : 'Direct Transfer'}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-[#1E1F22] p-3 rounded-xl border border-[#383A40]/50 flex items-start gap-2">
                   <Info size={14} className="shrink-0 text-[#7F56FF] mt-0.5"/>
                   <p className="text-[11px] text-grey-muted leading-relaxed">
                     {paymentMethod === 'custody' ? 'Dana ditahan sementara di Smart Contract. Penjual menarik dana secara batch untuk menghemat 90% gas fee.' : 'USDT langsung ditransfer ke wallet penjual. Biaya gas ditanggung sepenuhnya per transaksi.'}
                   </p>
                </div>
              </div>

              {/* Cart */}
              <div className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-6 shadow-xl flex flex-col max-h-[600px]">
                <div className="flex items-center justify-between mb-5">
                   <h3 className="font-title font-bold text-lg text-off-white flex items-center gap-2"><ShoppingBag size={20} className="text-[#7F56FF]"/>Keranjang</h3>
                   {cart.length > 0 && <span className="bg-[#7F56FF]/20 text-[#7F56FF] text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} item</span>}
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center"><ShoppingBag size={40} className="text-[#383A40] mb-4"/><p className="text-sm text-grey-muted">Keranjang masih kosong.</p></div>
                ) : (
                  <>
                    <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1 min-h-0 mb-5">
                      {cart.map(i => (
                        <div key={i.product.id} className="flex items-center justify-between gap-3 bg-[#111214] border border-[#383A40] p-3 rounded-2xl group hover:border-[#7F56FF]/40 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={i.product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-[#1E1F22] border border-[#383A40]"/>
                            <div className="min-w-0">
                               <h4 className="text-xs font-bold text-off-white truncate mb-1 group-hover:text-[#7F56FF] transition-colors">{i.product.name}</h4>
                               <p className="text-[11px] text-grey-muted font-medium">{i.quantity} x <span className="text-off-white">Rp {i.product.price_idr.toLocaleString('id-ID')}</span></p>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(i.product.id)} className="p-2 text-[#383A40] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#383A40] pt-5 mt-auto">
                      <div className="flex justify-between items-end mb-3"><span className="text-sm font-medium text-grey-muted">Total (IDR)</span><span className="font-extrabold text-xl text-off-white font-title tracking-tight">Rp {getCartTotal().toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between items-center py-2.5 bg-[#111214] border border-[#383A40] rounded-xl px-4 mb-5"><span className="text-[11px] font-bold text-grey-muted uppercase tracking-wider">Konversi L2</span><span className="font-bold text-[#80FF56] font-mono text-base">~ {(getCartTotal() / 16400).toFixed(2)} USDT</span></div>
                      <button onClick={startCheckout} className="w-full bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(127,86,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                        <Wallet size={18}/> Bayar dengan USDT
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* My Orders Tab */
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h2 className="font-title text-3xl font-bold text-off-white mb-2">Pesanan Saya</h2>
                 <p className="text-sm text-grey-muted">Riwayat transaksi Web3 Anda.</p>
               </div>
            </div>
            
            {myOrders.length === 0 ? (
              <div className="py-24 text-center bg-[#2B2D31] rounded-3xl border border-dashed border-[#383A40]"><History size={48} className="text-[#383A40] mx-auto mb-4"/><p className="text-grey-muted text-sm">Belum ada riwayat pesanan.</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {myOrders.map(o => (
                  <div key={o.id} className="bg-[#2B2D31] border border-[#383A40] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-[#7F56FF]/50 transition-colors group">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-off-white group-hover:text-[#7F56FF] transition-colors">{o.id}</span>
                        <span className={`text-[10px] font-extrabold uppercase py-1 px-3 rounded-full border ${o.status === 'paid' ? 'bg-[#80FF56]/10 text-[#80FF56] border-[#80FF56]/20' : o.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                        <span className="text-grey-muted font-medium">Rp {o.total_price_idr.toLocaleString('id-ID')}</span>
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#383A40]"></div><span className="text-[#80FF56] font-mono font-bold text-sm">{Number(o.total_price_usdt).toFixed(2)} USDT</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#383A40]"></div><span className="text-grey-muted uppercase font-bold">{o.blockchain_network}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 border-t sm:border-t-0 border-[#383A40] pt-4 sm:pt-0">
                       <span className="text-[11px] text-grey-muted font-medium">{new Date(o.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                       {o.transaction_hash && <a href="#" className="text-[10px] font-mono text-[#7F56FF] hover:text-[#80FF56] truncate max-w-[200px] transition-colors flex items-center gap-1"><ShieldAlert size={10}/> Tx Hash Terekam</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Change Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111214]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2B2D31] border border-[#383A40] max-w-lg w-full rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Modal bg glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${walletChangeStep === 'success' ? 'bg-[#80FF56]/10' : 'bg-[#7F56FF]/10'}`}></div>
            
            <button onClick={() => { setShowWalletModal(false); setWalletChangeStep('idle'); }} className="absolute top-5 right-5 p-2 text-grey-muted hover:text-off-white hover:bg-[#383A40] rounded-xl transition-colors z-20">
              <X size={20} />
            </button>

            <div className="relative z-10">
              {walletChangeStep === 'idle' && (
                <div className="animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-[#7F56FF]/20 text-[#7F56FF] flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(127,86,255,0.3)]">
                    <RefreshCw size={32} />
                  </div>
                  <h3 className="font-title font-bold text-2xl text-off-white text-center mb-2">Ganti Dompet</h3>
                  <p className="text-sm text-grey-muted text-center mb-8">Pilih metode untuk menghubungkan dompet baru ke akun STUMA Anda.</p>

                  {/* Current wallet info */}
                  <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-4 mb-6">
                    <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-2">Dompet Saat Ini</span>
                    <p className="font-mono text-xs text-off-white break-all">{user.walletAddress}</p>
                  </div>

                  {/* Method 1: MetaMask */}
                  <button 
                    onClick={handleMetaMaskWalletChange}
                    className="w-full bg-[#111214] border border-[#383A40] hover:border-orange-500/50 text-white py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 group mb-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet size={16} className="text-orange-400" />
                    </div>
                    Hubungkan MetaMask
                    <ExternalLink size={14} className="text-grey-muted ml-auto" />
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <span className="absolute bg-[#2B2D31] px-4 text-[10px] uppercase tracking-widest text-grey-muted font-bold z-10">Atau Input Manual</span>
                    <div className="w-full h-px bg-[#383A40]"></div>
                  </div>

                  {/* Method 2: Manual entry */}
                  <div className="mb-6">
                    <label className="text-[11px] text-grey-muted font-bold uppercase tracking-widest mb-2 block">Alamat Dompet Baru (EVM)</label>
                    <input 
                      type="text" 
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#111214] border border-[#383A40] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#7F56FF] focus:ring-1 focus:ring-[#7F56FF] text-white placeholder:text-[#383A40] transition-all font-mono"
                    />
                    <p className="text-[10px] text-grey-muted mt-2">Masukkan alamat dompet EVM (Ethereum/Polygon/Arbitrum) yang valid.</p>
                  </div>

                  <button 
                    onClick={handleManualWalletChange}
                    disabled={!newWalletAddress}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${newWalletAddress ? 'bg-[#7F56FF] hover:bg-[#6c42f0] text-white shadow-[0_0_20px_rgba(127,86,255,0.3)] hover:scale-[1.02]' : 'bg-[#383A40] text-grey-muted cursor-not-allowed'}`}
                  >
                    <RefreshCw size={18} /> Lanjutkan Ganti Dompet
                  </button>
                </div>
              )}

              {walletChangeStep === 'confirming' && (
                <div className="animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="font-title font-bold text-2xl text-off-white text-center mb-2">Konfirmasi Pergantian</h3>
                  <p className="text-sm text-grey-muted text-center mb-8">Pastikan alamat dompet baru benar. Aksi ini tidak dapat dibatalkan.</p>

                  <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-5 mb-6 space-y-4">
                    <div>
                      <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-1">Dompet Lama</span>
                      <p className="font-mono text-xs text-red-400 break-all line-through opacity-60">{user.walletAddress}</p>
                    </div>
                    <div className="w-full h-px bg-[#383A40]"></div>
                    <div>
                      <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-1">Dompet Baru</span>
                      <p className="font-mono text-xs text-[#80FF56] break-all">{newWalletAddress}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setWalletChangeStep('idle')}
                      className="flex-1 bg-[#111214] border border-[#383A40] hover:border-[#7F56FF] text-off-white py-3.5 rounded-xl text-sm font-bold transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={() => confirmWalletChange(newWalletAddress, 'Input Manual')}
                      className="flex-1 bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(127,86,255,0.3)] hover:scale-[1.02]"
                    >
                      Ya, Ganti Sekarang
                    </button>
                  </div>
                </div>
              )}

              {walletChangeStep === 'connecting' && (
                <div className="py-8 flex flex-col items-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin mb-6 shadow-[0_0_15px_rgba(255,165,0,0.3)]"></div>
                  <h3 className="font-title font-bold text-2xl text-off-white mb-2">Menghubungkan MetaMask</h3>
                  <p className="text-sm text-grey-muted">Silakan konfirmasi koneksi di ekstensi MetaMask Anda...</p>
                </div>
              )}

              {walletChangeStep === 'success' && (
                <div className="py-6 flex flex-col items-center animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-[#80FF56]/20 text-[#80FF56] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(128,255,86,0.3)]">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="font-title font-bold text-2xl text-[#80FF56] mb-2">Dompet Berhasil Diganti!</h3>
                  <p className="text-sm text-grey-muted mb-6">Alamat dompet baru telah terhubung ke akun Anda.</p>
                  <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-4 w-full">
                    <span className="text-[10px] text-grey-muted font-bold uppercase tracking-wider block mb-2">Dompet Baru Aktif</span>
                    <p className="font-mono text-xs text-[#80FF56] break-all">{user.walletAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutStep !== 'idle' && checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111214]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2B2D31] border border-[#383A40] max-w-md w-full rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Modal bg glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${checkoutStep === 'success' ? 'bg-[#80FF56]/10' : checkoutStep === 'anomaly' ? 'bg-red-500/10' : 'bg-[#7F56FF]/10'}`}></div>

            {(checkoutStep === 'success' || checkoutStep === 'anomaly') && <button onClick={() => setCheckoutStep('idle')} className="absolute top-5 right-5 p-2 text-grey-muted hover:text-off-white hover:bg-[#383A40] rounded-xl transition-colors z-20"><X size={20}/></button>}
            
            <div className="flex flex-col items-center text-center relative z-10">
              {checkoutStep === 'converting' && (<div className="py-8 flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-[#7F56FF]/20 border-t-[#7F56FF] animate-spin mb-6 shadow-[0_0_15px_rgba(127,86,255,0.3)]"/><h3 className="font-title font-bold text-2xl text-off-white mb-2">Sinkronisasi Oracle</h3><p className="text-sm text-grey-muted">Mengambil data konversi Rupiah ke USDT real-time...</p></div>)}
              
              {checkoutStep === 'gas_estimating' && (<div className="py-8 flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-[#7F56FF]/20 border-t-[#7F56FF] animate-spin mb-6 shadow-[0_0_15px_rgba(127,86,255,0.3)]"/><h3 className="font-title font-bold text-2xl text-off-white mb-2">Kalkulasi Gas Fee</h3><p className="text-sm text-grey-muted mb-6">Menghubungi RPC node {selectedNetwork}...</p><div className="bg-[#111214] border border-[#383A40] py-2 px-5 rounded-xl text-sm font-mono font-bold text-[#80FF56]">Gas: {Number(checkoutOrder.gas_fee_estimated || 0.005).toFixed(6)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</div></div>)}
              
              {checkoutStep === 'signing' && (<div className="py-4 w-full"><div className="w-16 h-16 rounded-2xl bg-[#7F56FF]/20 text-[#7F56FF] flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(127,86,255,0.3)]"><Wallet size={32}/></div><h3 className="font-title font-bold text-2xl text-off-white mb-2">Konfirmasi Web3</h3><p className="text-sm text-grey-muted mb-8">Mohon tandatangani transaksi di dompet kripto Anda.</p>
                <div className="bg-[#111214] border border-[#383A40] rounded-2xl p-5 mb-6 text-left text-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center"><span className="text-grey-muted font-medium">Order ID</span><span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span></div>
                  <div className="flex justify-between items-center"><span className="text-grey-muted font-medium">Total Dibayar</span><span className="font-extrabold text-[#80FF56] font-mono text-lg">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span></div>
                  <div className="flex justify-between items-center border-t border-[#383A40] pt-4"><span className="text-grey-muted font-medium">Jaringan</span><span className="font-bold text-[#7F56FF] uppercase tracking-wider">{checkoutOrder.blockchain_network}</span></div>
                </div>
                <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-xl mb-8 text-left flex items-start gap-3"><input type="checkbox" id="anomaly_check" checked={simulateAnomaly} onChange={e => setSimulateAnomaly(e.target.checked)} className="mt-1 accent-red-500 w-4 h-4"/><label htmlFor="anomaly_check" className="text-xs text-grey-muted leading-relaxed cursor-pointer"><strong className="text-red-400 block mb-1">Mode Pengujian QA (Anomali)</strong>Aktifkan untuk mensimulasikan pengiriman USDT yang lebih sedikit dari total tagihan.</label></div>
                <button onClick={completePayment} className="w-full bg-[#7F56FF] hover:bg-[#6c42f0] text-white py-4 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(127,86,255,0.4)] transition-all hover:scale-[1.02]">Tanda Tangani Transaksi</button>
              </div>)}
              
              {checkoutStep === 'webhook' && (<div className="py-8 flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-[#80FF56]/20 border-t-[#80FF56] animate-spin mb-6 shadow-[0_0_15px_rgba(128,255,86,0.3)]"/><h3 className="font-title font-bold text-2xl text-off-white mb-2">Verifikasi Block</h3><p className="text-sm text-grey-muted mb-6">Menunggu konfirmasi dari jaringan blockchain...</p><div className="bg-[#111214] border border-[#383A40] py-2.5 px-4 rounded-xl w-full"><p className="text-[10px] text-grey-muted font-mono truncate">Tx: {txHash}</p></div></div>)}
              
              {checkoutStep === 'success' && (<div className="py-6 w-full"><div className="w-20 h-20 rounded-full bg-[#80FF56]/20 text-[#80FF56] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(128,255,86,0.3)]"><CheckCircle size={40}/></div><h3 className="font-title font-bold text-2xl text-[#80FF56] mb-2">Pembayaran Lunas!</h3><p className="text-sm text-grey-muted mb-8">Transaksi USDT Anda berhasil divalidasi oleh Smart Contract.</p><div className="bg-[#111214] border border-[#383A40] rounded-2xl p-5 mb-8 text-left text-sm flex flex-col gap-3"><div className="flex justify-between"><span className="text-grey-muted font-medium">Order ID</span><span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span></div><div className="flex justify-between"><span className="text-grey-muted font-medium">Jumlah Lunas</span><span className="font-bold text-[#80FF56] font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span></div></div><button onClick={() => setCheckoutStep('idle')} className="w-full bg-[#383A40] hover:bg-white hover:text-[#111214] text-off-white py-3.5 rounded-xl text-sm font-bold transition-all">Selesai & Kembali</button></div>)}
              
              {checkoutStep === 'anomaly' && (<div className="py-6 w-full"><div className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]"><ShieldAlert size={40}/></div><h3 className="font-title font-bold text-2xl text-red-500 mb-2">Transaksi Ditangguhkan</h3><p className="text-sm text-grey-muted mb-8">Sistem mendeteksi ketidaksesuaian jumlah transfer USDT. Pesanan memerlukan investigasi manual.</p><button onClick={() => setCheckoutStep('idle')} className="w-full bg-[#111214] border border-[#383A40] hover:border-red-500 text-off-white py-3.5 rounded-xl text-sm font-bold transition-all">Tutup Peringatan</button></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
