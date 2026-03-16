import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../../utils/benefitRules';

interface LegalAnalysisResultProps {
  analiseJuridica: AnalysisResult | null;
}

export function LegalAnalysisResult({ analiseJuridica }: LegalAnalysisResultProps) {
  if (!analiseJuridica) return null;

  return (
    <div
      className={`p-5 rounded-2xl border shadow-sm transition-all animate-in zoom-in-95 ${
        analiseJuridica.status === 'aprovado'
          ? 'bg-emerald-50 border-emerald-200'
          : analiseJuridica.status === 'rejeitado'
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${
            analiseJuridica.status === 'aprovado'
              ? 'bg-emerald-100 text-emerald-600'
              : analiseJuridica.status === 'rejeitado'
              ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {analiseJuridica.status === 'aprovado' ? (
            <CheckCircle size={24} />
          ) : analiseJuridica.status === 'rejeitado' ? (
            <XCircle size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-lg mb-2 capitalize ${
              analiseJuridica.status === 'aprovado'
                ? 'text-emerald-800'
                : analiseJuridica.status === 'rejeitado'
                ? 'text-red-800'
                : 'text-amber-800'
            }`}
          >
            {analiseJuridica.status === 'aprovado'
              ? 'Viável Juridicamente'
              : analiseJuridica.status === 'rejeitado'
              ? 'Inviável (Requisitos não cumpridos)'
              : 'Atenção: Risco Moderado'}
          </h3>
          <ul className="space-y-1">
            {analiseJuridica.messages.map((msg, idx) => (
              <li key={idx} className="text-sm font-medium opacity-90 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0"></span>
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
