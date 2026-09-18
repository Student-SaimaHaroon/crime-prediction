import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import {
  LayoutDashboard, FileText, CreditCard, Brain, Briefcase,
  Map, BarChart2, Settings, User, Bell, ChevronLeft, ChevronRight,
  Shield, X, Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/complaints', label: 'Complaints', icon: FileText },
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/predictions', label: 'Predictions', icon: Brain },
  { path: '/cases', label: 'Cases', icon: Briefcase },
  { path: '/intelligence-map', label: 'Intelligence Map', icon: Map },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
  { path: '/administration', label: 'Administration', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const { unreadCount } = useApp();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center px-4 py-4 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 leading-tight truncate">CYBERCRIME</p>
              <p className="text-[10px] text-gray-500 leading-tight truncate">Prediction Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          className="hidden lg:flex w-6 h-6 items-center justify-center text-gray-400 hover:text-gray-600 rounded"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-6 h-6 flex items-center justify-center text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          const showBadge = path === '/profile' && unreadCount > 0;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 mb-0.5 rounded-lg transition-all duration-150 group relative
                ${isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {!collapsed && (
                <span className="text-sm truncate">{label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {label}
                </div>
              )}
              {!collapsed && path === '/profile' && unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-0 h-4">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 text-xs font-semibold">AS</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">Arjun Sharma</p>
              <p className="text-[10px] text-gray-500 truncate">LEA Officer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-56 bg-white shadow-xl flex flex-col h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}