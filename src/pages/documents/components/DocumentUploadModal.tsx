import { UploadCloud, X, FileText, MessageSquare, Check } from 'lucide-react';
import { ClientDocument } from '../../../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileToUpload: File | null;
  uploadMetadata: {
    category: ClientDocument['category'];
    customName: string;
    date: string;
    userObs: string;
  };
  setUploadMetadata: (metadata: {
    category: ClientDocument['category'];
    customName: string;
    date: string;
    userObs: string;
  }) => void;
  confirmUpload: () => void;
  uploading: boolean;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  fileToUpload,
  uploadMetadata,
  setUploadMetadata,
  confirmUpload,
  uploading,
}: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <UploadCloud size={20} /> Novo Upload
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <FileText size={20} className="text-slate-500" />
            <p className="text-sm font-medium truncate text-slate-800 flex-1">{fileToUpload?.name}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Nome do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadMetadata.customName}
              onChange={(e) => setUploadMetadata({ ...uploadMetadata, customName: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm"
              placeholder="Ex: Certidão de Casamento, ITR 2023, ..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoria</label>
              <select
                value={uploadMetadata.category}
                onChange={(e) => setUploadMetadata({ ...uploadMetadata, category: e.target.value as ClientDocument['category'] })}
                className="w-full p-3 border rounded-xl text-sm"
              >
                <option value="Provas">Provas</option>
                <option value="Pessoal">Pessoal</option>
                <option value="Processual">Processual</option>
                <option value="Diversos">Diversos</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data</label>
              <input
                type="date"
                value={uploadMetadata.date}
                onChange={(e) => setUploadMetadata({ ...uploadMetadata, date: e.target.value })}
                className="w-full p-3 border rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Observações
            </label>
            <textarea
              value={uploadMetadata.userObs}
              onChange={(e) => setUploadMetadata({ ...uploadMetadata, userObs: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none"
              rows={2}
            />
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={confirmUpload}
            disabled={uploading || !uploadMetadata.customName.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : (
              <>
                <Check size={16} /> Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
