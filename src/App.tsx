
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ServicesPage from "@/pages/ServicesPage";
import ExpensesPage from "@/pages/ExpensesPage";
import RegistrationPage from "@/pages/RegistrationPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/LoginPage";
import UsersPage from "@/pages/UsersPage";
import { AuthProvider, PERMISSIONS } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initializeAllServices } from "@/services/initializeServices";

// Create a client with custom configs
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // Inicializar serviços ao carregar o aplicativo
    initializeAllServices();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/servicos"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ServicesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/despesas"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ExpensesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cadastros"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RegistrationPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
                      <Layout>
                        <UsersPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
