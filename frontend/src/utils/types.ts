// STUMA Role-based Types

export type UserRole = 'pelanggan' | 'admin' | 'superadmin';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  walletAddress: string;
  avatar?: string;
}

export const ROLE_CONFIG = {
  pelanggan: {
    label: 'Pelanggan',
    description: 'Belanja produk UMKM dengan pembayaran USDT',
    color: 'neon-purple',
    icon: 'ShoppingBag',
  },
  admin: {
    label: 'Admin Merchant',
    description: 'Kelola produk, pesanan, dan penarikan dana',
    color: 'amber-accent',
    icon: 'LayoutDashboard',
  },
  superadmin: {
    label: 'Super Admin',
    description: 'Pantau seluruh platform dan kelola merchant',
    color: 'cyan-accent',
    icon: 'Shield',
  },
} as const;

export const MOCK_USERS: Record<UserRole, UserSession> = {
  pelanggan: {
    role: 'pelanggan',
    name: 'Budi Santoso',
    email: 'budi@email.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  },
  admin: {
    role: 'admin',
    name: 'Sari Merchant',
    email: 'sari@umkm.id',
    walletAddress: '0x37c8D8Db16a9A1f87B64d6Bc1F4a1c5d809110B6',
  },
  superadmin: {
    role: 'superadmin',
    name: 'Platform Admin',
    email: 'admin@stuma.id',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
};
