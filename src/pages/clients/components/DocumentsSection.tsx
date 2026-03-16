import { FolderOpen, AlertCircle, FileText, Eye } from "lucide-react";

interface DocumentsSectionProps {
  documents: any[];
  failedDocs: string[];
  selectedDocs: string[];
  toggleDoc: (docId: string) => void;
  ocrTexts: Record<string, string>;
  showOcr: string | null;
  setShowOcr: (docId: string | null) => void;
}

export function DocumentsSection({
  documents,
  failedDocs,
  selectedDocs,
  toggleDoc,
  ocrTexts,
  showOcr,
  setShowOcr
}: DocumentsSectionProps) {
  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
        <FolderOpen size={16} /> 2. Provas do GED
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        Selecione os documentos que deseja incluir na análise da IA. Os textos extraídos serão usados como fatos.
      </p>

      {failedDocs.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Falha ao processar:</span> {failedDocs.join(", ")}. Verifique o formato ou tente novamente.
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2">
        {documents.length === 0 ? (
          <p className="text-center text-slate-400 py-4">Nenhum documento na categoria Provas.</p>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg border-b last:border-0">
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc.id)}
                onChange={() => toggleDoc(doc.id)}
                className="mt-1"
              />
              <FileText size={16} className="text-slate-400 mt-1" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{doc.title}</span>
                  <span className="text-xs text-slate-400">
                    {doc.reference_date ? doc.reference_date.split('-').reverse().join('/') : 'S/D'}
                  </span>
                </div>
                {ocrTexts[doc.id] && (
                  <button
                    onClick={() => setShowOcr(showOcr === doc.id ? null : doc.id)}
                    className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                  >
                    <Eye size={12} /> {showOcr === doc.id ? 'Ocultar texto extraído' : 'Ver texto extraído'}
                  </button>
                )}
                {showOcr === doc.id && ocrTexts[doc.id] && (
                  <div className="mt-2 p-2 bg-slate-100 rounded text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {ocrTexts[doc.id]}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
