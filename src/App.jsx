import React, { useState } from 'react';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';

import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { InactiveUsersPage } from './pages/InactiveUsersPage';
import { RevenueCatPage } from './pages/RevenueCatPage';
import { ResendPage } from './pages/ResendPage';
import { SafetyLookupPage } from './pages/SafetyLookupPage';
import { SettingsPage } from './pages/SettingsPage';

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage setToast={setToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage setToast={setToast} />;
      case 'inactive':
        return <InactiveUsersPage setToast={setToast} />;
      case 'revenuecat':
        return <RevenueCatPage setToast={setToast} />;
      case 'resend':
        return <ResendPage setToast={setToast} />;
      case 'safety':
        return <SafetyLookupPage setToast={setToast} />;
      case 'settings':
        return <SettingsPage setToast={setToast} />;
      default:
        return <OverviewPage setToast={setToast} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b12] text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 md:p-8 lg:p-10 flex-1 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
          {renderPage()}
        </main>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ConfigProvider>
  );
}
