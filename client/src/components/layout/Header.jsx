// client/src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import { Bell, Check, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (_) { /* notification failures should not block navigation */ }
  };
  useEffect(() => { loadNotifications(); }, []);
  const markRead = async (id) => { await notificationService.markAsRead(id); await loadNotifications(); };
  const markAllRead = async () => { await notificationService.markAllAsRead(); await loadNotifications(); };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-medium text-slate-500 hidden sm:block">
          Enterprise Workspace / <span className="text-slate-800 font-semibold capitalize">{user?.role?.replace('_', ' ')} Mode</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => { setOpen(!open); if (!open) loadNotifications(); }} title="Notifications" className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg">
            <Bell size={19} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {open && <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50">
            <div className="flex justify-between items-center px-4 py-3 border-b"><strong className="text-sm">Notifications</strong><button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">Mark all read</button></div>
            {notifications.length === 0 ? <p className="p-4 text-sm text-slate-500">No notifications.</p> : notifications.map((item) => <button key={item._id} onClick={() => !item.read && markRead(item._id)} className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${item.read ? '' : 'bg-brand-50/60'}`}><div className="flex justify-between gap-3"><span className="text-sm font-medium text-slate-800">{item.title}</span>{!item.read && <Check size={14} className="text-brand-600" />}</div><p className="text-xs text-slate-500 mt-1">{item.message}</p></button>)}
          </div>}
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0)}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-700">{user?.name}</span>
        </Link>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
