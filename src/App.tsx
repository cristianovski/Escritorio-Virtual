import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ClientWorkspaceHeader } from './components/clients/ClientWorkspaceHeader';
import { Client, ClientComponent } from './types';

const Layout = lazy(() => import('./components/Layout').then(module => ({ default: module.Layout })));
const LoginPage = lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ClientListPage = lazy(() => import('./pages/clients/ClientListPage').then(module => ({ default: module.ClientListPage })));
const ClientFormPage = lazy(() => import('./pages/clients/ClientFormPage').then(module => ({ default: module.ClientFormPage })));
const ClientSummaryPage = lazy(() => import('./pages/clients/ClientSummaryPage').then(module => ({ default: module.ClientSummaryPage })));
const AnalysisPage = lazy(() => import('./pages/analysis/AnalysisPage').then(module => ({ default: module.AnalysisPage })));
const TimelinePage = lazy(() => import('./pages/timeline/TimelinePage').then(module => ({ default: module.TimelinePage })));
const ClientDocumentsManager = lazy(() => import('./pages/documents/ClientDocumentsManager').then(module => ({ default: module.ClientDocumentsManager })));
const LawyersPage = lazy(() => import('./pages/admin/LawyersPage').then(module => ({ default: module.LawyersPage })));
const ClientFinancePage = lazy(() => import('./pages/finance/ClientFinancePage').then(module => ({ default: module.ClientFinancePage })));
const CashFlowPage = lazy(() => import('./pages/finance/CashFlowPage').then(module => ({ default: module.CashFlowPage })));

function RouteFallback() {
  return (
    <div className="min-h-48 flex items-center justify-center text-sm text-slate-500" role="status">
      Carregando…
    </div>
  );
}

// Wrapper de carregamento de cliente com tipagem
function ClientLoader({ Component }: { Component: ClientComponent }) {
  const { id } = useParams();
  const [loadedClient, setLoadedClient] = useState<{
    routeId: string;
    client: Client | null;
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (!active) return;
      if (error) console.error("Erro ao carregar cliente:", error);
      setLoadedClient({ routeId: id, client: data ? data as Client : null });
    };
    void fetchClient();

    return () => {
      active = false;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center" role="alert">
        <p className="text-sm text-slate-600">Não foi possível identificar o cliente.</p>
      </div>
    );
  }

  if (loadedClient?.routeId !== id) {
    return (
      <div
        className="flex h-full items-center justify-center p-6 text-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm text-slate-600">Carregando contexto do cliente…</p>
      </div>
    );
  }

  if (!loadedClient.client) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center" role="alert">
        <p className="text-sm text-slate-700">Cliente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ClientWorkspaceHeader client={loadedClient.client} />
      <div className="min-h-0 flex-1 overflow-hidden">
        <Component cliente={loadedClient.client} onBack={() => window.history.back()} />
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="clientes" element={<ClientListPage />} />

              <Route path="cliente/novo" element={<ClientFormPage onBack={() => window.history.back()} />} />

              <Route path="cliente/:id" element={<ClientLoader Component={ClientSummaryPage} />} />
              <Route path="cliente/:id/cadastro" element={<ClientLoader Component={ClientFormPage} />} />
              <Route path="cliente/:id/entrevista" element={<ClientLoader Component={ClientFormPage} />} />
              <Route path="analise/:id" element={<ClientLoader Component={AnalysisPage} />} />

              <Route path="linha-tempo/:id" element={<ClientLoader Component={TimelinePage} />} />
              <Route path="documentos/:id" element={<ClientLoader Component={ClientDocumentsManager} />} />
              <Route path="cliente/:id/financeiro" element={<ClientLoader Component={ClientFinancePage} />} />

              <Route path="advogados" element={<LawyersPage onBack={() => window.history.back()} />} />
              <Route path="fluxo-caixa" element={<CashFlowPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
