import { ArrowLeft, Eye, Download, Save, Edit2, ChevronDown, Scale, Trash2 } from 'lucide-react';
import { ClientDocument } from '../../../types';

interface DocumentDetailsSidebarProps {
  selectedDoc: ClientDocument | null;
  onClose: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSaveEdits: () => void;
  handleDeleteDoc: () => void;
  saving: boolean;
  editForm: {
    title: string;
    customTitle: string;
    category: ClientDocument['category'];
    reference_date: string;
    description: string;
  };
  setEditForm: (form: {
    title: string;
    customTitle: string;
    category: ClientDocument['category'];
    reference_date: string;
    description: string;
  }) => void;
  OPCOES_DOCUMENTOS: Record<string, string[]>;
  getLegalInfo: (title: string) => { law: string; obs: string } | null;
}

export function DocumentDetailsSidebar({
  selectedDoc,
  onClose,
  isEditing,
  setIsEditing,
  handleSaveEdits,
  handleDeleteDoc,
  saving,
  editForm,
  setEditForm,
  OPCOES_DOCUMENTOS,
  getLegalInfo,
}: DocumentDetailsSidebarProps) {
  if (!selectedDoc) return null;

  return (
    <aside className="w-full md:w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-700 text-sm">Detalhes</h3>
        <button onClick={onClose}>
          <ArrowLeft size={18} className="text-slate-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="aspect-[3/4] bg-slate-100 rounded-xl border flex items-center justify-center overflow-hidden relative group">
          {selectedDoc.file_url.toLowerCase().endsWith('.pdf') ? (
            <iframe src={selectedDoc.file_url} className="w-full h-full" title="Preview" />
          ) : (
            <img src={selectedDoc.file_url} alt="Preview" className="w-full h-full object-contain" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <a href={selectedDoc.file_url} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full">
              <Eye size={20} />
            </a>
            <a href={selectedDoc.file_url} download className="p-3 bg-white rounded-full">
              <Download size={20} />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Metadados</h4>
            <button
              onClick={() => (isEditing ? handleSaveEdits() : setIsEditing(true))}
              className="text-xs flex items-center gap-1 text-blue-600 font-bold"
            >
              {isEditing ? (
                <>
                  <Save size={12} /> Salvar
                </>
              ) : (
                <>
                  <Edit2 size={12} /> Editar
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Nome</label>
              <div className="relative">
                <select
                  disabled={!isEditing}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-white appearance-none disabled:bg-slate-50"
                >
                  <option value="">Selecione...</option>
                  {(OPCOES_DOCUMENTOS[editForm.category] || []).map((opt: string, i: number) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Outros">Outros</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
              {editForm.title === 'Outros' && (
                <input
                  disabled={!isEditing}
                  value={editForm.customTitle}
                  onChange={(e) => setEditForm({ ...editForm, customTitle: e.target.value })}
                  className="w-full p-2 mt-2 border rounded-lg text-sm"
                  placeholder="Nome personalizado"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Data</label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={editForm.reference_date}
                  onChange={(e) => setEditForm({ ...editForm, reference_date: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Categoria</label>
                <select
                  disabled={!isEditing}
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ClientDocument['category'] })}
                  className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50"
                >
                  <option value="Provas">Provas</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Processual">Processual</option>
                  <option value="Diversos">Diversos</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Descrição</label>
              <textarea
                disabled={!isEditing}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm disabled:bg-slate-50"
                rows={3}
              />
            </div>

            {/* FUNDAMENTAÇÃO LEGAL */}
            {getLegalInfo(selectedDoc.title) && (
              <div className="mt-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <h5 className="font-bold text-blue-800 text-xs mb-2 flex items-center gap-1">
                  <Scale size={12} /> Fundamentação Jurídica
                </h5>
                <p className="text-xs text-blue-900 font-medium mb-1">{getLegalInfo(selectedDoc.title)?.law}</p>
                <p className="text-xs text-blue-700 italic opacity-80">{getLegalInfo(selectedDoc.title)?.obs}</p>
              </div>
            )}

            <div className="pt-2 text-right">
              <span className="text-[10px] text-slate-400">
                Origem: <span className="font-mono text-slate-600">{selectedDoc.source_origin}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t bg-slate-50">
        <button
          onClick={handleDeleteDoc}
          disabled={saving}
          className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Excluir Documento
        </button>
      </div>
    </aside>
  );
}
