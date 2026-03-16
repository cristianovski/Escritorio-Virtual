import { useDashboard } from "./dashboard/useDashboard";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { StatCards } from "./dashboard/components/StatCards";
import { DashboardCharts } from "./dashboard/components/DashboardCharts";
import { RecentClients } from "./dashboard/components/RecentClients";
import { Sidebar } from "./dashboard/components/Sidebar";

export function DashboardPage() {
  const dashboard = useDashboard();

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <DashboardHeader />

        <StatCards stats={dashboard.stats} />

        <DashboardCharts
          stats={dashboard.stats}
          pieData={dashboard.pieData}
          searchTerm={dashboard.searchTerm}
          setSearchTerm={dashboard.setSearchTerm}
          statusFilter={dashboard.statusFilter}
          setStatusFilter={dashboard.setStatusFilter}
        />

        <RecentClients
          loading={dashboard.loading}
          clientesFiltrados={dashboard.clientesFiltrados}
          toggleStatus={dashboard.toggleStatus}
          handleDeleteClient={dashboard.handleDeleteClient}
        />

        <Sidebar
          aniversariantes={dashboard.aniversariantes}
          notes={dashboard.notes}
          newNote={dashboard.newNote}
          setNewNote={dashboard.setNewNote}
          addNote={dashboard.addNote}
          removeNote={dashboard.removeNote}
        />

      </div>
    </div>
  );
}
