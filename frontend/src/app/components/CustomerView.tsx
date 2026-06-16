'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ShoppingBag, CheckCircle, Trash2, X, RefreshCw, Database, Info, ShieldAlert, History, Package, LogOut } from 'lucide-react';
import { UserSession } from '../../utils/types';
import { getProducts, createOrder, triggerBlockchainWebhook, Product, Order, AnomalyLog } from '../../utils/api';

interface Props { user: UserSession; onLogout: () => void; }

export default function CustomerView({ user, onLogout }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'shop'|'orders'>('shop');
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
    if (typeof window !== 'undefined') { const s = localStorage.getItem('stuma_customer_orders'); return s ? JSON.parse(s) : []; }
    return [];
  });

  const refreshProducts = useCallback(async () => { setProducts(await getProducts()); }, []);
  useEffect(() => { refreshProducts(); }, [refreshProducts]);
  useEffect(() => { if (myOrders.length > 0) localStorage.setItem('stuma_customer_orders', JSON.stringify(myOrders)); }, [myOrders]);

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
    <div className="flex flex-col min-h-screen bg-charcoal text-off-white font-sans">
      {/* Top bar */}
      <header className="bg-charcoal-dark border-b border-border-color sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-neon-purple to-purple-800 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-neon-purple/20">S</div>
            <div>
              <h1 className="font-title text-lg font-bold text-off-white flex items-center gap-1.5">STUMA <span className="text-[9px] uppercase bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-1.5 py-0.5 rounded font-mono">Pelanggan</span></h1>
              <p className="text-[9px] text-grey-muted">Belanja Produk UMKM dengan USDT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Wallet info */}
            <div className="hidden md:flex items-center gap-3 bg-charcoal border border-border-color py-1.5 px-3 rounded-xl text-xs">
              <span className="text-grey-muted">Saldo:</span>
              <span className="text-lime-green font-bold font-mono">{walletUsdtBalance.toFixed(2)} USDT</span>
              <span className="text-grey-muted">|</span>
              <span className="text-neon-purple font-bold font-mono">{walletNativeBalance.toFixed(2)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</span>
            </div>
            <select value={selectedNetwork} onChange={e => setSelectedNetwork(e.target.value as 'polygon'|'arbitrum')} className="bg-charcoal text-off-white border border-border-color text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neon-purple font-semibold cursor-pointer">
              <option value="polygon">Polygon (POL)</option>
              <option value="arbitrum">Arbitrum (ETH)</option>
            </select>
            <div className="flex items-center gap-2 bg-charcoal border border-border-color py-1.5 px-3 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-neon-purple/15 text-neon-purple flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
              <div className="hidden sm:block"><p className="text-xs font-semibold text-off-white">{user.name}</p><p className="text-[9px] text-grey-muted font-mono">{user.walletAddress.substring(0,6)}...{user.walletAddress.substring(38)}</p></div>
            </div>
            <button onClick={onLogout} className="p-2 text-grey-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Keluar"><LogOut size={16} /></button>
          </div>
        </div>
        {/* Sub nav */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3 flex gap-1">
          {[{ id: 'shop' as const, label: 'Katalog Belanja', icon: <ShoppingBag size={15}/> }, { id: 'orders' as const, label: 'Pesanan Saya', icon: <History size={15}/> }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-neon-purple text-white shadow-md shadow-neon-purple/20' : 'text-grey-muted hover:text-off-white hover:bg-charcoal-light/50'}`}>
              {t.icon}<span>{t.label}</span>
              {t.id === 'orders' && myOrders.length > 0 && <span className="bg-neon-purple/30 text-neon-purple text-[9px] font-bold px-1.5 py-0.5 rounded-full">{myOrders.length}</span>}
            </button>
          ))}
        </div>
      </header>

      <main className="grow max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Products */}
            <div className="lg:col-span-8">
              <h2 className="font-title text-2xl font-bold text-off-white mb-1">Katalog Unggulan UMKM</h2>
              <p className="text-sm text-grey-muted mb-6">Dukung bisnis lokal dengan transaksi kripto berbiaya murah.</p>
              {products.length === 0 ? (
                <div className="flex flex-col items-center py-16 bg-charcoal-light rounded-2xl border border-dashed border-border-color">
                  <Database size={40} className="text-grey-muted mb-3 animate-pulse" />
                  <p className="text-grey-muted text-sm">Mengunduh data katalog...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(p => (
                    <div key={p.id} className="bg-charcoal-light border border-border-color rounded-2xl overflow-hidden hover:border-neon-purple/50 hover:shadow-xl hover:shadow-neon-purple/5 transition-all duration-300 flex flex-col group">
                      <div className="h-44 relative bg-charcoal-dark overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.stock <= 5 && <span className="absolute top-3 right-3 bg-red-500/95 text-white text-[10px] font-bold uppercase py-1 px-2 rounded-md">Stok: {p.stock}</span>}
                      </div>
                      <div className="p-4 flex flex-col grow">
                        <h3 className="font-title font-semibold text-off-white group-hover:text-neon-purple transition-colors line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-grey-muted mt-1.5 mb-4 line-clamp-2 min-h-[32px]">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border-color/50">
                          <div><span className="text-[10px] text-grey-muted block uppercase tracking-wider">Harga</span><span className="text-base font-bold text-off-white font-title">Rp {p.price_idr.toLocaleString('id-ID')}</span></div>
                          <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${p.stock <= 0 ? 'bg-border-color text-grey-muted cursor-not-allowed' : 'bg-neon-purple text-white hover:bg-neon-purple-hover shadow-lg shadow-neon-purple/10'}`}>+ Keranjang</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Payment config */}
              <div className="bg-charcoal-light border border-border-color rounded-2xl p-5">
                <h3 className="font-title font-bold text-sm uppercase tracking-wider text-grey-muted mb-4 flex items-center gap-2"><Wallet size={16} className="text-neon-purple"/>Metode Pembayaran</h3>
                <div className="grid grid-cols-2 gap-2 bg-charcoal-dark border border-border-color p-1 rounded-xl">
                  {(['custody','direct'] as const).map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`py-2 px-3 rounded-lg text-xs font-semibold flex flex-col items-center transition-all ${paymentMethod === m ? 'bg-neon-purple text-white shadow-md' : 'text-grey-muted hover:text-off-white'}`}>
                      <span>{m === 'custody' ? 'USDT Custody' : 'Direct Transfer'}</span>
                      <span className="text-[9px] font-normal opacity-80">{m === 'custody' ? '(Hemat Gas)' : '(Langsung)'}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-grey-muted mt-2 leading-relaxed flex items-start gap-1"><Info size={12} className="shrink-0 text-neon-purple mt-0.5"/><span>{paymentMethod === 'custody' ? 'Dana ditahan di Smart Contract. Penjual withdraw batch untuk hemat gas.' : 'USDT langsung ke wallet merchant.'}</span></p>
              </div>

              {/* Cart */}
              <div className="bg-charcoal-light border border-border-color rounded-2xl p-5">
                <h3 className="font-title font-bold text-base text-off-white mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-neon-purple"/>Keranjang ({cart.length})</h3>
                {cart.length === 0 ? (
                  <div className="py-8 text-center"><ShoppingBag size={32} className="text-border-color mx-auto mb-2"/><p className="text-sm text-grey-muted">Keranjang kosong.</p></div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="max-h-52 overflow-y-auto pr-1 flex flex-col gap-2.5">
                      {cart.map(i => (
                        <div key={i.product.id} className="flex items-center justify-between gap-3 bg-charcoal-dark border border-border-color/50 p-3 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={i.product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-charcoal"/>
                            <div className="min-w-0"><h4 className="text-xs font-bold text-off-white truncate">{i.product.name}</h4><p className="text-[10px] text-grey-muted">{i.quantity} x Rp {i.product.price_idr.toLocaleString('id-ID')}</p></div>
                          </div>
                          <button onClick={() => removeFromCart(i.product.id)} className="p-1.5 text-red-400/75 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border-color pt-4 flex flex-col gap-2">
                      <div className="flex justify-between text-sm"><span className="text-grey-muted">Subtotal</span><span className="font-bold text-off-white">Rp {getCartTotal().toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between text-sm py-1 bg-charcoal-dark/50 border border-border-color/30 rounded-lg px-2.5"><span className="text-grey-muted text-xs">Konversi USDT</span><span className="font-bold text-lime-green font-mono">~ {(getCartTotal() / 16400).toFixed(2)} USDT</span></div>
                    </div>
                    <button onClick={startCheckout} className="w-full bg-neon-purple text-white py-3 rounded-xl font-semibold text-sm hover:bg-neon-purple-hover transition-colors shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2"><Wallet size={16}/>Checkout dengan USDT</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* My Orders Tab */
          <div>
            <h2 className="font-title text-2xl font-bold text-off-white mb-1">Pesanan Saya</h2>
            <p className="text-sm text-grey-muted mb-6">Riwayat transaksi USDT Anda.</p>
            {myOrders.length === 0 ? (
              <div className="py-16 text-center bg-charcoal-light rounded-2xl border border-dashed border-border-color"><Package size={40} className="text-grey-muted mx-auto mb-3"/><p className="text-grey-muted text-sm">Belum ada pesanan.</p></div>
            ) : (
              <div className="grid gap-4">
                {myOrders.map(o => (
                  <div key={o.id} className="bg-charcoal-light border border-border-color rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono font-bold text-sm text-off-white">{o.id}</span>
                        <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border ${o.status === 'paid' ? 'bg-lime-green/10 text-lime-green border-lime-green/20' : o.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                          {o.status === 'paid' ? 'Lunas' : o.status === 'anomaly' ? 'Anomali' : 'Pending'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${o.blockchain_network === 'polygon' ? 'text-purple-400' : 'text-blue-400'}`}>{o.blockchain_network}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-grey-muted">
                        <span>Rp {o.total_price_idr.toLocaleString('id-ID')}</span>
                        <span className="text-lime-green font-mono">{Number(o.total_price_usdt).toFixed(2)} USDT</span>
                        <span>{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    {o.transaction_hash && <p className="text-[10px] font-mono text-grey-muted truncate max-w-[200px]">{o.transaction_hash}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-charcoal-dark border-t border-border-color py-6 text-center text-xs text-grey-muted">
        <p>© 2026 STUMA Platform — Dikembangkan untuk kemajuan UMKM Indonesia</p>
      </footer>

      {/* Checkout Modal */}
      {checkoutStep !== 'idle' && checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal border border-border-color max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            {(checkoutStep === 'success' || checkoutStep === 'anomaly') && <button onClick={() => setCheckoutStep('idle')} className="absolute top-4 right-4 p-1 text-grey-muted hover:text-off-white hover:bg-charcoal-light rounded-lg transition-colors"><X size={18}/></button>}
            <div className="flex flex-col items-center text-center">
              {checkoutStep === 'converting' && (<div className="py-6 flex flex-col items-center"><div className="w-12 h-12 rounded-full border-4 border-neon-purple/20 border-t-neon-purple animate-spin mb-4"/><h3 className="font-title font-bold text-lg text-off-white">Menghubungi Oracle</h3><p className="text-xs text-grey-muted mt-2">Mengonversi harga Rupiah ke USDT...</p></div>)}
              {checkoutStep === 'gas_estimating' && (<div className="py-6 flex flex-col items-center"><div className="w-12 h-12 rounded-full border-4 border-neon-purple/20 border-t-neon-purple animate-spin mb-4"/><h3 className="font-title font-bold text-lg text-off-white">Gas Estimation</h3><p className="text-xs text-grey-muted mt-2">Menghitung gas fee {selectedNetwork}...</p><div className="mt-4 bg-charcoal-dark border border-border-color py-1.5 px-3 rounded-lg text-xs font-mono">Gas: {Number(checkoutOrder.gas_fee_estimated || 0.005).toFixed(6)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</div></div>)}
              {checkoutStep === 'signing' && (<div className="py-4 w-full"><div className="w-12 h-12 rounded-xl bg-neon-purple/15 text-neon-purple flex items-center justify-center mx-auto mb-4 animate-bounce"><Wallet size={24}/></div><h3 className="font-title font-bold text-lg text-off-white">Konfirmasi Transaksi</h3><p className="text-xs text-grey-muted mt-2 mx-auto max-w-xs">Otorisasi pembayaran USDT ke smart contract STUMA.</p>
                <div className="bg-charcoal-dark border border-border-color/80 rounded-xl p-4 my-5 text-left text-xs flex flex-col gap-2.5">
                  <div className="flex justify-between"><span className="text-grey-muted">Order ID:</span><span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span></div>
                  <div className="flex justify-between"><span className="text-grey-muted">Total:</span><span className="font-bold text-lime-green font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span></div>
                  <div className="flex justify-between border-t border-border-color/50 pt-2.5"><span className="text-grey-muted">Jaringan:</span><span className="font-bold text-off-white uppercase">{checkoutOrder.blockchain_network}</span></div>
                </div>
                <div className="border border-border-color/60 bg-charcoal-dark p-3 rounded-xl mb-5 text-left flex items-start gap-2.5"><input type="checkbox" id="anomaly_check" checked={simulateAnomaly} onChange={e => setSimulateAnomaly(e.target.checked)} className="mt-1 cursor-pointer accent-neon-purple"/><label htmlFor="anomaly_check" className="text-[11px] text-grey-muted leading-tight cursor-pointer"><strong className="text-yellow-500 block mb-0.5">Simulasi Anomali (QA)</strong>Kirim USDT lebih rendah dari tagihan.</label></div>
                <button onClick={completePayment} className="w-full bg-neon-purple hover:bg-neon-purple-hover text-white py-3 rounded-xl text-xs font-semibold shadow-lg transition-all">Tanda Tangani (Sign)</button>
              </div>)}
              {checkoutStep === 'webhook' && (<div className="py-6 flex flex-col items-center"><div className="w-12 h-12 rounded-full border-4 border-lime-green/20 border-t-lime-green animate-spin mb-4"/><h3 className="font-title font-bold text-lg text-off-white">Verifikasi Webhook</h3><p className="text-xs text-grey-muted mt-2">Menunggu konfirmasi blockchain...</p><p className="text-[10px] text-grey-muted/60 font-mono mt-4 truncate max-w-[320px]">Hash: {txHash}</p></div>)}
              {checkoutStep === 'success' && (<div className="py-4"><div className="w-14 h-14 rounded-full bg-lime-green-light text-lime-green flex items-center justify-center mx-auto mb-4 border border-lime-green/25"><CheckCircle size={28}/></div><h3 className="font-title font-bold text-lg text-lime-green">Transaksi Sukses!</h3><p className="text-xs text-grey-muted mt-2 mx-auto max-w-xs">Pembayaran USDT Anda telah diverifikasi.</p><div className="bg-charcoal-dark border border-border-color/80 rounded-xl p-4 my-5 text-left text-xs flex flex-col gap-2"><div className="flex justify-between"><span className="text-grey-muted">ID:</span><span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span></div><div className="flex justify-between"><span className="text-grey-muted">USDT:</span><span className="font-bold text-lime-green font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)}</span></div></div><button onClick={() => setCheckoutStep('idle')} className="w-full bg-charcoal-light border border-border-color hover:bg-charcoal text-off-white py-2.5 rounded-xl text-xs font-semibold transition-colors">Kembali Belanja</button></div>)}
              {checkoutStep === 'anomaly' && (<div className="py-4"><div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/25"><ShieldAlert size={28}/></div><h3 className="font-title font-bold text-lg text-red-400">Pembayaran Ditangguhkan!</h3><p className="text-xs text-grey-muted mt-2 mx-auto max-w-xs">Anomali terdeteksi. Pesanan ditangguhkan.</p><button onClick={() => setCheckoutStep('idle')} className="w-full mt-5 bg-charcoal-light border border-border-color text-off-white py-2.5 rounded-xl text-xs font-semibold">Tutup</button></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
