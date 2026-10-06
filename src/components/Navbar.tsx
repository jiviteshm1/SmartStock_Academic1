import React from 'react';
import {
  Store,
  ShoppingCart,
  Boxes,
  Layers,
  Receipt,
  BarChart3,
  Database,
  LogOut,
  UserCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { User, DatabaseStatus } from '../types/index.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser: (username: string) => void;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onSwitchUser,
  dbStatus,
  onOpenDbModal,
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const navItems = [
    { id: 'billing', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Inventory', icon: Boxes },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'sales', label: 'Sales Ledger', icon: Receipt },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white font-display">
                  SmartStock
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Academic POS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Campus Store Inventory &amp; Transaction System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database Engine Status Button */}
            <button
              onClick={onOpenDbModal}
              title="Click to inspect Database & Architecture"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline text-[11px] font-mono">
                {dbStatus?.isUsingMySQL ? 'MySQL Active' : 'Relational Engine'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* User Profile / Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                {currentUser?.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-teal-400" />
                )}
                <span className="font-semibold max-w-[110px] truncate">
                  {currentUser?.full_name?.split(' ')[0] || currentUser?.username}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {currentUser?.role}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">
                      {currentUser?.full_name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      @{currentUser?.username} · {currentUser?.role?.toUpperCase()}
                    </p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Role Switch (Demo)
                    </p>
                    <button
                      onClick={() => {
                        onSwitchUser('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Admin (Dr. Vance)
                      </span>
                      {currentUser?.role === 'admin' && (
                        <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('cashier');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                        Cashier (Sarah Jenkins)
                      </span>
                      {currentUser?.role === 'cashier' && (
                        <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
