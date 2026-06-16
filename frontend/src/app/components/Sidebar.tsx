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
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  user,
  items,
  activeItem,
  onItemClick,
  onLogout,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  
  return (
    <aside className={`bg-[#111214] border-r border-[#383A40] flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#383A40]">
        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#7F56FF] to-purple-800 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(127,86,255,0.3)] shrink-0">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-title text-base font-bold text-off-white leading-tight">STUMA</h1>
            <p className="text-[9px] text-[#80FF56] font-mono tracking-widest uppercase">L2 Gateway</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                collapsed ? 'justify-center px-2' : 'px-4'
              } ${
                isActive
                  ? 'bg-[#7F56FF] text-white shadow-[0_0_15px_rgba(127,86,255,0.3)]'
                  : 'text-grey-muted hover:text-off-white hover:bg-[#2B2D31]'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.badge && item.badge > 0 && (
                <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-[#80FF56] text-[#111214] text-[10px] font-extrabold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1 shadow-[0_0_10px_rgba(128,255,86,0.3)]`}>
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
        className="mx-3 mb-3 py-2 rounded-lg text-grey-muted hover:text-off-white hover:bg-[#2B2D31] transition-colors flex items-center justify-center border border-transparent hover:border-[#383A40]"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User Profile & Logout */}
      <div className="border-t border-[#383A40] p-4 bg-[#1E1F22]">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-[#2B2D31] border border-[#383A40] flex items-center justify-center font-bold text-sm shrink-0 text-[#7F56FF]">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-off-white truncate">{user.name}</p>
              <p className="text-[10px] text-grey-muted truncate capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-2 text-grey-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
