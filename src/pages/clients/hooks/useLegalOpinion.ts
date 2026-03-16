import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { analisarViabilidade, AnalysisResult, ClientData } from "../../../utils/benefitRules";
import { useToast } from "../../../hooks/use-toast";
import { Client } from "../../../types";

export const BENEFIT_TYPES = [
  "Aposentadoria por Idade Rural",
  "Salário Maternidade Rural",
  "Aposentadoria Híbrida",
  "Auxílio por incapacidade temporária",
  "Auxílio por incapacidade permanente",
  "Pensão por morte"
];

export function useLegalOpinion(cliente: Client) {
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [parecerIA, setParecerIA] = useState("");
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string | null>(null);

  // Documentos
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [failedDocs, setFailedDocs] = useState<string[]>([]);
  const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
  const [showOcr, setShowOcr] = useState<string | null>(null);

  // Teses da Biblioteca
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<string>("");

  // Entradas Manuais para o Simulador
  const [tempoRural, setTempoRural] = useState(15);
  const [tempoUrbano, setTempoUrbano] = useState(0);
  const [selectedBenefit, setSelectedBenefit] = useState(BENEFIT_TYPES[0]);

  const [extraParams, setExtraParams] = useState({
    data_dii: "",
    is_acidente: false,
    data_obito: "",
    data_casamento: "",
    idade_conjuge_obito: 0
  });

  const [resultado, setResultado] = useState<AnalysisResult | null>(null);

  // Buscar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setClient(cliente); // usa o cliente passado
      await Promise.all([
        fetchTheses(),
        fetchDocuments()
      ]);
      setLoading(false);
    };
    loadData();
  }, [cliente]);

  // Recalcular viabilidade quando os parâmetros mudarem
  useEffect(() => {
    if (client) {
      const dadosAnalise: ClientData = {
        sexo: client.sexo || 'Masculino',
        data_nascimento: client.data_nascimento || '',
        profissao: client.profissao || '', // <-- CORREÇÃO: adicionado fallback para string vazia
        possui_cnpj: client.possui_cnpj,
        possui_outra_renda: client.possui_outra_renda,
        tempo_rural_anos: tempoRural,
        tempo_urbano_anos: tempoUrbano,
        ...extraParams
      };
      const analise = analisarViabilidade(selectedBenefit, dadosAnalise);
      setResultado(analise);
    }
  }, [client, selectedBenefit, tempoRural, tempoUrbano, extraParams]);

  const fetchTheses = async () => {
      const { data } = await supabase
        .from('library_theses')
        .select('id, title, content, category')
        .eq('active', true)
        .order('title');

      if (data && data.length > 0) {
          setTheses(data);
          setSelectedThesisId(data[0].id.toString());
      }
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', cliente.id)
      .eq('category', 'Provas')
      .order('reference_date', { ascending: false });

    if (data) {
      setDocuments(data);
      // Buscar cache de OCR para esses documentos
      const ids = data.map(d => d.id);
      const { data: cache } = await supabase
        .from('document_ocr_cache')
        .select('document_id, extracted_text')
        .in('document_id', ids);

      if (cache) {
        const ocrMap: Record<string, string> = {};
        cache.forEach(item => { ocrMap[item.document_id] = item.extracted_text; });
        setOcrTexts(ocrMap);
      }
    }
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleGenerateOpinion = async () => {
    console.log("1️⃣ Iniciando geração de parecer");

    if (!client) {
      console.log("❌ Cliente não encontrado");
      return;
    }
    if (!selectedThesisId) {
      toast({ title: "Atenção", description: "Selecione uma tese da biblioteca.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setFailedDocs([]);

    try {
      console.log("2️⃣ Preparando requisição para função");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analisar-documentos`;
      console.log("URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          clientId: cliente.id,
          thesisId: selectedThesisId,
          documentIds: selectedDocs
        })
      });

      console.log("3️⃣ Resposta recebida, status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("4️⃣ Resposta de erro (texto):", errorText);
        throw new Error(`Erro ${response.status}: ${errorText.substring(0, 200)}`);
      }

      console.log("5️⃣ Resposta OK, lendo JSON...");
      const data = await response.json();
      console.log("6️⃣ JSON lido com sucesso");

      setParecerIA(data.parecer);
      setFailedDocs(data.failedDocs || []);
      setLastAnalysisDate(new Date().toISOString());

      toast({ title: "Sucesso", description: "Parecer gerado com IA.", variant: "success" });

      console.log("8️⃣ Recarregando documentos...");
      await fetchDocuments();

    } catch (err: any) {
      console.error("❌ Erro capturado:", err);
      console.error("Stack do erro:", err?.stack);
      toast({
        title: "Erro",
        description: err?.message || "Erro ao gerar parecer. Verifique o console.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      console.log("9️⃣ Finalizado");
    }
  };

  return {
    client,
    loading,
    generating,
    parecerIA,
    lastAnalysisDate,
    documents,
    selectedDocs,
    failedDocs,
    ocrTexts,
    showOcr,
    theses,
    selectedThesisId,
    tempoRural,
    tempoUrbano,
    selectedBenefit,
    extraParams,
    resultado,
    setShowOcr,
    setSelectedThesisId,
    setTempoRural,
    setTempoUrbano,
    setSelectedBenefit,
    setExtraParams,
    toggleDoc,
    handleGenerateOpinion
  };
}
