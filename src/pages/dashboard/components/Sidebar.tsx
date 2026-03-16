import { Calendar, MessageCircle, Star, Trash2 } from "lucide-react";
import { Client } from "../../../types";

interface SidebarProps {
  aniversariantes: Client[];
  notes: string[];
  newNote: string;
  setNewNote: (note: string) => void;
  addNote: () => void;
  removeNote: (idx: number) => void;
}

export function Sidebar({
  aniversariantes,
  notes,
  newNote,
  setNewNote,
  addNote,
  removeNote
}: SidebarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Aniversariantes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Calendar size={18} className="text-pink-500" />
            Aniversariantes do Mês
          </h3>
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-medium">
            {aniversariantes.length}
          </span>
        </div>
        {aniversariantes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum aniversariante este mês.</p>
        ) : (
          <div className="space-y-3">
            {aniversariantes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex flex-col items-center justify-center text-pink-600 font-bold">
                  <span className="text-xs leading-none">Dia</span>
                  <span className="text-lg leading-none">{c.data_nascimento?.split('-')[2]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{c.nome}</p>
                  <button
                    onClick={() => window.open(`https://wa.me/55${c.telefone?.replace(/\D/g, '') || ''}`, '_blank')}
                    className="text-xs text-pink-600 font-medium hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <MessageCircle size={12} /> Enviar parabéns
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lembretes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          Lembretes Rápidos
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder="Adicionar lembrete..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
          />
          <button
            onClick={addNote}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Adicionar
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum lembrete salvo.</p>
          ) : (
            notes.map((note, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <span className="text-sm text-slate-700">{note}</span>
                <button
                  onClick={() => removeNote(i)}
                  className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
