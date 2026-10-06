import React, { useState, useEffect } from 'react';
import { api } from './api.ts';
import { User, Sale, DatabaseStatus } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Login } from './pages/Login.tsx';
import { Billing } from './pages/Billing.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Products } from './pages/Products.tsx';
import { Categories } from './pages/Categories.tsx';
import { SalesHistory } from './pages/SalesHistory.tsx';
import { Reports } from './pages/Reports.tsx';
import { InvoiceModal } from './components/InvoiceModal.tsx';
import { DatabaseModal } from './components/DatabaseModal.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('billing');
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Fetch database status
  const refreshDbStatus = async () => {
    if (!currentUser) return;
    try {
      const status = await api.getSystemStatus();
      setDbStatus(status);
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    // If not logged in, auto-login with default cashier so the app is instantly usable out of the box!
    if (!currentUser) {
      api.login('cashier', 'cashier123')
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          // Fall back to login screen if any error
        });
    }

    const handleAuthExpired = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshDbStatus();
    }
  }, [currentUser, activeTab]);

  const handleLogout = () => {
    api.clearSession();
    setCurrentUser(null);
  };

  const handleSwitchUser = async (username: string) => {
    try {
      const password = username === 'admin' ? 'admin123' : 'cashier123';
      const res = await api.login(username, password);
      setCurrentUser(res.user);
      refreshDbStatus();
    } catch (err: any) {
      alert(`User switch failed: ${err.message}`);
    }
  };

  // If user is logged out, show Login page
  if (!currentUser) {
    return <Login onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'billing' && (
          <Billing
            onSaleCompleted={(sale) => {
              setActiveInvoice(sale);
              refreshDbStatus();
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onViewInvoice={(sale) => setActiveInvoice(sale)}
          />
        )}

        {activeTab === 'products' && (
          <Products currentUser={currentUser} />
        )}

        {activeTab === 'categories' && (
          <Categories currentUser={currentUser} />
        )}

        {activeTab === 'sales' && (
          <SalesHistory onViewInvoice={(sale) => setActiveInvoice(sale)} />
        )}

        {activeTab === 'reports' && (
          <Reports currentUser={currentUser} />
        )}
      </main>

      {/* Invoice / Receipt Modal */}
      {activeInvoice && (
        <InvoiceModal
          sale={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {/* Database & Architecture Inspection Modal */}
      {isDbModalOpen && (
        <DatabaseModal
          status={dbStatus}
          onClose={() => setIsDbModalOpen(false)}
          onResetComplete={() => {
            refreshDbStatus();
            // trigger refresh on components
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
