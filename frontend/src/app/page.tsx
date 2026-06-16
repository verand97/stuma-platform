'use client';

import React, { useState } from 'react';
import { UserSession } from '../utils/types';
import LoginScreen from './components/LoginScreen';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import SuperAdminView from './components/SuperAdminView';

export default function StumaApp() {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLogin = (user: UserSession) => {
    setSession(user);
  };

  const handleLogout = () => {
    setSession(null);
  };

  // If no session, show login screen
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render view based on role
  switch (session.role) {
    case 'pelanggan':
      return <CustomerView user={session} onLogout={handleLogout} />;
    case 'admin':
      return <AdminView user={session} onLogout={handleLogout} />;
    case 'superadmin':
      return <SuperAdminView user={session} onLogout={handleLogout} />;
    default:
      return (
        <div className="flex h-screen items-center justify-center bg-charcoal text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error: Unknown Role</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-charcoal-light rounded-lg hover:bg-border-color"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
  }
}
