import { Edit3, Plus } from "lucide-react";

interface LibraryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: number | null;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formContent: string;
  setFormContent: (val: string) => void;
  handleSave: () => void;
}

export function LibraryEditModal({
  isOpen,
  onClose,
  editingId,
  formTitle,
  setFormTitle,
  formCategory,
  setFormCategory,
  formContent,
  setFormContent,
  handleSave
}: LibraryEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}{" "}
            {editingId ? "Editar Tese" : "Nova Tese"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Título
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Categoria
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white outline-none"
              >
                <option value="Rural">Rural</option>
                <option value="Urbano">Urbano</option>
                <option value="Processual">Processual</option>
                <option value="Prompt Mestre">Prompt Mestre</option>
                <option value="Modelo">Modelo de Documento</option>
                <option value="Tese Avançada">Tese Avançada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Conteúdo (Prompt / Texto do Contrato)
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full h-64 border border-slate-300 rounded-lg p-4 text-sm font-serif outline-none resize-none"
              placeholder="Cole aqui o texto da tese ou o modelo do contrato..."
            />
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-500 rounded-lg text-sm shadow-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
