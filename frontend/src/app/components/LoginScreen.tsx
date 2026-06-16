'use client';

import React from 'react';
import { ShoppingBag, LayoutDashboard, Shield, ArrowRight } from 'lucide-react';
import { UserRole, ROLE_CONFIG, MOCK_USERS, UserSession } from '../../utils/types';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

const ROLE_ICONS = {
  pelanggan: ShoppingBag,
  admin: LayoutDashboard,
  superadmin: Shield,
};

const ROLE_COLORS = {
  pelanggan: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    hoverBorder: 'hover:border-neon-purple',
    text: 'text-neon-purple',
    shadow: 'hover:shadow-neon-purple/15',
    btnBg: 'bg-neon-purple hover:bg-neon-purple-hover',
    glow: 'shadow-neon-purple/20',
  },
  admin: {
    bg: 'bg-amber-accent/10',
    border: 'border-amber-accent/30',
    hoverBorder: 'hover:border-amber-accent',
    text: 'text-amber-accent',
    shadow: 'hover:shadow-amber-accent/15',
    btnBg: 'bg-amber-accent hover:bg-amber-600',
    glow: 'shadow-amber-accent/20',
  },
  superadmin: {
    bg: 'bg-cyan-accent/10',
    border: 'border-cyan-accent/30',
    hoverBorder: 'hover:border-cyan-accent',
    text: 'text-cyan-accent',
    shadow: 'hover:shadow-cyan-accent/15',
    btnBg: 'bg-cyan-accent hover:bg-cyan-700',
    glow: 'shadow-cyan-accent/20',
  },
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const roles: UserRole[] = ['pelanggan', 'admin', 'superadmin'];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/3 blur-3xl" />
      </div>

      {/* Logo & Title */}
      <div className="relative z-10 flex flex-col items-center mb-10 animate-slideUp">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-neon-purple to-purple-800 flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-neon-purple/30 mb-5 animate-pulseGlow">
          S
        </div>
        <h1 className="font-title text-3xl md:text-4xl font-bold text-off-white tracking-tight">
          STUMA
        </h1>
        <p className="text-grey-muted text-sm mt-2 text-center max-w-md">
          Stablecoin Trade for UMKM Advancement — Platform e-commerce UMKM terintegrasi pembayaran USDT Layer 2
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[10px] uppercase bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-2.5 py-1 rounded-full font-mono font-semibold tracking-wider">
            Polygon
          </span>
          <span className="text-[10px] uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-mono font-semibold tracking-wider">
            Arbitrum
          </span>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5">
        {roles.map((role, idx) => {
          const config = ROLE_CONFIG[role];
          const colors = ROLE_COLORS[role];
          const Icon = ROLE_ICONS[role];
          const user = MOCK_USERS[role];

          return (
            <button
              key={role}
              onClick={() => onLogin(user)}
              className={`group relative bg-charcoal-light border ${colors.border} ${colors.hoverBorder} rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl ${colors.shadow} hover:-translate-y-1 animate-slideUp`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>

              {/* Info */}
              <h3 className="font-title font-bold text-lg text-off-white mb-1.5">
                {config.label}
              </h3>
              <p className="text-xs text-grey-muted leading-relaxed mb-5">
                {config.description}
              </p>

              {/* Mock user info */}
              <div className="bg-charcoal-dark/60 border border-border-color/50 rounded-xl p-3 mb-4">
                <p className="text-[11px] text-grey-muted">
                  <span className="text-off-white font-semibold">{user.name}</span>
                </p>
                <p className="text-[10px] text-grey-muted font-mono mt-1 truncate">
                  {user.walletAddress.substring(0, 10)}...{user.walletAddress.substring(36)}
                </p>
              </div>

              {/* CTA */}
              <div className={`flex items-center gap-2 ${colors.text} text-xs font-semibold group-hover:gap-3 transition-all`}>
                <span>Masuk sebagai {config.label}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="relative z-10 text-[11px] text-grey-muted/50 mt-10 text-center">
        © 2026 STUMA Platform — Dikembangkan untuk kemajuan UMKM Indonesia
      </p>
    </div>
  );
}
