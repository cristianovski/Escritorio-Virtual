# Arquitetura de evolução

## Objetivo

Evoluir a ferramenta individual para um SaaS multi-tenant sem misturar dados
entre escritórios e sem obrigar uma reescrita da aplicação.

## Modelo-alvo

| Entidade | Responsabilidade |
| --- | --- |
| `organizations` | Escritório, plano, estado da assinatura e quotas |
| `organization_members` | Usuários, convites e papéis do escritório |
| `clients` | Pessoa atendida, sem dados próprios de um processo específico |
| `cases` | Benefício/requerimento, DER, fase, status e responsável |
| `case_interviews` | Anamnese e informações rurais do processo |
| `documents` | Metadados lógicos do documento |
| `document_versions` | Chave, hash, tamanho e estado de cada arquivo imutável |
| `case_documents` | Associação de documentos a processos |
| `evidence_periods` | Períodos rurais, urbanos, benefícios e lacunas |
| `evidence_document_links` | Relação muitos-para-muitos entre provas e períodos |
| `tasks` | Pendências, responsáveis, prazos e histórico |
| `transactions` | Honorários e despesas vinculadas ao processo/escritório |
| `audit_events` | Ações relevantes sem conteúdo sensível em texto livre |
| `usage_counters` | Consumo de armazenamento, OCR e outros limites |

Todas as tabelas operacionais devem possuir `organization_id`. Relações
indiretas não substituem essa coluna, pois ela simplifica RLS, índices,
auditoria, suporte e medição de uso.

## Papéis iniciais

- `owner`: assinatura, faturamento, membros e todos os dados;
- `admin`: membros e operação do escritório, sem alterar cobrança;
- `lawyer`: clientes, processos, documentos e análises;
- `assistant`: cadastro, documentos e tarefas autorizadas;
- `viewer`: leitura sem alteração ou exportação em massa.

Papéis são dados de autorização e não devem vir de `user_metadata` editável
pelo usuário.

## Sequência de migração

1. Capturar o esquema atual e versioná-lo como baseline.
2. Criar organizações e membros sem alterar as tabelas existentes.
3. Criar uma organização para cada proprietário atual e fazer o backfill.
4. Adicionar `organization_id` como opcional, preencher e só então torná-lo
   obrigatório.
5. Criar RLS e testes negativos entre duas organizações.
6. Introduzir `cases` e migrar o processo implícito de cada cliente.
7. Consolidar `personal_docs`, `timeline_json` e `client_documents`.
8. Introduzir versões, lixeira, auditoria e quotas.
9. Remover as estruturas legadas somente após reconciliação e exportação de
   segurança.

Nenhuma etapa destrutiva deve ser aplicada diretamente em produção. A migração
deve ser validada em branch ou ambiente de homologação com uma cópia
anonimizada dos dados.

## Critérios de liberação comercial

- migrations reproduzíveis no Git;
- RLS testada em todas as tabelas expostas e em `storage.objects`;
- restauração de banco e arquivos comprovada;
- MFA, convites e sessões configurados;
- auditoria de downloads, alterações e exclusões;
- política de retenção e offboarding;
- termos, privacidade, DPA e subprocessadores publicados;
- teste de invasão independente antes da abertura ampla.
