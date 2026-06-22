// STUMA Full-Stack API Helper
// Connects to the Laravel backend on port 8000. Falls back to mock state if backend is offline.

export interface Product {
  id: number;
  name: string;
  description: string;
  price_idr: number;
  stock: number;
  image_url: string;
}

export interface OrderItem {
  product?: Product;
  product_id?: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_address: string;
  merchant_address: string;
  total_price_idr: number;
  total_price_usdt: number;
  gas_fee_estimated: number;
  status: 'pending' | 'paid' | 'anomaly' | 'withdrawn' | 'refunded';
  blockchain_network: 'polygon' | 'arbitrum';
  transaction_hash: string | null;
  payment_method: 'custody' | 'direct';
  created_at: string;
  items?: OrderItem[];
}

export interface AnomalyLog {
  id: number;
  order_id: string;
  expected_amount_usdt: number;
  actual_amount_usdt: number;
  transaction_hash: string;
  status: 'flagged' | 'resolved';
  notes: string;
  created_at: string;
  order?: Order;
}

export interface Withdrawal {
  id: number;
  merchant_address: string;
  amount_usdt: number;
  gas_saved_usdt: number;
  status: 'completed';
  transaction_hash: string;
  created_at: string;
}

export interface DashboardData {
  metrics: {
    total_sales_idr: number;
    total_sales_usdt: number;
    total_gas_saved_usdt: number;
    available_withdrawal_usdt: number;
    product_count: number;
  };
  status_counts: {
    pending: number;
    paid: number;
    withdrawn: number;
    anomaly: number;
  };
  recent_orders: Order[];
  recent_anomalies: AnomalyLog[];
  recent_withdrawals: Withdrawal[];
}

const BACKEND_URL = 'http://localhost:8000';

// Fallback Mock Data
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Batik Tulis Solo Canting Mas',
    description: 'Batik tulis premium dengan motif sogan klasik khas Solo, dibuat 100% menggunakan malam dan canting tradisional.',
    price_idr: 350000.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Kopi Arabika Gayo Single Origin 250g',
    description: 'Kopi Arabika specialty dari dataran tinggi Gayo, Aceh. Proses wet hulled (giling basah) dengan note spicy, caramel, dan chocolatey.',
    price_idr: 85000.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'Sepatu Kulit Oxford Cibaduyut',
    description: 'Sepatu formal Oxford dari pengrajin kulit legendaris Cibaduyut, Bandung. Menggunakan kulit sapi asli dengan jaminan kenyamanan.',
    price_idr: 450000.00,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: 'Tas Anyaman Rotan Lombok',
    description: 'Tas bahu bundar bermotif etnik buatan tangan seniman Lombok, NTB. Sangat modis dan awet menggunakan rotan pilihan.',
    price_idr: 120000.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    name: 'Keripik Tempe Premium Rejeki (3 Pack)',
    description: 'Keripik tempe tipis gurih renyah tanpa bahan pengawet. Menggunakan kedelai non-GMO berkualitas tinggi.',
    price_idr: 45000.00,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 6,
    name: 'Madu Hutan Liar Sumbawa Asli 500ml',
    description: 'Madu murni organik yang dipanen langsung dari sarang lebah Apis Dorsata di hutan belantara Sumbawa. Kaya antioksidan.',
    price_idr: 165000.00,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  }
];

export async function checkBackendOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/`, { method: 'GET', signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    console.log('Using local mock products fallback');
    return MOCK_PRODUCTS;
  }
}

export async function createOrder(data: {
  items: { product_id: number; quantity: number }[];
  blockchain_network: 'polygon' | 'arbitrum';
  payment_method: 'custody' | 'direct';
  customer_address: string;
}): Promise<{ order: Order; usdt_rate: number }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'API order creation failed');
    }
    return await res.json();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log('Simulating order creation locally:', errorMessage);
    
    // Simulate locally
    const usdtRate = 16400; // Mock rate
    let totalIdr = 0;
    for (const item of data.items) {
      const p = MOCK_PRODUCTS.find(x => x.id === item.product_id);
      if (p) totalIdr += p.price_idr * item.quantity;
    }
    
    const totalUsdt = parseFloat((totalIdr / usdtRate).toFixed(6));
    const gasEst = data.blockchain_network === 'polygon' ? 0.005321 : 0.016432;
    const orderId = 'STUMA-' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const order: Order = {
      id: orderId,
      customer_address: data.customer_address,
      merchant_address: '0x37c8D8Db16a9A1f87B64d6Bc1F4a1c5d809110B6',
      total_price_idr: totalIdr,
      total_price_usdt: totalUsdt,
      gas_fee_estimated: gasEst,
      status: 'pending',
      blockchain_network: data.blockchain_network,
      transaction_hash: null,
      payment_method: data.payment_method,
      created_at: new Date().toISOString(),
    };

    return { order, usdt_rate: usdtRate };
  }
}

export async function triggerBlockchainWebhook(data: {
  tx_hash: string;
  order_id: string;
  amount_usdt: number;
}): Promise<{ message: string; status: 'paid' | 'anomaly' }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/blockchain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Webhook failed');
    return await res.json();
  } catch {
    console.log('Simulating blockchain webhook verification locally');
    
    // Simulate check
    return {
      message: 'Simulated OK',
      status: 'paid', // Will override based on amount matching inside frontend component
    };
  }
}

export async function getDashboardData(localOrders: Order[] = [], localAnomalies: AnomalyLog[] = [], localWithdrawals: Withdrawal[] = [], merchantAddress?: string): Promise<DashboardData> {
  try {
    const url = merchantAddress 
      ? `${BACKEND_URL}/api/dashboard?merchant_address=${encodeURIComponent(merchantAddress)}`
      : `${BACKEND_URL}/api/dashboard`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API dashboard failed');
    return await res.json();
  } catch {
    console.log('Computing dashboard metrics locally from simulated storage');
    
    // Calculate dashboard data from client side logs
    const nonPending = localOrders.filter(o => o.status !== 'pending' && o.status !== 'anomaly');
    const totalSalesIdr = nonPending.reduce((sum, o) => sum + o.total_price_idr, 0);
    const totalSalesUsdt = nonPending.reduce((sum, o) => sum + o.total_price_usdt, 0);
    const totalGasSaved = localWithdrawals.reduce((sum, w) => sum + w.gas_saved_usdt, 0);
    
    const availableWithdrawalUsdt = localOrders
      .filter(o => o.status === 'paid' && o.payment_method === 'custody')
      .reduce((sum, o) => sum + o.total_price_usdt, 0);

    const statusCounts = {
      pending: localOrders.filter(o => o.status === 'pending').length,
      paid: localOrders.filter(o => o.status === 'paid').length,
      withdrawn: localOrders.filter(o => o.status === 'withdrawn').length,
      anomaly: localOrders.filter(o => o.status === 'anomaly').length,
    };

    return {
      metrics: {
        total_sales_idr: totalSalesIdr,
        total_sales_usdt: totalSalesUsdt,
        total_gas_saved_usdt: totalGasSaved,
        available_withdrawal_usdt: availableWithdrawalUsdt,
        product_count: MOCK_PRODUCTS.length,
      },
      status_counts: statusCounts,
      recent_orders: localOrders.slice(0, 6),
      recent_anomalies: localAnomalies.slice(0, 5),
      recent_withdrawals: localWithdrawals.slice(0, 5),
    };
  }
}

export async function requestWithdrawal(merchantAddress: string): Promise<{ message: string; withdrawal?: Withdrawal }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_address: merchantAddress }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'API withdrawal failed');
    }
    return await res.json();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Backend offline';
    throw new Error(errorMessage);
  }
}

export async function resolveAnomaly(orderId: string, action: 'approve' | 'refund'): Promise<{ message: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('API resolve anomaly failed');
    return await res.json();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Backend offline';
    throw new Error(errorMessage);
  }
}
