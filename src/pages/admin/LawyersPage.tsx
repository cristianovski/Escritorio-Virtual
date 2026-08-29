import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  FileText,
  Hash,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lawyer } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Surface } from '../../components/ui/Surface';

interface LawyerExtended extends Lawyer {
  nacionalidade?: string;
}

type LawyerFormData = Partial<LawyerExtended>;

const EMPTY_FORM: LawyerFormData = {
  nome: '',
  nacionalidade: 'Brasileiro',
  estado_civil: 'Casado',
  oab: '',
  cpf: '',
};

const fieldClassName =
  'h-11 w-full rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-60';

async function loadLawyers() {
  const { data, error } = await supabase.from('lawyers').select('*').order('nome');
  if (error) throw error;
  return (data || []) as LawyerExtended[];
}

function validarCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i += 1) {
    soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10), 10)) return false;
  soma = 0;
  for (let i = 1; i <= 10; i += 1) {
    soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11), 10)) return false;
  return true;
}

function LawyersSkeleton() {
  return (
    <Surface padding="none" role="status" aria-live="polite">
      <span className="sr-only">Carregando equipe jurídica…</span>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse flex-col gap-4 border-b border-border/70 p-4 motion-reduce:animate-none last:border-0 sm:flex-row sm:items-center sm:p-5"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-44 max-w-full rounded bg-secondary" />
            <div className="h-3 w-64 max-w-full rounded bg-secondary" />
          </div>
          <div className="h-11 w-full rounded-control bg-secondary sm:w-28" />
        </div>
      ))}
    </Surface>
  );
}

export function LawyersPage({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const { confirm, isOpen, message, handleConfirm, handleCancel } = useConfirm();

  const [lawyers, setLawyers] = useState<LawyerExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [officeAddress, setOfficeAddress] = useState(
    () => localStorage.getItem('officeAddress') || '',
  );
  const [formData, setFormData] = useState<LawyerFormData>(EMPTY_FORM);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      setLawyers(await loadLawyers());
    } catch (error: unknown) {
      console.error('Falha ao carregar equipe jurídica:', error);
      toast({
        title: 'Equipe indisponível',
        description: 'Não foi possível carregar os advogados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchLawyers();
  }, [fetchLawyers]);

  const resetForm = () => setFormData(EMPTY_FORM);

  const handleSaveLawyer = async () => {
    if (!formData.nome || !formData.oab || !formData.cpf) {
      toast({
        title: 'Atenção',
        description: 'Nome, OAB e CPF são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    if (!validarCPF(formData.cpf)) {
      toast({ title: 'Erro', description: 'CPF inválido!', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: formData.nome,
        nacionalidade: formData.nacionalidade,
        estado_civil: formData.estado_civil,
        oab: formData.oab,
        cpf: formData.cpf,
      };

      const { error } = formData.id
        ? await supabase.from('lawyers').update(payload).eq('id', formData.id)
        : await supabase.from('lawyers').insert([payload]);
      if (error) throw error;

      setShowModal(false);
      resetForm();
      await fetchLawyers();
      toast({ title: 'Advogado salvo', description: 'Os dados foram atualizados.', variant: 'success' });
    } catch (error: unknown) {
      console.error('Falha ao salvar advogado:', error);
      toast({
        title: 'Não foi possível salvar',
        description: 'Nenhuma confirmação foi registrada. Revise a conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSaveLawyer();
  };

  const handleSaveAddress = () => {
    localStorage.setItem('officeAddress', officeAddress);
    toast({
      title: 'Sucesso',
      description: 'Endereço do escritório atualizado!',
      variant: 'success',
    });
  };

  const handleEdit = (lawyer: LawyerExtended) => {
    setFormData(lawyer);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm('Remover este advogado?');
    if (ok) {
      try {
        const { error } = await supabase.from('lawyers').delete().eq('id', id);
        if (error) throw error;
        await fetchLawyers();
        toast({ title: 'Advogado removido', description: 'O cadastro foi excluído.', variant: 'success' });
      } catch (error: unknown) {
        console.error('Falha ao remover advogado:', error);
        toast({
          title: 'Não foi possível remover',
          description: 'O cadastro foi mantido. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData((current) => ({ ...current, cpf: value }));
  };

  const openNewLawyerDialog = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-content space-y-8 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Equipe jurídica"
          description="Mantenha os dados usados na geração de procurações e documentos do escritório."
          leading={(
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="flex h-11 w-11 items-center justify-center rounded-control text-muted-foreground outline-none transition-colors hover:bg-border/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
          )}
          actions={(
            <Button onClick={openNewLawyerDialog}>
              <Plus size={17} aria-hidden="true" />
              Novo advogado
            </Button>
          )}
        />

        <section aria-labelledby="office-address-title">
          <Surface className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end" padding="lg">
            <div className="min-w-0">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary text-muted-foreground" aria-hidden="true">
                  <Building2 size={18} />
                </span>
                <div>
                  <h2 id="office-address-title" className="text-base font-semibold tracking-[-0.015em] text-foreground">
                    Endereço do escritório
                  </h2>
                  <p id="office-address-description" className="mt-1 text-sm leading-6 text-muted-foreground">
                    Este endereço será utilizado nas procurações de todos os advogados.
                  </p>
                </div>
              </div>
              <label htmlFor="office-address" className="mb-1.5 block text-sm font-medium text-foreground">
                Endereço completo
              </label>
              <input
                id="office-address"
                className={fieldClassName}
                placeholder="Rua, número, bairro, cidade e estado"
                value={officeAddress}
                onChange={(event) => setOfficeAddress(event.target.value)}
                aria-describedby="office-address-description"
                autoComplete="street-address"
              />
            </div>
            <Button variant="outline" onClick={handleSaveAddress} className="w-full lg:w-auto">
              <Save size={16} aria-hidden="true" />
              Salvar endereço
            </Button>
          </Surface>
        </section>

        <section aria-labelledby="lawyers-title" className="space-y-4">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 id="lawyers-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Advogados cadastrados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dados profissionais disponíveis para os documentos do escritório.
              </p>
            </div>
            {!loading ? (
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground" aria-live="polite">
                {lawyers.length} {lawyers.length === 1 ? 'advogado' : 'advogados'}
              </span>
            ) : null}
          </div>

          {loading ? (
            <LawyersSkeleton />
          ) : lawyers.length === 0 ? (
            <Surface padding="none">
              <EmptyState
                icon={<BriefcaseBusiness aria-hidden="true" />}
                title="Nenhum advogado cadastrado"
                description="Adicione o primeiro profissional para preencher procurações e documentos."
                action={(
                  <Button onClick={openNewLawyerDialog}>
                    <Plus size={16} aria-hidden="true" />
                    Novo advogado
                  </Button>
                )}
              />
            </Surface>
          ) : (
            <Surface padding="none" className="overflow-hidden">
              <ul className="divide-y divide-border/70">
                {lawyers.map((lawyer) => (
                  <li key={lawyer.id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium uppercase text-foreground" aria-hidden="true">
                          {lawyer.nome?.trim().charAt(0) || '?'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-foreground">
                              {lawyer.nome || 'Advogado sem nome'}
                            </h3>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              OAB {lawyer.oab}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound size={13} aria-hidden="true" />
                              {lawyer.nacionalidade}, {lawyer.estado_civil}
                            </span>
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                              <Hash size={13} aria-hidden="true" />
                              CPF {lawyer.cpf}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-border/70 pt-3 sm:border-0 sm:pt-0">
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={() => handleEdit(lawyer)}
                        >
                          Editar
                        </Button>
                        {lawyer.id != null ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remover ${lawyer.nome || 'advogado'}`}
                            className="shrink-0 text-danger hover:bg-danger-subtle hover:text-danger-foreground"
                            onClick={() => void handleDelete(lawyer.id as number)}
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Surface>
          )}
        </section>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => !saving && setShowModal(open)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-16 sm:px-6 sm:pt-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-control bg-secondary text-muted-foreground" aria-hidden="true">
              <FileText size={18} />
            </div>
            <DialogTitle>{formData.id ? 'Editar advogado' : 'Novo advogado'}</DialogTitle>
            <DialogDescription>
              Informe os dados que serão utilizados nas procurações.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div>
                <label htmlFor="lawyer-name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <input
                  id="lawyer-name"
                  className={fieldClassName}
                  value={formData.nome || ''}
                  onChange={(event) => setFormData((current) => ({ ...current, nome: event.target.value }))}
                  placeholder="Nome do advogado"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="lawyer-oab" className="mb-1.5 block text-sm font-medium text-foreground">
                    Número da OAB
                  </label>
                  <input
                    id="lawyer-oab"
                    className={fieldClassName}
                    value={formData.oab || ''}
                    onChange={(event) => setFormData((current) => ({ ...current, oab: event.target.value }))}
                    placeholder="UF 00.000"
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lawyer-cpf" className="mb-1.5 block text-sm font-medium text-foreground">
                    CPF
                  </label>
                  <input
                    id="lawyer-cpf"
                    className={fieldClassName}
                    value={formData.cpf || ''}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="lawyer-nationality" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nacionalidade
                  </label>
                  <input
                    id="lawyer-nationality"
                    className={fieldClassName}
                    value={formData.nacionalidade || ''}
                    onChange={(event) => setFormData((current) => ({ ...current, nacionalidade: event.target.value }))}
                    autoComplete="country-name"
                  />
                </div>
                <div>
                  <label htmlFor="lawyer-marital-status" className="mb-1.5 block text-sm font-medium text-foreground">
                    Estado civil
                  </label>
                  <select
                    id="lawyer-marital-status"
                    className={fieldClassName}
                    value={formData.estado_civil || 'Casado'}
                    onChange={(event) => setFormData((current) => ({ ...current, estado_civil: event.target.value }))}
                  >
                    <option value="Solteiro">Solteiro(a)</option>
                    <option value="Casado">Casado(a)</option>
                    <option value="Divorciado">Divorciado(a)</option>
                    <option value="Viúvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border/70 bg-secondary/35 px-5 py-4 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={saving}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar advogado'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
