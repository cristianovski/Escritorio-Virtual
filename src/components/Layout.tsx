import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, DollarSign, Menu, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(0);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER / TOPBAR FIXO COM EFEITO VIDRO */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 z-50 shrink-0">
        <div className="flex items-center gap-8 lg:gap-12">
          
          {/* Apenas Ícone da Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200">
              <LayoutDashboard size={18}/>
            </div>
          </div>

          {/* Navegação Desktop - APENAS TEXTO */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/') ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
               Início
            </Link>
            <Link 
              to="/fluxo-caixa" 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/fluxo-caixa') ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
               Financeiro
            </Link>
          </nav>
        </div>

        {/* Ações (Sair e Menu Mobile) */}
        <div className="flex items-center gap-2">
           <button 
             onClick={handleLogout} 
             className="hidden md:flex text-slate-400 hover:text-red-600 items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-red-50 rounded-lg transition-colors"
           >
              Sair <LogOut size={18}/>
           </button>

           {/* Botão Hambúrguer (Apenas Celular) */}
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
             className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
           >
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </header>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg z-40 flex flex-col p-4 space-y-2 animate-in slide-in-from-top-2">
          <Link 
            onClick={() => setIsMobileMenuOpen(false)} 
            to="/" 
            className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 ${isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'}`}
          >
             <LayoutDashboard size={18}/> Início
          </Link>
          <Link 
            onClick={() => setIsMobileMenuOpen(false)} 
            to="/fluxo-caixa" 
            className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 ${isActive('/fluxo-caixa') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'}`}
          >
             <DollarSign size={18}/> Financeiro
          </Link>
          <div className="border-t border-slate-100 my-2"></div>
          <button 
            onClick={handleLogout} 
            className="w-full text-left text-red-500 flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors"
          >
             <LogOut size={18}/> Encerrar Sessão
          </button>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO DINÂMICO */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}