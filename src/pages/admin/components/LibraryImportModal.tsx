import { UploadCloud, X } from "lucide-react";

interface LibraryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importJson: string;
  setImportJson: (val: string) => void;
  handleImportJson: () => void;
}

export function LibraryImportModal({
  isOpen,
  onClose,
  importJson,
  setImportJson,
  handleImportJson
}: LibraryImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-emerald-50 rounded-t-2xl">
          <h2 className="font-bold text-lg text-emerald-800 flex items-center gap-2">
            <UploadCloud size={20} /> Importar do NotebookLM
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-800/50 hover:text-emerald-800"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Cole abaixo o JSON gerado pelo NotebookLM.
          </p>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="w-full h-64 border border-slate-300 rounded-lg p-4 text-xs font-mono bg-slate-900 text-emerald-400 outline-none"
            placeholder='[ { "title": "...", "category": "Modelo", "content": "..." } ]'
          />
        </div>
        <div className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleImportJson}
            className="px-6 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-500 rounded-lg text-sm shadow-lg"
          >
            Processar
          </button>
        </div>
      </div>
    </div>
  );
}
