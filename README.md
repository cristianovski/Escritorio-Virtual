# PrevRural

Aplicação web para organizar a análise probatória de benefícios previdenciários
rurais. O núcleo do produto liga documentos reais a períodos de atividade,
evidencia lacunas e prepara um dossiê revisável pelo profissional responsável.

## Estado do projeto

O projeto está em preparação para um beta comercial controlado. A versão atual
deve ser usada somente pelo escritório proprietário até a conclusão e validação
das políticas multi-tenant, dos testes de restauração e da documentação LGPD.

## Stack

- React 19, TypeScript e Vite
- Supabase Auth, Postgres e Storage
- Tailwind CSS
- Sentry para monitoramento de erros, sem captura de conteúdo jurídico
- PWA para instalação em dispositivos móveis

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env` e informe as credenciais publicáveis do
   projeto Supabase.

3. Inicie a aplicação:

   ```bash
   npm run dev
   ```

## Verificações

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

O código da função de IA possui uma verificação separada (`npm run lint:ai`)
para que sua evolução possa ser tratada isoladamente sem retirar a aplicação
principal do controle de qualidade.

## Princípios de segurança

- documentos jurídicos ficam em bucket privado;
- o banco armazena a chave do objeto, não uma URL pública permanente;
- acesso a arquivos usa sessão autenticada ou URL assinada de curta duração;
- nenhuma credencial do Gov.br/Meu INSS deve ser coletada;
- antes do beta comercial, exclusões devem passar por lixeira e política de
  retenção antes do expurgo;
- todo dado operacional deve pertencer explicitamente a um escritório;
- integrações externas não recebem dados reais sem contrato, finalidade e
  revisão de privacidade aprovados.

Consulte [a arquitetura planejada](docs/ARCHITECTURE.md),
[a estratégia de armazenamento](docs/STORAGE.md) e
[as hipóteses comerciais](docs/COMMERCIAL.md) antes de alterar o modelo de
dados, o ciclo de arquivos ou a precificação.

## Escopo do MVP comercial

- cadastro civil e rural;
- processo previdenciário separado do cliente;
- documentos e versões;
- vínculo entre prova, fato e período;
- identificação de lacunas probatórias;
- dossiê exportável e auditável;
- tarefas e honorários básicos por processo.

Fluxo de caixa completo, aplicativo nativo e parecer jurídico automatizado não
fazem parte do primeiro MVP comercial.
