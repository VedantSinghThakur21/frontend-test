import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Inquiries from './pages/Inquiries';
import Cranes from './pages/Cranes';
import CostCalculations from './pages/CostCalculations';
import Quotations from './pages/Quotations';
import Operators from './pages/Operators';
import Jobs from './pages/Jobs';
import Deals from './pages/Deals';
import Insights from './pages/Insights';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import LoadingIndicator from './components/LoadingIndicator';

import { useStore } from './store/useStore';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { fetchData, loading: storeLoading } = useStore();
  const { loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchData().catch(error => {
        console.error('Failed to fetch initial data:', error);
      });
    }
  }, [fetchData, authLoading, user]);

  if (authLoading || storeLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-gray-200 text-4xl font-bold opacity-10 rotate-[-45deg] select-none">
                        InfoRepos Technologies
                      </div>
                    </div>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/inquiries" element={<Inquiries />} />
                      <Route path="/cranes" element={<Cranes />} />
                      <Route path="/operators" element={<Operators />} />
                      <Route path="/calculations" element={<CostCalculations />} />
                      <Route path="/quotations" element={<Quotations />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
    </Router>
  );
}

export default App;