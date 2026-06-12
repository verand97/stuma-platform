'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  CheckCircle, 
  History, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  X, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldAlert,
  Database,
  Info
} from 'lucide-react';
import { 
  getProducts, 
  createOrder, 
  triggerBlockchainWebhook, 
  getDashboardData, 
  requestWithdrawal, 
  resolveAnomaly, 
  checkBackendOnline,
  DashboardData,
  Product, 
  Order, 
  AnomalyLog, 
  Withdrawal 
} from '../utils/api';

export default function StumaApp() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'shop' | 'dashboard'>('shop');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Web3 Wallet Simulation State
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon' | 'arbitrum'>('polygon');
  const [paymentMethod, setPaymentMethod] = useState<'custody' | 'direct'>('custody');
  const [walletUsdtBalance, setWalletUsdtBalance] = useState<number>(50.00); // Starter USDT
  const [walletNativeBalance, setWalletNativeBalance] = useState<number>(1.5); // POL or ETH

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Local Storage Logs for Mock Offline Mode
  const [localOrders, setLocalOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stuma_orders');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [localAnomalies, setLocalAnomalies] = useState<AnomalyLog[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stuma_anomalies');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [localWithdrawals, setLocalWithdrawals] = useState<Withdrawal[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stuma_withdrawals');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Checkout Flow State
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'converting' | 'gas_estimating' | 'signing' | 'webhook' | 'success' | 'anomaly'>('idle');
  const [simulateAnomaly, setSimulateAnomaly] = useState<boolean>(false);
  const [, setUsdtRate] = useState<number>(16400);
  const [txHash, setTxHash] = useState<string>('');

  // Dashboard Form State (Create Product)
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Main Data Refresh function
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    const online = await checkBackendOnline();
    setBackendOnline(online);

    // Get products
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);

    // Get dashboard metrics
    const data = await getDashboardData(localOrders, localAnomalies, localWithdrawals);
    setDashboardData(data);

    setIsRefreshing(false);
  }, [localOrders, localAnomalies, localWithdrawals]);

  // Load Initial Data (deferred to avoid React compiler cascading render warning)
  useEffect(() => {
    const id = setTimeout(refreshData, 0);
    return () => clearTimeout(id);
  }, [refreshData]);

  // Sync state updates with localStorage for offline mock
  useEffect(() => {
    if (localOrders.length > 0) localStorage.setItem('stuma_orders', JSON.stringify(localOrders));
  }, [localOrders]);

  useEffect(() => {
    if (localAnomalies.length > 0) localStorage.setItem('stuma_anomalies', JSON.stringify(localAnomalies));
  }, [localAnomalies]);

  useEffect(() => {
    if (localWithdrawals.length > 0) localStorage.setItem('stuma_withdrawals', JSON.stringify(localWithdrawals));
  }, [localWithdrawals]);

  // Connect Simulated Wallet
  const connectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress('');
    } else {
      setWalletConnected(true);
      // Generate a realistic Ethereum/L2 public address
      setWalletAddress('0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    }
  };

  // Cart Management
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price_idr * item.quantity, 0);
  };

  // Checkout Initiation
  const startCheckout = async () => {
    if (!walletConnected) {
      alert('Silakan hubungkan dompet Web3 Anda terlebih dahulu!');
      return;
    }
    if (cart.length === 0) return;

    setCheckoutStep('converting');
    
    // Step 1: Conversion (Rupiah -> USDT)
    const items = cart.map(item => ({ product_id: item.product.id, quantity: item.quantity }));
    
    try {
      const response = await createOrder({
        items,
        blockchain_network: selectedNetwork,
        payment_method: paymentMethod,
        customer_address: walletAddress,
      });

      setCheckoutOrder(response.order);
      setUsdtRate(response.usdt_rate);

      // Add to local orders if offline
      if (!backendOnline) {
        setLocalOrders(prev => [response.order, ...prev]);
      }

      // Step 2: L2 Gas Estimation Delay
      setTimeout(() => {
        setCheckoutStep('gas_estimating');
        
        // Step 3: Prompt signature
        setTimeout(() => {
          setCheckoutStep('signing');
        }, 1500);
      }, 1500);

    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat pesanan');
      setCheckoutStep('idle');
    }
  };

  // Complete Payment Signature & Webhook Verification
  const completePayment = async () => {
    if (!checkoutOrder) return;

    setCheckoutStep('webhook');
    const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTxHash(mockHash);

    // Determine amount to send (inject anomaly if simulated)
    const expectedAmount = checkoutOrder.total_price_usdt;
    const actualAmount = simulateAnomaly 
      ? parseFloat((expectedAmount - 1.5).toFixed(6)) // Send 1.5 USDT less
      : expectedAmount;

    // Deduct wallet balance (local simulation)
    setWalletUsdtBalance(prev => Math.max(0, parseFloat((prev - actualAmount).toFixed(6))));
    if (selectedNetwork === 'polygon') {
      setWalletNativeBalance(prev => Math.max(0, parseFloat((prev - (checkoutOrder.gas_fee_estimated || 0.005)).toFixed(6))));
    } else {
      setWalletNativeBalance(prev => Math.max(0, parseFloat((prev - (checkoutOrder.gas_fee_estimated || 0.015)).toFixed(6))));
    }

    try {
      if (backendOnline) {
        // Send webhook to Laravel backend
        const response = await triggerBlockchainWebhook({
          tx_hash: mockHash,
          order_id: checkoutOrder.id,
          amount_usdt: actualAmount
        });

        if (response.status === 'anomaly') {
          setCheckoutStep('anomaly');
        } else {
          setCheckoutStep('success');
          setCart([]);
        }
        refreshData();
      } else {
        // Mock offline verification
        setTimeout(() => {
          if (simulateAnomaly) {
            // Log anomaly locally
            const newAnomaly: AnomalyLog = {
              id: Date.now(),
              order_id: checkoutOrder.id,
              expected_amount_usdt: expectedAmount,
              actual_amount_usdt: actualAmount,
              transaction_hash: mockHash,
              status: 'flagged',
              notes: 'Simulated anomaly: amount mismatch.',
              created_at: new Date().toISOString()
            };
            setLocalAnomalies(prev => [newAnomaly, ...prev]);

            // Update order status
            setLocalOrders(prev => prev.map(o => o.id === checkoutOrder.id ? { ...o, status: 'anomaly', transaction_hash: mockHash } : o));
            setCheckoutStep('anomaly');
          } else {
            // Update order status to paid
            setLocalOrders(prev => prev.map(o => o.id === checkoutOrder.id ? { ...o, status: 'paid', transaction_hash: mockHash } : o));
            setCheckoutStep('success');
            setCart([]);
          }
          refreshData();
        }, 2000);
      }
    } catch {
      alert('Gagal mengirimkan webhook verifikasi ke backend');
      setCheckoutStep('idle');
    }
  };

  // Add Product (Merchant CRUD)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock) {
      alert('Mohon isi field produk dengan benar');
      return;
    }

    const payload = {
      name: newProductName,
      description: newProductDesc,
      price_idr: parseFloat(newProductPrice),
      stock: parseInt(newProductStock),
      image_url: newProductImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
    };

    try {
      if (backendOnline) {
        const res = await fetch('http://localhost:8000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setShowAddProduct(false);
          setNewProductName('');
          setNewProductDesc('');
          setNewProductPrice('');
          setNewProductStock('');
          setNewProductImage('');
          refreshData();
        } else {
          alert('Gagal menyimpan produk ke backend');
        }
      } else {
        alert('Fitur tambah produk memerlukan koneksi Backend Laravel aktif.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
  };

  // Process Batch Withdrawal
  const handleWithdraw = async () => {
    if (!walletConnected) {
      alert('Hubungkan dompet untuk menerima penarikan dana');
      return;
    }

    try {
      if (backendOnline) {
        const res = await requestWithdrawal(walletAddress);
        alert(res.message);
        refreshData();
      } else {
        // Offline Mock
        const pendingPaid = localOrders.filter(o => o.status === 'paid' && o.payment_method === 'custody');
        if (pendingPaid.length === 0) {
          alert('Tidak ada dana USDT yang tersedia untuk ditarik');
          return;
        }

        const totalAmount = pendingPaid.reduce((sum, o) => sum + o.total_price_usdt, 0);
        const gasSaved = (pendingPaid.length - 1) * 0.01;

        const newWithdrawal: Withdrawal = {
          id: Date.now(),
          merchant_address: walletAddress,
          amount_usdt: totalAmount,
          gas_saved_usdt: gasSaved > 0 ? gasSaved : 0.00,
          status: 'completed',
          transaction_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          created_at: new Date().toISOString()
        };

        setLocalWithdrawals(prev => [newWithdrawal, ...prev]);
        setLocalOrders(prev => prev.map(o => o.status === 'paid' && o.payment_method === 'custody' ? { ...o, status: 'withdrawn' } : o));
        
        // Add to wallet balance
        setWalletUsdtBalance(prev => parseFloat((prev + totalAmount).toFixed(6)));
        alert('Mock Withdrawal Sukses: ' + totalAmount.toFixed(2) + ' USDT masuk ke dompet Anda!');
        
        setTimeout(() => refreshData(), 500);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal melakukan penarikan');
    }
  };

  // Resolve Anomaly
  const handleResolveAnomaly = async (orderId: string, action: 'approve' | 'refund') => {
    try {
      if (backendOnline) {
        const res = await resolveAnomaly(orderId, action);
        alert(res.message);
        refreshData();
      } else {
        // Offline Mock
        setLocalAnomalies(prev => prev.filter(a => a.order_id !== orderId));
        setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: action === 'approve' ? 'paid' : 'refunded' } : o));
        alert(`Status anomali diselesaikan dengan tindakan: ${action === 'approve' ? 'APPROVE (Lunas)' : 'REFUND (Batal)'}`);
        setTimeout(() => refreshData(), 500);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyelesaikan anomali');
    }
  };

  // Reset Client Simulator
  const clearLocalStorage = () => {
    localStorage.removeItem('stuma_orders');
    localStorage.removeItem('stuma_anomalies');
    localStorage.removeItem('stuma_withdrawals');
    setLocalOrders([]);
    setLocalAnomalies([]);
    setLocalWithdrawals([]);
    alert('Data simulator berhasil di-reset!');
    setTimeout(() => refreshData(), 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal text-off-white font-sans selection:bg-neon-purple selection:text-white">
      {/* Top Banner Status */}
      <div className="bg-charcoal-dark border-b border-border-color py-2.5 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-lime-green animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
            <span className="font-semibold text-xs md:text-sm">
              Laravel Backend: <span className={backendOnline ? 'text-lime-green' : 'text-yellow-500'}>{backendOnline ? 'ONLINE (Koneksi Penuh)' : 'OFFLINE (Simulator Mode)'}</span>
            </span>
          </div>

          {/* Web3 Wallet Simulator Control */}
          <div className="flex flex-wrap items-center gap-3">
            {walletConnected && (
              <div className="hidden lg:flex items-center gap-4 bg-charcoal border border-border-color py-1 px-3 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 text-grey-muted">
                  <span>Dompet:</span>
                  <span className="font-mono text-off-white font-medium">{walletAddress.substring(0, 6)}...{walletAddress.substring(36)}</span>
                </div>
                <div className="w-px h-3 bg-border-color"></div>
                <div className="flex items-center gap-1">
                  <span className="text-grey-muted">Saldo:</span>
                  <span className="text-lime-green font-bold">{walletUsdtBalance.toFixed(2)} USDT</span>
                  <span className="text-grey-muted">|</span>
                  <span className="text-neon-purple font-bold">{walletNativeBalance.toFixed(2)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</span>
                </div>
              </div>
            )}

            <button 
              onClick={connectWallet}
              className={`flex items-center gap-2 py-1 px-3.5 rounded-lg border text-xs font-semibold transition-all duration-300 ${
                walletConnected 
                  ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                  : 'border-neon-purple bg-neon-purple/15 text-neon-purple hover:bg-neon-purple hover:text-white'
              }`}
            >
              <Wallet size={14} className="outline-1.5" />
              {walletConnected ? 'Disconnect Wallet' : 'Connect Web3 Wallet'}
            </button>

            {walletConnected && (
              <select 
                value={selectedNetwork} 
                onChange={(e) => setSelectedNetwork(e.target.value as 'polygon' | 'arbitrum')}
                className="bg-charcoal text-off-white border border-border-color text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-neon-purple font-semibold cursor-pointer"
              >
                <option value="polygon">Polygon (POL)</option>
                <option value="arbitrum">Arbitrum (ETH)</option>
              </select>
            )}

            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-1 text-grey-muted hover:text-off-white hover:bg-charcoal-light rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-neon-purple' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <header className="bg-charcoal-light/30 backdrop-blur-md border-b border-border-color sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-neon-purple to-purple-800 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-neon-purple/20">
              S
            </div>
            <div>
              <h1 className="font-title text-xl font-bold tracking-tight text-off-white flex items-center gap-1.5">
                STUMA
                <span className="text-[10px] uppercase bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-1.5 py-0.5 rounded font-mono">
                  L2 Payment Gateway
                </span>
              </h1>
              <p className="text-[10px] text-grey-muted">Stablecoin Trade for UMKM Advancement</p>
            </div>
          </div>

          <nav className="flex bg-charcoal-dark border border-border-color p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'shop'
                  ? 'bg-neon-purple text-white shadow-md shadow-neon-purple/20'
                  : 'text-grey-muted hover:text-off-white hover:bg-charcoal/50'
              }`}
            >
              <ShoppingBag size={16} />
              <span>Katalog UMKM</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-neon-purple text-white shadow-md shadow-neon-purple/20'
                  : 'text-grey-muted hover:text-off-white hover:bg-charcoal/50'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dasbor UMKM</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="grow max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        {activeTab === 'shop' ? (
          // ================= STOREFRONT / SHOP PORTAL =================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Products Catalog */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-title text-2xl font-bold text-off-white">Katalog Unggulan UMKM</h2>
                  <p className="text-sm text-grey-muted">Dukung bisnis lokal dengan transaksi kripto berbiaya murah.</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-charcoal-light rounded-2xl border border-dashed border-border-color">
                  <Database size={40} className="text-grey-muted mb-3 animate-pulse" />
                  <p className="text-grey-muted font-medium text-sm">Mengunduh data katalog...</p>
                  <p className="text-xs text-grey-muted/60 mt-1">Harap refresh halaman atau pastikan Laravel berjalan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-charcoal-light border border-border-color rounded-2xl overflow-hidden hover:border-neon-purple/50 hover:shadow-xl hover:shadow-neon-purple/5 transition-all duration-300 flex flex-col group">
                      <div className="h-44 relative bg-charcoal-dark overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock <= 5 && (
                          <span className="absolute top-3 right-3 bg-red-500/95 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md">
                            Stok Terbatas: {product.stock}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col grow">
                        <h3 className="font-title font-semibold text-off-white group-hover:text-neon-purple transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-grey-muted mt-2 mb-4 line-clamp-2 min-h-[32px]">
                          {product.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border-color/50">
                          <div>
                            <span className="text-[10px] text-grey-muted block uppercase tracking-wider">Harga Fiat</span>
                            <span className="text-base font-bold text-off-white font-title">
                              Rp {product.price_idr.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-300 ${
                              product.stock <= 0 
                                ? 'bg-border-color text-grey-muted cursor-not-allowed'
                                : 'bg-neon-purple text-white hover:bg-neon-purple-hover shadow-lg shadow-neon-purple/10 hover:shadow-neon-purple/20'
                            }`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Cart & Web3 Settlement Config */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Payment Settlement Method Settings */}
              <div className="bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg">
                <h3 className="font-title font-bold text-sm uppercase tracking-wider text-grey-muted mb-4 flex items-center gap-2">
                  <Wallet size={16} className="text-neon-purple" />
                  Konfigurasi Smart Contract
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-grey-muted block mb-1.5 font-medium">Metode Penampungan Dana Merchant</label>
                    <div className="grid grid-cols-2 gap-2 bg-charcoal-dark border border-border-color p-1 rounded-xl">
                      <button
                        onClick={() => setPaymentMethod('custody')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'custody'
                            ? 'bg-neon-purple text-white shadow-md'
                            : 'text-grey-muted hover:text-off-white'
                        }`}
                      >
                        <span>USDT Custody</span>
                        <span className="text-[9px] font-normal opacity-80">(Batching / Hemat Gas)</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('direct')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'direct'
                            ? 'bg-neon-purple text-white shadow-md'
                            : 'text-grey-muted hover:text-off-white'
                        }`}
                      >
                        <span>Direct Transfer</span>
                        <span className="text-[9px] font-normal opacity-80">(Langsung ke Merchant)</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-grey-muted mt-2 leading-relaxed flex items-start gap-1">
                      <Info size={12} className="shrink-0 text-neon-purple mt-0.5" />
                      <span>
                        {paymentMethod === 'custody' 
                          ? 'Dana ditahan sementara di Smart Contract STUMA. Penjual dapat menarik secara batch untuk hemat 90% gas fee.' 
                          : 'USDT langsung ditransfer ke wallet merchant (Gas fee dibebankan penuh pada setiap transaksi).'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopping Cart Summary */}
              <div className="bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg">
                <h3 className="font-title font-bold text-base text-off-white mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-neon-purple" />
                  Keranjang Belanja
                </h3>

                {cart.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <ShoppingBag size={32} className="text-border-color mb-2" />
                    <p className="text-sm text-grey-muted">Keranjang masih kosong.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-3">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between gap-3 bg-charcoal-dark border border-border-color/50 p-3 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-charcoal" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-off-white truncate">{item.product.name}</h4>
                              <p className="text-[10px] text-grey-muted mt-0.5">
                                {item.quantity} x Rp {item.product.price_idr.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-red-400/75 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border-color pt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-grey-muted">Subtotal (Rupiah)</span>
                        <span className="font-bold text-off-white">Rp {getCartTotal().toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm py-1 bg-charcoal-dark/50 border border-border-color/30 rounded-lg px-2.5">
                        <span className="text-grey-muted text-xs">Konversi USDT</span>
                        <span className="font-bold text-lime-green font-mono">
                          ~ {(getCartTotal() / 16400).toFixed(2)} USDT
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={startCheckout}
                      className="w-full bg-neon-purple text-white py-3 rounded-xl font-semibold text-sm hover:bg-neon-purple-hover transition-colors shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2"
                    >
                      <Wallet size={16} />
                      Checkout dengan USDT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ================= MERCHANT DASHBOARD PORTAL =================
          <div className="flex flex-col gap-8">
            {/* Header Metrics */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-title text-2xl font-bold text-off-white">Merchant Dashboard</h2>
                <p className="text-sm text-grey-muted">Pantau penjualan, kelola anomali pembayaran, dan withdraw saldo stablecoin.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="bg-neon-purple text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-neon-purple-hover transition-all flex items-center gap-1.5 shadow-md shadow-neon-purple/15"
                >
                  <Plus size={14} />
                  <span>Tambah Produk</span>
                </button>

                <button 
                  onClick={clearLocalStorage}
                  className="border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 py-2 px-4 rounded-xl text-xs font-semibold transition-all"
                >
                  Reset Simulator
                </button>
              </div>
            </div>

            {/* Dashboard Analytics Cards */}
            {dashboardData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[10px] text-grey-muted block uppercase tracking-wider font-semibold">Total Pendapatan</span>
                    <span className="text-2xl font-bold text-off-white font-title block mt-1.5">
                      Rp {dashboardData.metrics.total_sales_idr.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-semibold text-lime-green font-mono block mt-1">
                      {Number(dashboardData.metrics.total_sales_usdt).toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-lime-green/10 flex items-center justify-center text-lime-green">
                    <ArrowUpRight size={24} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Gas Fee Dihemat (Batch)</span>
                    <span className="text-2xl font-bold text-lime-green font-mono block mt-1.5">
                      {Number(dashboardData.metrics.total_gas_saved_usdt).toFixed(2)} USDT
                    </span>
                    <p className="text-[10px] text-grey-muted mt-1.5">Dengan model Batch Withdrawal L2</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                    <CheckCircle size={24} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Dana Siap Tarik (Custody)</span>
                    <span className="text-2xl font-bold text-off-white font-mono block mt-1.5">
                      {Number(dashboardData.metrics.available_withdrawal_usdt).toFixed(2)} USDT
                    </span>
                    <button
                      onClick={handleWithdraw}
                      disabled={dashboardData.metrics.available_withdrawal_usdt <= 0}
                      className={`mt-2 py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 ${
                        dashboardData.metrics.available_withdrawal_usdt <= 0
                          ? 'bg-border-color text-grey-muted cursor-not-allowed'
                          : 'bg-lime-green text-charcoal hover:scale-105 shadow-sm'
                      }`}
                    >
                      Withdraw Batch
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-lime-green-light flex items-center justify-center text-lime-green">
                    <Wallet size={24} />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-charcoal-light border border-border-color p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs text-grey-muted block uppercase tracking-wider font-semibold">Rasio Status Pesanan</span>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="text-center">
                        <span className="text-xs font-bold text-off-white">{dashboardData.status_counts.paid + dashboardData.status_counts.withdrawn}</span>
                        <span className="text-[9px] text-grey-muted block">Lunas</span>
                      </div>
                      <div className="w-px h-6 bg-border-color"></div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-yellow-500">{dashboardData.status_counts.pending}</span>
                        <span className="text-[9px] text-grey-muted block">Pending</span>
                      </div>
                      <div className="w-px h-6 bg-border-color"></div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-red-400">{dashboardData.status_counts.anomaly}</span>
                        <span className="text-[9px] text-grey-muted block">Anomali</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-charcoal-dark border border-border-color flex items-center justify-center text-grey-muted">
                    <History size={24} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 bg-charcoal-light rounded-2xl text-center border border-border-color">
                <p className="text-grey-muted text-sm">Menghitung analitik dashboard...</p>
              </div>
            )}

            {/* Anomaly Alerts Section */}
            {dashboardData && dashboardData.recent_anomalies.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/35 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-red-400 mb-4">
                  <ShieldAlert size={20} className="shrink-0" />
                  <h3 className="font-title font-bold text-base">Deteksi Anomali Transaksi (Butuh Verifikasi Manual)</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {dashboardData.recent_anomalies.map((log: AnomalyLog) => (
                    <div key={log.id} className="bg-charcoal-dark border border-red-500/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-red-400">{log.order_id}</span>
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 py-0.5 px-2 rounded-full font-semibold uppercase">Flagged</span>
                        </div>
                        <p className="text-xs text-grey-muted mt-1.5 leading-relaxed">
                          {log.notes}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] font-medium">
                          <span className="text-grey-muted">Tagihan: <strong className="text-off-white font-mono">{Number(log.expected_amount_usdt).toFixed(2)} USDT</strong></span>
                          <span className="text-grey-muted">Dikirim: <strong className="text-red-400 font-mono">{Number(log.actual_amount_usdt).toFixed(2)} USDT</strong></span>
                          <span className="text-grey-muted truncate max-w-[250px]">Hash: <a href="#" className="text-neon-purple hover:underline font-mono">{log.transaction_hash}</a></span>
                        </div>
                      </div>

                      {log.status === 'flagged' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResolveAnomaly(log.order_id, 'approve')}
                            className="bg-lime-green text-charcoal py-1.5 px-3 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                          >
                            Setujui Lunas
                          </button>
                          <button
                            onClick={() => handleResolveAnomaly(log.order_id, 'refund')}
                            className="bg-charcoal border border-border-color text-red-400 hover:bg-red-500/10 py-1.5 px-3 rounded-lg text-xs font-bold"
                          >
                            Batalkan
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Dashboard Panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product Add Forms & Settings */}
              {showAddProduct && (
                <div className="lg:col-span-12 bg-charcoal-light border border-border-color rounded-2xl p-6 shadow-xl relative animate-fadeIn">
                  <button 
                    onClick={() => setShowAddProduct(false)}
                    className="absolute top-4 right-4 p-1.5 text-grey-muted hover:text-off-white hover:bg-charcoal rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <h3 className="font-title font-bold text-lg text-off-white mb-4">Tambah Produk Baru ke Katalog</h3>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs text-grey-muted block mb-1 font-semibold">Nama Produk</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Kopi Bubuk Fine Robusta" 
                        value={newProductName}
                        onChange={e => setNewProductName(e.target.value)}
                        className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-neon-purple"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-1 font-semibold">Harga (IDR)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 75000" 
                        value={newProductPrice}
                        onChange={e => setNewProductPrice(e.target.value)}
                        className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-neon-purple"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-1 font-semibold">Stok Awal</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 20" 
                        value={newProductStock}
                        onChange={e => setNewProductStock(e.target.value)}
                        className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-neon-purple"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-grey-muted block mb-1 font-semibold">Deskripsi Singkat</label>
                      <input 
                        type="text" 
                        placeholder="Deskripsi produk, bahan, ukuran..." 
                        value={newProductDesc}
                        onChange={e => setNewProductDesc(e.target.value)}
                        className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-neon-purple"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-grey-muted block mb-1 font-semibold">URL Gambar Produk (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="https://image-link.com/photo.jpg" 
                        value={newProductImage}
                        onChange={e => setNewProductImage(e.target.value)}
                        className="w-full bg-charcoal-dark border border-border-color text-sm text-off-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-neon-purple"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                      <button 
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="bg-charcoal border border-border-color text-grey-muted hover:text-off-white py-2 px-5 rounded-xl text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="bg-neon-purple text-white hover:bg-neon-purple-hover py-2 px-6 rounded-xl text-xs font-semibold shadow-md"
                      >
                        Simpan ke Database
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order Transaction History */}
              <div className="lg:col-span-8 bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg flex flex-col">
                <h3 className="font-title font-bold text-base text-off-white mb-4">Riwayat Pesanan</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color text-grey-muted uppercase tracking-wider font-semibold">
                        <th className="pb-3 pr-2">ID Pesanan</th>
                        <th className="pb-3 px-2">Tanggal</th>
                        <th className="pb-3 px-2">Metode</th>
                        <th className="pb-3 px-2">Total Harga</th>
                        <th className="pb-3 px-2">L2 Jaringan</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 pl-2">Hash Blok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                      {dashboardData && dashboardData.recent_orders.length > 0 ? (
                        dashboardData.recent_orders.map((o: Order) => (
                          <tr key={o.id} className="hover:bg-charcoal-dark/20">
                            <td className="py-3.5 pr-2 font-bold font-mono text-off-white">{o.id}</td>
                            <td className="py-3.5 px-2 text-grey-muted">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                            <td className="py-3.5 px-2">
                              <span className="text-[10px] uppercase bg-charcoal-dark border border-border-color py-0.5 px-2 rounded font-semibold text-grey-muted">
                                {o.payment_method === 'custody' ? 'Custody' : 'Direct'}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="font-medium text-off-white">Rp {o.total_price_idr.toLocaleString('id-ID')}</div>
                              <div className="text-[10px] text-lime-green font-mono font-medium">{Number(o.total_price_usdt).toFixed(2)} USDT</div>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`text-[10px] font-bold uppercase ${o.blockchain_network === 'polygon' ? 'text-purple-400' : 'text-blue-400'}`}>
                                {o.blockchain_network}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border ${
                                o.status === 'paid' ? 'bg-lime-green/10 text-lime-green border-lime-green/20' :
                                o.status === 'withdrawn' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                o.status === 'anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                o.status === 'refunded' ? 'bg-grey-muted/10 text-grey-muted border-grey-muted/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                                {o.status === 'paid' ? 'Lunas' :
                                 o.status === 'withdrawn' ? 'Selesai' :
                                 o.status === 'anomaly' ? 'Flagged' :
                                 o.status === 'refunded' ? 'Refunded' :
                                 'Pending'}
                              </span>
                            </td>
                            <td className="py-3.5 pl-2 font-mono text-grey-muted text-[10px] max-w-[120px] truncate">
                              {o.transaction_hash ? (
                                <a href="#" className="hover:text-neon-purple hover:underline">{o.transaction_hash}</a>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-grey-muted">
                            Belum ada riwayat transaksi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Withdrawal History */}
              <div className="lg:col-span-4 bg-charcoal-light border border-border-color rounded-2xl p-5 shadow-lg flex flex-col">
                <h3 className="font-title font-bold text-base text-off-white mb-4">Riwayat Penarikan Batch</h3>

                <div className="flex flex-col gap-3 grow">
                  {dashboardData && dashboardData.recent_withdrawals.length > 0 ? (
                    dashboardData.recent_withdrawals.map((w: Withdrawal) => (
                      <div key={w.id} className="bg-charcoal-dark border border-border-color/60 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-off-white font-mono">{Number(w.amount_usdt).toFixed(2)} USDT</span>
                          <span className="text-[10px] text-lime-green font-mono font-semibold">Saved: +{Number(w.gas_saved_usdt).toFixed(2)} USDT</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-grey-muted">
                          <span>{new Date(w.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="font-mono truncate max-w-[140px]">{w.transaction_hash}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grow flex items-center justify-center py-8 text-center text-grey-muted text-xs">
                      Belum ada penarikan yang dicairkan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-charcoal-dark border-t border-border-color py-8 mt-12 text-center text-xs text-grey-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 STUMA Platform. Dikembangkan untuk kemajuan UMKM Indonesia.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-off-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-off-white transition-colors">Kebijakan Privasi</a>
            <a href="https://github.com" target="_blank" className="hover:text-off-white transition-colors">Smart Contract</a>
          </div>
        </div>
      </footer>

      {/* ================= WEB3 CHECKOUT FLOW MODAL DIALOGS ================= */}
      {checkoutStep !== 'idle' && checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal border border-border-color max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            
            {/* Close modal if success, anomaly, or pending */}
            {(checkoutStep === 'success' || checkoutStep === 'anomaly') && (
              <button 
                onClick={() => setCheckoutStep('idle')}
                className="absolute top-4 right-4 p-1 text-grey-muted hover:text-off-white hover:bg-charcoal-light rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            )}

            <div className="flex flex-col items-center text-center">
              
              {/* Step: Converting */}
              {checkoutStep === 'converting' && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-neon-purple/20 border-t-neon-purple animate-spin mb-4"></div>
                  <h3 className="font-title font-bold text-lg text-off-white">Menghubungi Oracle Real-Time</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2">
                    Mengambil harga Rupiah terkini dan mengonversinya ke nilai USDT melalui CoinGecko API...
                  </p>
                </div>
              )}

              {/* Step: Gas Estimating */}
              {checkoutStep === 'gas_estimating' && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-neon-purple/20 border-t-neon-purple animate-spin mb-4"></div>
                  <h3 className="font-title font-bold text-lg text-off-white">Dynamic Gas Estimation</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2">
                    Memanggil RPC Node provider ({selectedNetwork === 'polygon' ? 'Polygon RPC' : 'Arbitrum RPC'}) untuk menghitung perkiraan gas fee transaksi...
                  </p>
                  <div className="mt-4 bg-charcoal-dark border border-border-color py-1.5 px-3 rounded-lg text-xs font-mono">
                    Gas: {Number(checkoutOrder.gas_fee_estimated || 0.005).toFixed(6)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}
                  </div>
                </div>
              )}

              {/* Step: Signing */}
              {checkoutStep === 'signing' && (
                <div className="py-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/15 text-neon-purple flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Wallet size={24} />
                  </div>
                  <h3 className="font-title font-bold text-lg text-off-white">Konfirmasi Dompet Web3</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2 mx-auto">
                    Silakan otorisasi transaksi USDT di dompet Anda untuk mentransfer ke smart contract STUMA.
                  </p>

                  <div className="bg-charcoal-dark border border-border-color/80 rounded-xl p-4 my-5 text-left text-xs flex flex-col gap-2.5">
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Order ID:</span>
                      <span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Total Pembayaran:</span>
                      <span className="font-bold text-lime-green font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between border-t border-border-color/50 pt-2.5">
                      <span className="text-grey-muted">Jaringan L2:</span>
                      <span className="font-bold text-off-white uppercase">{checkoutOrder.blockchain_network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Gas Fee Maks:</span>
                      <span className="font-mono text-grey-muted">{Number(checkoutOrder.gas_fee_estimated || 0.005).toFixed(6)} {selectedNetwork === 'polygon' ? 'POL' : 'ETH'}</span>
                    </div>
                  </div>

                  {/* Option to inject Anomaly for QA testing */}
                  <div className="border border-border-color/60 bg-charcoal-dark p-3 rounded-xl mb-5 text-left flex items-start gap-2.5">
                    <input 
                      type="checkbox" 
                      id="anomaly_check"
                      checked={simulateAnomaly}
                      onChange={(e) => setSimulateAnomaly(e.target.checked)}
                      className="mt-1 cursor-pointer accent-neon-purple"
                    />
                    <label htmlFor="anomaly_check" className="text-[11px] text-grey-muted leading-tight cursor-pointer">
                      <strong className="text-yellow-500 block mb-0.5">Simulasikan Payload Anomali (QA Testing)</strong>
                      Modifikasi Metamask untuk mengirim USDT lebih rendah dari tagihan. Ini akan memicu deteksi suspensi di Laravel.
                    </label>
                  </div>

                  <button
                    onClick={completePayment}
                    className="w-full bg-neon-purple hover:bg-neon-purple-hover text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-neon-purple/10 hover:shadow-neon-purple/20 transition-all"
                  >
                    Tanda Tangani Transaksi (Sign)
                  </button>
                </div>
              )}

              {/* Step: Webhook pending */}
              {checkoutStep === 'webhook' && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-lime-green/20 border-t-lime-green animate-spin mb-4"></div>
                  <h3 className="font-title font-bold text-lg text-off-white">Menunggu Verifikasi Webhook</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2">
                    Transaksi terkirim ke blockchain. RPC Node provider mengirimkan webhook notifikasi untuk divalidasi oleh backend Laravel...
                  </p>
                  <p className="text-[10px] text-grey-muted/60 font-mono mt-4 truncate max-w-[320px]">
                    Hash: {txHash}
                  </p>
                </div>
              )}

              {/* Step: Success */}
              {checkoutStep === 'success' && (
                <div className="py-4">
                  <div className="w-14 h-14 rounded-full bg-lime-green-light text-lime-green flex items-center justify-center mx-auto mb-4 border border-lime-green/25">
                    <CheckCircle size={28} className="outline-1.5" />
                  </div>
                  <h3 className="font-title font-bold text-lg text-lime-green">Transaksi Sukses! (Lunas)</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2 mx-auto">
                    Terima kasih! Pembayaran USDT Anda telah diverifikasi oleh smart contract dan pesanan Anda sedang diproses.
                  </p>

                  <div className="bg-charcoal-dark border border-border-color/80 rounded-xl p-4 my-5 text-left text-xs flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-grey-muted">ID Transaksi:</span>
                      <span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Jumlah USDT:</span>
                      <span className="font-bold text-lime-green font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Konversi IDR:</span>
                      <span className="font-bold text-off-white">Rp {checkoutOrder.total_price_idr.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Jaringan L2:</span>
                      <span className="font-bold text-off-white uppercase">{checkoutOrder.blockchain_network}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('idle')}
                    className="w-full bg-charcoal-light border border-border-color hover:bg-charcoal text-off-white py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Kembali Belanja
                  </button>
                </div>
              )}

              {/* Step: Anomaly */}
              {checkoutStep === 'anomaly' && (
                <div className="py-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/25">
                    <ShieldAlert size={28} />
                  </div>
                  <h3 className="font-title font-bold text-lg text-red-400">Pembayaran Ditangguhkan!</h3>
                  <p className="text-xs text-grey-muted max-w-xs mt-2 mx-auto">
                    <strong>Peringatan Anomali Terdeteksi:</strong> Jumlah USDT yang dikirimkan tidak sesuai dengan tagihan.
                  </p>

                  <div className="bg-charcoal-dark border border-red-500/10 rounded-xl p-4 my-5 text-left text-xs flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Order ID:</span>
                      <span className="font-bold text-off-white font-mono">{checkoutOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Harus Dibayar:</span>
                      <span className="font-bold text-off-white font-mono">{Number(checkoutOrder.total_price_usdt).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Diterima Block:</span>
                      <span className="font-bold text-red-400 font-mono">{Number(Number(checkoutOrder.total_price_usdt) - 1.5).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-muted">Status Pesanan:</span>
                      <span className="font-bold text-red-400 uppercase">Suspended / Anomaly</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-grey-muted leading-relaxed mb-5">
                    Pesanan ini ditangguhkan demi keamanan merchant. Log anomali telah dilaporkan ke dasbor merchant untuk verifikasi manual.
                  </p>

                  <button
                    onClick={() => setCheckoutStep('idle')}
                    className="w-full bg-charcoal-light border border-border-color hover:bg-charcoal text-off-white py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Tutup Dialog
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
