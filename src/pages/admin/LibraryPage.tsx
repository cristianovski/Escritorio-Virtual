import { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Trash2, Edit3, BookOpen,
  Search, FileText, Bookmark, UploadCloud
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { LibraryThesis } from "../../types"; // FIX: Importamos a Interface Global
import { LibraryEditModal } from "./components/LibraryEditModal";
import { LibraryImportModal } from "./components/LibraryImportModal";

interface LibraryPageProps {
  onBack: () => void;
}

export function LibraryPage({ onBack }: LibraryPageProps) {
  const [loading, setLoading] = useState(true);
  const [theses, setTheses] = useState<LibraryThesis[]>([]); // FIX: Tipagem forte
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false); 
  const [importJson, setImportJson] = useState("");

  // Estado de Edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Rural");
  const [formContent, setFormContent] = useState("");

  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('library_theses')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) console.error(error);
    else setTheses((data as LibraryThesis[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta tese?")) return;
    await supabase.from('library_theses').delete().eq('id', id);
    fetchTheses();
  };

  const handleEdit = (t: LibraryThesis) => {
    setEditingId(t.id);
    setFormTitle(t.title);
    setFormCategory(t.category);
    setFormContent(t.content);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategory("Rural");
    setFormContent("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle || !formContent) return alert("Preencha título e conteúdo.");
    const payload = { title: formTitle, category: formCategory, content: formContent, active: true };

    if (editingId) {
        await supabase.from('library_theses').update(payload).eq('id', editingId);
    } else {
        await supabase.from('library_theses').insert(payload);
    }
    setIsModalOpen(false);
    fetchTheses();
  };

  const handleImportJson = async () => {
      try {
          const cleanJson = importJson.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (!Array.isArray(parsed)) throw new Error("O formato deve ser uma lista [...]");

          let count = 0;
          for (const item of parsed) {
              const doc = item as Record<string, string>; // FIX: Tipagem de segurança para o JSON
              if (doc.title && doc.content) {
                  await supabase.from('library_theses').insert({
                      title: doc.title,
                      category: doc.category || "Geral",
                      content: doc.content,
                      active: true
                  });
                  count++;
              }
          }
          alert(`Sucesso! ${count} teses importadas.`);
          setIsImportOpen(false);
          setImportJson("");
          fetchTheses();
      } catch (err: unknown) { // FIX: Sem 'any' no catch
          const msg = err instanceof Error ? err.message : "Erro desconhecido";
          alert("Erro ao ler o JSON: " + msg);
      }
  };

  const filtered = theses.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "Todos" || t.category === filterCategory;
      return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", ...Array.from(new Set(theses.map(t => t.category)))];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
                <ArrowLeft className="text-slate-600"/>
            </button>
            <div>
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-blue-600"/> Biblioteca de Teses
                </h1>
                <p className="text-xs text-slate-500">Gerencie a "memória jurídica" da sua IA</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsImportOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 transition active:scale-95">
                <UploadCloud size={16}/> Importar
            </button>
            <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 transition active:scale-95">
                <Plus size={16}/> Nova Tese
            </button>
        </div>
      </header>

      {/* FILTROS */}
      <div className="p-4 bg-white border-b flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar tese..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      {/* LISTA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
              <div className="text-center py-20 text-slate-400">Carregando...</div>
          ) : filtered.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 font-medium">Nenhuma tese encontrada.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(thesis => (
                      <div key={thesis.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${thesis.category.includes('Modelo') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {thesis.category}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(thesis)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"><Edit3 size={14}/></button>
                                  <button onClick={() => handleDelete(thesis.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button>
                              </div>
                          </div>
                          <h3 className="font-bold text-slate-800 mb-2 leading-tight flex items-center gap-2">
                              {thesis.category === 'Prompt Mestre' && <Bookmark size={14} className="text-purple-500 fill-purple-500"/>}
                              {thesis.category.includes('Modelo') && <FileText size={14} className="text-blue-500"/>}
                              {thesis.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed font-serif bg-slate-50 p-2 rounded border border-slate-100 flex-1">
                              {thesis.content}
                          </p>
                      </div>
                  ))}
              </div>
          )}
      </main>

      {/* MODAL DE EDIÇÃO */}
      <LibraryEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formContent={formContent}
        setFormContent={setFormContent}
        handleSave={handleSave}
      />

      {/* MODAL DE IMPORTAÇÃO */}
      <LibraryImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        importJson={importJson}
        setImportJson={setImportJson}
        handleImportJson={handleImportJson}
      />
    </div>
  );
}