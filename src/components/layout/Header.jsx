import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Bell, Search, Menu, X, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbMap = {
  '/dashboard': ['Dashboard'],
  '/complaints': ['Complaints'],
  '/complaints/create': ['Complaints', 'New Complaint'],
  '/transactions': ['Transactions'],
  '/predictions': ['Predictions'],
  '/predictions/run': ['Predictions', 'Run Prediction'],
  '/cases': ['Cases'],
  '/cases/create': ['Cases', 'New Case'],
  '/intelligence-map': ['Intelligence Map'],
  '/reports': ['Reports'],
  '/administration': ['Administration'],
  '/profile': ['Profile'],
};

export default function Header({ setMobileOpen }) {
  const { data, unreadCount, markAllNotificationsRead, markNotificationRead } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = breadcrumbMap[location.pathname] || pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results = [];
    data.complaints.filter(c => c.id.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower) || c.location.toLowerCase().includes(lower))
      .slice(0, 3).forEach(c => results.push({ type: 'Complaint', id: c.id, label: `${c.id} - ${c.category}`, sub: c.location, path: `/complaints/${c.id}` }));
    data.transactions.filter(t => t.id.toLowerCase().includes(lower) || t.sender.toLowerCase().includes(lower))
      .slice(0, 2).forEach(t => results.push({ type: 'Transaction', id: t.id, label: `${t.id}`, sub: `₹${t.amount.toLocaleString()}`, path: `/transactions/${t.id}` }));
    data.cases.filter(c => c.id.toLowerCase().includes(lower) || c.title.toLowerCase().includes(lower))
      .slice(0, 2).forEach(c => results.push({ type: 'Case', id: c.id, label: `${c.id} - ${c.title}`, sub: c.status, path: `/cases/${c.id}` }));
    data.predictions.filter(p => p.id.toLowerCase().includes(lower) || p.predictedLocation.toLowerCase().includes(lower))
      .slice(0, 2).forEach(p => results.push({ type: 'Prediction', id: p.id, label: p.id, sub: p.predictedLocation, path: `/predictions/${p.id}` }));
    setSearchResults(results);
  };

  const severityColor = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' };

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 flex-shrink-0 z-30">
      {/* Mobile menu button */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm min-w-0 flex-1">
        {breadcrumb.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />}
            <span className={`truncate ${i === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{part}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative hidden sm:block">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => { handleSearch(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
          />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}><X className="w-3 h-3 text-gray-400" /></button>}
        </div>
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full mt-1 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Search Results</p>
            </div>
            {searchResults.map(r => (
              <button key={r.id} onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 text-left">
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex-shrink-0 mt-0.5">{r.type}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{r.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {showNotifs && (
          <div className="absolute top-full mt-1 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <button onClick={markAllNotificationsRead} className="text-xs text-blue-600 hover:text-blue-700">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {data.notifications.slice(0, 8).map(n => (
                <div key={n.id} onClick={() => { markNotificationRead(n.id); setShowNotifs(false); if (n.linkedId && n.linkedType) navigate(`/${n.linkedType}s/${n.linkedId}`); }}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900">{n.title}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${severityColor[n.severity] || 'bg-gray-100 text-gray-600'}`}>{n.severity}</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-100">
              <button onClick={() => { setShowNotifs(false); navigate('/profile'); }} className="w-full text-xs text-blue-600 hover:text-blue-700 text-center">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div onClick={() => navigate('/profile')} className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors flex-shrink-0">
        <span className="text-blue-700 text-xs font-semibold">AS</span>
      </div>
    </header>
  );
}