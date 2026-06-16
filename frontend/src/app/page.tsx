'use client';

import React, { useState } from 'react';
import { UserSession } from '../utils/types';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import SuperAdminView from './components/SuperAdminView';

type AppState = 'landing' | 'auth' | 'app';

export default function StumaApp() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [session, setSession] = useState<UserSession | null>(null);

  const handleNavigateToAuth = () => {
    setAppState('auth');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  const handleLogin = (user: UserSession) => {
    setSession(user);
    setAppState('app');
  };

  const handleLogout = () => {
    setSession(null);
    setAppState('landing');
  };

  // 1. Landing Page
  if (appState === 'landing') {
    return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
  }

  // 2. Auth / Login / Register Screen
  if (appState === 'auth' || !session) {
    return <LoginScreen onLogin={handleLogin} onBackToLanding={handleBackToLanding} />;
  }

  // 3. Authenticated Views
  switch (session.role) {
    case 'pelanggan':
      return <CustomerView user={session} onLogout={handleLogout} />;
    case 'admin':
      return <AdminView user={session} onLogout={handleLogout} />;
    case 'superadmin':
      return <SuperAdminView user={session} onLogout={handleLogout} />;
    default:
      return (
        <div className="flex h-screen items-center justify-center bg-[#1E1F22] text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error: Unknown Role</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-[#2B2D31] rounded-lg hover:bg-[#383A40]"
            >
              Back to Landing
            </button>
          </div>
        </div>
      );
  }
}
