import { useEffect, useRef } from 'react';
import {
  AlertCircle, ArrowLeft, Calendar, Check, ChevronDown, Download, Edit2, Eye,
  FileText, Image as ImageIcon, MessageSquare, Plus, Save, Scale, Search,
  Trash2, UploadCloud,
} from 'lucide-react';
import { Client, ClientDocument } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { useDocumentEditor } from '../../hooks/useDocumentEditor';
import { Button } from '../../components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Surface } from '../../components/ui/Surface';
import { cn } from '../../lib/utils';

interface PageProps {
  cliente: Client;
  onBack: () => void;
}

const DOCUMENT_FILTERS = ['Todos', 'Provas', 'Pessoal', 'Processual', 'Diversos'];
const fieldClassName = 'min-h-11 w-full rounded-control border border-input bg-surface-subtle/55 px-3 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 disabled:border-transparent disabled:bg-secondary/55 disabled:text-muted-foreground';
const labelClassName = 'mb-1.5 block text-sm font-medium text-foreground';

export function ClientDocumentsManager({ cliente, onBack }: PageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailsHeadingRef = useRef<HTMLHeadingElement>(null);
  const {
    filteredDocs, loading, filter, setFilter, searchTerm, setSearchTerm, refresh,
  } = useDocuments(cliente.id);
  const {
    uploading, isUploadModalOpen, setIsUploadModalOpen, fileToUpload,
    uploadMetadata, setUploadMetadata, handleFileSelect, confirmUpload,
  } = useDocumentUpload(cliente.id, refresh);
  const {
    selectedDoc, selectedDownloadUrl, selectedAccessError, isEditing, saving,
    editForm, setEditForm, handleSelectDoc, closeSelectedDoc, handleSaveEdits,
    handleDeleteDoc, getLegalInfo, setIsEditing, OPCOES_DOCUMENTOS,
  } = useDocumentEditor(refresh);

  const formatDate = (date?: string | null) => {
    if (!date) return 'Sem data';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const getFileIcon = (url: string) => {
    const isPdf = url.toLocaleLowerCase().split('?')[0].endsWith('.pdf');
    return isPdf ? (
      <FileText aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
    ) : (
      <ImageIcon aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
    );
  };

  const legalInfo = selectedDoc ? getLegalInfo(selectedDoc.title) : null;
  const selectedDocumentIsPdf = selectedDoc
    ? selectedDoc.file_url.toLocaleLowerCase().split('?')[0].endsWith('.pdf')
    : false;
  const hasActiveFilters = Boolean(searchTerm.trim()) || filter !== 'Todos';
  const selectedDocumentId = selectedDoc?.id;
  const resultDescription = hasActiveFilters
    ? `${filteredDocs.length} ${filteredDocs.length === 1 ? 'resultado' : 'resultados'}`
    : `${filteredDocs.length} ${filteredDocs.length === 1 ? 'documento' : 'documentos'}`;

  useEffect(() => {
    if (selectedDocumentId !== undefined) detailsHeadingRef.current?.focus();
  }, [selectedDocumentId]);

  const handleCloseDetails = () => {
    const selectedDocumentId = selectedDoc?.id;
    closeSelectedDoc();

    if (selectedDocumentId !== undefined) {
      requestAnimationFrame(() => {
        document.getElementById(`document-${selectedDocumentId}`)?.focus();
      });
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <header className="shrink-0 border-b border-border/90 bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex w-full max-w-content flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Voltar" className="shrink-0 rounded-full">
                <ArrowLeft aria-hidden="true" size={19} />
              </Button>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-medium text-brand">Documentos do cliente</p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.03em]">Gestão de documentos</h1>
                <p className="mt-1 truncate text-sm text-muted-foreground">{resultDescription} de {cliente.nome}</p>
              </div>
            </div>
            <div className="sm:shrink-0">
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-busy={uploading}
                className="w-full sm:w-auto"
              >
                {uploading
                  ? <UploadCloud aria-hidden="true" className="animate-pulse motion-reduce:animate-none" size={17} />
                  : <Plus aria-hidden="true" size={17} />}
                <span aria-live="polite">{uploading ? 'Enviando…' : 'Novo documento'}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex min-h-0 w-full max-w-content flex-1 overflow-hidden">
          <section
            aria-labelledby="document-list-title"
            className={cn('min-w-0 flex-1 flex-col', selectedDoc ? 'hidden md:flex' : 'flex')}
          >
            <h2 id="document-list-title" className="sr-only">Lista de documentos</h2>
            <div className="shrink-0 space-y-3 border-b border-border/90 bg-background px-4 py-4 sm:px-6">
              <div>
                <label htmlFor="document-search" className="sr-only">Buscar documento pelo nome</label>
                <div className="relative">
                  <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="document-search"
                    type="search"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar documento"
                    className="h-11 w-full rounded-control border border-input bg-surface-subtle/55 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar documentos por categoria">
                {DOCUMENT_FILTERS.map((item) => {
                  const active = filter === item;
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setFilter(item)}
                      aria-pressed={active}
                      className={cn(
                        'min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        active
                          ? 'bg-brand-subtle text-brand'
                          : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {loading ? (
                <div className="space-y-2" role="status" aria-live="polite" aria-busy="true">
                  <span className="sr-only">Carregando documentos</span>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-[5.25rem] animate-pulse rounded-surface bg-card shadow-panel motion-reduce:animate-none" />
                  ))}
                </div>
              ) : filteredDocs.length === 0 ? (
                <EmptyState
                  icon={<FileText aria-hidden="true" />}
                  title={hasActiveFilters ? 'Nenhum documento encontrado' : 'Nenhum documento adicionado'}
                  description={hasActiveFilters
                    ? 'Revise a busca ou escolha outra categoria.'
                    : 'Adicione o primeiro arquivo para organizar os documentos deste cliente.'}
                  action={hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setSearchTerm(''); setFilter('Todos'); }}
                    >
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                      <Plus aria-hidden="true" size={17} /> Adicionar documento
                    </Button>
                  )}
                />
              ) : (
                <ul className="space-y-2" aria-label={resultDescription}>
                  {filteredDocs.map((doc) => {
                    const selected = selectedDoc?.id === doc.id;
                    const metadataId = `document-metadata-${doc.id}`;
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          id={`document-${doc.id}`}
                          onClick={() => handleSelectDoc(doc)}
                          aria-pressed={selected}
                          aria-describedby={metadataId}
                          className={cn(
                            'flex min-h-[5.25rem] w-full items-start gap-3 rounded-surface bg-card p-4 text-left shadow-panel ring-1 ring-border/80 transition-all duration-200 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-4',
                            selected
                              ? 'bg-brand-subtle ring-brand/20'
                              : 'hover:bg-secondary/35',
                          )}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary" aria-hidden="true">
                            {getFileIcon(doc.file_url)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">{doc.title || 'Documento sem nome'}</span>
                            <span id={metadataId} className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="rounded-full bg-secondary px-2 py-1 text-foreground">{doc.category}</span>
                              <span className="inline-flex items-center gap-1.5 tabular-nums">
                                <Calendar aria-hidden="true" size={13} /> {formatDate(doc.reference_date)}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {selectedDoc ? (
            <aside
              aria-labelledby="document-details-title"
              className="flex min-h-0 w-full shrink-0 flex-col bg-card md:w-[22rem] md:border-l md:border-border/90 xl:w-[28rem]"
            >
              <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/90 px-4 sm:px-5">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Documento selecionado</p>
                  <h2
                    ref={detailsHeadingRef}
                    id="document-details-title"
                    tabIndex={-1}
                    className="mt-0.5 truncate text-base font-semibold tracking-[-0.015em] outline-none"
                  >
                    {selectedDoc.title || 'Documento sem nome'}
                  </h2>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={handleCloseDetails} aria-label="Fechar detalhes e voltar à lista" className="shrink-0 rounded-full">
                  <ArrowLeft aria-hidden="true" size={18} />
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
                <div className="space-y-6">
                  <section aria-label="Pré-visualização do documento" className="space-y-3">
                    <Surface variant="subtle" padding="none" className="relative flex aspect-[4/5] max-h-[34rem] items-center justify-center overflow-hidden">
                      {selectedAccessError ? (
                        <div className="max-w-xs p-6 text-center text-muted-foreground" role="alert">
                          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-warning-subtle text-warning">
                            <AlertCircle aria-hidden="true" size={22} />
                          </span>
                          <p className="mt-4 text-sm font-medium text-foreground">Pré-visualização indisponível</p>
                          <p className="mt-1.5 text-xs leading-5">{selectedAccessError}</p>
                        </div>
                      ) : selectedDocumentIsPdf ? (
                        <iframe src={selectedDoc.file_url} className="h-full w-full bg-card" title={`Pré-visualização de ${selectedDoc.title}`} />
                      ) : (
                        <img src={selectedDoc.file_url} alt={`Pré-visualização de ${selectedDoc.title}`} className="h-full w-full object-contain" />
                      )}
                    </Surface>
                    {!selectedAccessError && selectedDownloadUrl ? (
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={selectedDoc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-secondary px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Eye aria-hidden="true" size={17} /> Abrir
                        </a>
                        <a
                          href={selectedDownloadUrl}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-secondary px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Download aria-hidden="true" size={17} /> Baixar
                        </a>
                      </div>
                    ) : null}
                  </section>

                  <section aria-labelledby="document-metadata-title">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 id="document-metadata-title" className="text-base font-semibold tracking-[-0.015em]">Informações</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {isEditing ? 'Edite os dados de organização.' : 'Dados usados para localizar o arquivo.'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={isEditing ? 'default' : 'ghost'}
                        onClick={() => (isEditing ? void handleSaveEdits() : setIsEditing(true))}
                        disabled={saving}
                        aria-busy={saving}
                        className="shrink-0"
                      >
                        {isEditing ? <Save aria-hidden="true" size={16} /> : <Edit2 aria-hidden="true" size={16} />}
                        {saving ? 'Salvando…' : isEditing ? 'Salvar' : 'Editar'}
                      </Button>
                    </div>

                    <Surface variant="subtle" padding="md" className="space-y-4 shadow-none ring-0">
                      <div>
                        <label htmlFor="document-title" className={labelClassName}>Nome</label>
                        <div className="relative">
                          <select
                            id="document-title"
                            disabled={!isEditing}
                            value={editForm.title}
                            onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                            className={cn(fieldClassName, 'appearance-none pr-10')}
                          >
                            <option value="">Selecione…</option>
                            {(OPCOES_DOCUMENTOS[editForm.category] || []).map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                            <option value="Outros">Outros</option>
                          </select>
                          <ChevronDown aria-hidden="true" size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        {editForm.title === 'Outros' ? (
                          <div className="mt-3">
                            <label htmlFor="document-custom-title" className="sr-only">Nome personalizado</label>
                            <input
                              id="document-custom-title"
                              disabled={!isEditing}
                              value={editForm.customTitle}
                              onChange={(event) => setEditForm({ ...editForm, customTitle: event.target.value })}
                              className={fieldClassName}
                              placeholder="Nome personalizado"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                        <div>
                          <label htmlFor="document-reference-date" className={labelClassName}>Data de referência</label>
                          <input
                            id="document-reference-date"
                            type="date"
                            disabled={!isEditing}
                            value={editForm.reference_date}
                            onChange={(event) => setEditForm({ ...editForm, reference_date: event.target.value })}
                            className={fieldClassName}
                          />
                        </div>
                        <div>
                          <label htmlFor="document-category" className={labelClassName}>Categoria</label>
                          <select
                            id="document-category"
                            disabled={!isEditing}
                            value={editForm.category}
                            onChange={(event) => setEditForm({ ...editForm, category: event.target.value as ClientDocument['category'] })}
                            className={fieldClassName}
                          >
                            <option value="Provas">Provas</option><option value="Pessoal">Pessoal</option>
                            <option value="Processual">Processual</option><option value="Diversos">Diversos</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="document-description" className={labelClassName}>Descrição</label>
                        <textarea
                          id="document-description"
                          disabled={!isEditing}
                          value={editForm.description}
                          onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                          className={cn(fieldClassName, 'min-h-24 resize-y')}
                          rows={3}
                        />
                      </div>

                      {legalInfo ? (
                        <div className="rounded-control bg-info-subtle p-4 text-info-foreground">
                          <h4 className="flex items-center gap-2 text-sm font-medium"><Scale aria-hidden="true" size={16} /> Fundamentação jurídica</h4>
                          <p className="mt-2 text-xs font-medium leading-5">{legalInfo.law}</p>
                          <p className="mt-1 text-xs leading-5 opacity-80">{legalInfo.obs}</p>
                        </div>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Origem: <span className="font-mono text-foreground">{selectedDoc.source_origin || 'Não informada'}</span>
                      </p>
                    </Surface>
                  </section>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleDeleteDoc()}
                    disabled={saving}
                    className="w-full border-danger/25 text-danger hover:bg-danger-subtle hover:text-danger focus-visible:ring-danger"
                  >
                    <Trash2 aria-hidden="true" size={17} /> Excluir documento
                  </Button>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={(open) => { if (!uploading) setIsUploadModalOpen(open); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg gap-0 overflow-y-auto p-0" aria-busy={uploading}>
          <DialogHeader className="px-5 pb-4 pt-6 pr-16 text-left sm:px-6 sm:pt-6">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-brand-subtle text-brand">
              <UploadCloud aria-hidden="true" size={21} />
            </span>
            <DialogTitle className="text-xl tracking-[-0.025em]">Adicionar documento</DialogTitle>
            <DialogDescription className="leading-6">Revise o nome e os dados do arquivo antes de enviá-lo.</DialogDescription>
          </DialogHeader>

          <form onSubmit={(event) => { event.preventDefault(); void confirmUpload(); }}>
            <div className="space-y-4 px-5 pb-6 sm:px-6">
              <Surface variant="subtle" padding="sm" className="flex items-center gap-3 shadow-none ring-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-card text-muted-foreground">
                  <FileText aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Arquivo selecionado</p>
                  <p className="truncate text-sm font-medium text-foreground">{fileToUpload?.name || 'Nenhum arquivo'}</p>
                </div>
              </Surface>

              <div>
                <label htmlFor="upload-document-name" className={labelClassName}>
                  Nome do documento <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="upload-document-name"
                  type="text"
                  required
                  value={uploadMetadata.customName}
                  onChange={(event) => setUploadMetadata({ ...uploadMetadata, customName: event.target.value })}
                  className={fieldClassName}
                  placeholder="Ex.: Certidão de casamento"
                  autoFocus
                  disabled={uploading}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="upload-document-category" className={labelClassName}>Categoria</label>
                  <select
                    id="upload-document-category"
                    value={uploadMetadata.category}
                    onChange={(event) => setUploadMetadata({ ...uploadMetadata, category: event.target.value as ClientDocument['category'] })}
                    className={fieldClassName}
                    disabled={uploading}
                  >
                    <option value="Provas">Provas</option><option value="Pessoal">Pessoal</option>
                    <option value="Processual">Processual</option><option value="Diversos">Diversos</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="upload-document-date" className={labelClassName}>Data de referência</label>
                  <input
                    id="upload-document-date"
                    type="date"
                    value={uploadMetadata.date}
                    onChange={(event) => setUploadMetadata({ ...uploadMetadata, date: event.target.value })}
                    className={fieldClassName}
                    disabled={uploading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="upload-document-notes" className={cn(labelClassName, 'flex items-center gap-2')}>
                  <MessageSquare aria-hidden="true" size={15} /> Observações
                </label>
                <textarea
                  id="upload-document-notes"
                  value={uploadMetadata.userObs}
                  onChange={(event) => setUploadMetadata({ ...uploadMetadata, userObs: event.target.value })}
                  className={cn(fieldClassName, 'min-h-24 resize-y')}
                  rows={3}
                  disabled={uploading}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border/90 bg-secondary/35 px-5 py-4 sm:px-6 sm:space-x-0">
              <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancelar</Button>
              <Button type="submit" disabled={uploading || !uploadMetadata.customName.trim()} aria-busy={uploading}>
                {uploading
                  ? <UploadCloud aria-hidden="true" className="animate-pulse motion-reduce:animate-none" size={17} />
                  : <Check aria-hidden="true" size={17} />}
                <span aria-live="polite">{uploading ? 'Enviando…' : 'Adicionar'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
