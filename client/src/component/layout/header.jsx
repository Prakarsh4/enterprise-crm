// client/src/components/layout/Header.jsx
import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/Authcontext';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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