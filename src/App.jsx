import React, { useState } from 'react';
import { Route, Switch, Redirect } from 'wouter';
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

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const [toast, setToast] = useState(null);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage setToast={setToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#070b12] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 md:p-8 lg:p-10 flex-1 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
          <Switch>
            <Route path="/">
              <Redirect to="/overview" />
            </Route>
            <Route path="/overview">
              <OverviewPage setToast={setToast} />
            </Route>
            <Route path="/inactive">
              <InactiveUsersPage setToast={setToast} />
            </Route>
            <Route path="/revenuecat">
              <RevenueCatPage setToast={setToast} />
            </Route>
            <Route path="/resend">
              <ResendPage setToast={setToast} />
            </Route>
            <Route path="/safety">
              <SafetyLookupPage setToast={setToast} />
            </Route>
            <Route>
              <Redirect to="/overview" />
            </Route>
          </Switch>
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
