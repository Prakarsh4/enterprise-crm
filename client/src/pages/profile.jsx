// client/src/pages/Profile.jsx
import React from 'react';
import { useAuth } from '../context/Authcontext';
import Badge from '../components/common/Badge';
import { ShieldCheck, Mail, Calendar, User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">User Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">Authentication and role-based permissions metadata</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{user?.role?.toUpperCase()}</Badge>
              <span className="text-xs text-slate-400">ID: {user?._id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Mail size={14} /> Registered Email
            </div>
            <p className="text-sm font-medium text-slate-800">{user?.email}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <ShieldCheck size={14} /> Authorization Level
            </div>
            <p className="text-sm font-medium text-slate-800 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;