import { Search, Calendar } from 'lucide-react';
import { ClientDocument } from '../../../types';
import { ReactNode } from 'react';

interface DocumentListProps {
  filteredDocs: ClientDocument[];
  loading: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDoc: ClientDocument | null;
  handleSelectDoc: (doc: ClientDocument) => void;
  getFileIcon: (url: string) => ReactNode;
  formatDate: (date?: string | null) => string;
}

export function DocumentList({
  filteredDocs,
  loading,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  selectedDoc,
  handleSelectDoc,
  getFileIcon,
  formatDate,
}: DocumentListProps) {
  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-all ${selectedDoc ? 'w-3/5 hidden md:flex' : 'w-full'}`}>
      <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['Todos', 'Provas', 'Pessoal', 'Processual', 'Diversos'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Carregando...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl m-4">
            <p className="text-slate-500 font-medium">Nenhum documento encontrado.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleSelectDoc(doc)}
              className={`group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                selectedDoc?.id === doc.id
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                {getFileIcon(doc.file_url)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate text-slate-800">{doc.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium border bg-slate-100 text-slate-600">
                    {doc.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {formatDate(doc.reference_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
