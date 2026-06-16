'use client';

import React from 'react';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserSession } from '../../utils/types';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  user: UserSession;
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  accentColor: string; // e.g. 'neon-purple', 'amber-accent', 'cyan-accent'
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  user,
  items,
  activeItem,
  onItemClick,
  onLogout,
  accentColor,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const colorMap: Record<string, { bg: string; text: string; activeBg: string }> = {
    'neon-purple': { bg: 'bg-neon-purple/10', text: 'text-neon-purple', activeBg: 'bg-neon-purple/15' },
    'amber-accent': { bg: 'bg-amber-accent/10', text: 'text-amber-accent', activeBg: 'bg-amber-accent/15' },
    'cyan-accent': { bg: 'bg-cyan-accent/10', text: 'text-cyan-accent', activeBg: 'bg-cyan-accent/15' },
  };

  const colors = colorMap[accentColor] || colorMap['neon-purple'];

  return (
    <aside className={`bg-charcoal-dark border-r border-border-color flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border-color">
        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-neon-purple to-purple-800 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-neon-purple/20 shrink-0">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-title text-base font-bold text-off-white leading-tight">STUMA</h1>
            <p className="text-[9px] text-grey-muted truncate">L2 Payment Gateway</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${
                isActive
                  ? `${colors.activeBg} ${colors.text} sidebar-item-active`
                  : 'text-grey-muted hover:text-off-white hover:bg-charcoal-light/50'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.badge && item.badge > 0 && (
                <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'} bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="mx-2 mb-2 py-2 rounded-lg text-grey-muted hover:text-off-white hover:bg-charcoal-light/50 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User Profile & Logout */}
      <div className="border-t border-border-color px-3 py-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-sm shrink-0`}>
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-off-white truncate">{user.name}</p>
              <p className="text-[10px] text-grey-muted truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-1.5 text-grey-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
