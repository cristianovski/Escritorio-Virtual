import { useRef } from 'react';
import { ArrowLeft, Plus, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { Client } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { useDocumentEditor } from '../../hooks/useDocumentEditor';

import { DocumentUploadModal } from './components/DocumentUploadModal';
import { DocumentDetailsSidebar } from './components/DocumentDetailsSidebar';
import { DocumentList } from './components/DocumentList';

interface PageProps {
  cliente: Client;
  onBack: () => void;
}

export function ClientDocumentsManager({ cliente, onBack }: PageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    filteredDocs,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    refresh,
  } = useDocuments(cliente.id);

  const {
    uploading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    fileToUpload,
    uploadMetadata,
    setUploadMetadata,
    handleFileSelect,
    confirmUpload,
  } = useDocumentUpload(cliente.id, refresh);

  const {
    selectedDoc,
    isEditing,
    saving,
    editForm,
    setEditForm,
    handleSelectDoc,
    handleSaveEdits,
    handleDeleteDoc,
    getLegalInfo,
    setIsEditing,
    OPCOES_DOCUMENTOS,
  } = useDocumentEditor(refresh);

  const formatDate = (date?: string | null) => {
    if (!date) return 'S/D';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) return <FileText className="text-red-500" />;
    return <ImageIcon className="text-blue-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 font-sans">
      <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">Gestão de Documentos</h1>
            <p className="text-xs text-slate-500">
              Centralizando {filteredDocs.length} provas de {cliente.nome}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {uploading ? <UploadCloud className="animate-bounce" size={16} /> : <Plus size={16} />}
            {uploading ? 'Enviando...' : 'Novo Upload'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LISTAGEM */}
        <DocumentList
          filteredDocs={filteredDocs}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDoc={selectedDoc}
          handleSelectDoc={handleSelectDoc}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />

        {/* DETALHES */}
        <DocumentDetailsSidebar
          selectedDoc={selectedDoc}
          onClose={() => handleSelectDoc(selectedDoc!)}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSaveEdits={handleSaveEdits}
          handleDeleteDoc={handleDeleteDoc}
          saving={saving}
          editForm={editForm}
          setEditForm={setEditForm}
          OPCOES_DOCUMENTOS={OPCOES_DOCUMENTOS}
          getLegalInfo={getLegalInfo}
        />
      </div>

      {/* MODAL UPLOAD */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        fileToUpload={fileToUpload}
        uploadMetadata={uploadMetadata}
        setUploadMetadata={setUploadMetadata}
        confirmUpload={confirmUpload}
        uploading={uploading}
      />
    </div>
  );
}
