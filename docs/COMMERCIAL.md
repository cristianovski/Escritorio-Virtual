# Hipóteses comerciais e custo de armazenamento

> Fotografia de preços em 29 de agosto de 2026. Revalidar preços, impostos,
> câmbio, regiões e termos antes de contratar ou publicar um plano.

## Decisão do MVP

O produto deve ser vendido pela organização do trabalho previdenciário, pela
segurança e pela rastreabilidade das provas — não como revenda genérica de
terabytes. Cada plano pode incluir uma franquia de espaço e transferência, com
armazenamento adicional como complemento.

O Supabase continua como origem no MVP. Backblaze B2 é o candidato preferencial
para uma segunda cópia independente e, quando a escala justificar, para servir
objetos por uma camada de armazenamento desacoplada. Wasabi deve ser avaliada
para acervos grandes e estáveis, não para arquivos substituídos com frequência.

## Por que os preços diferem

Supabase cobra por uma plataforma integrada: Postgres, Auth, RLS, APIs, CDN e
Storage. B2 e Wasabi são empresas especializadas em object storage e não
entregam o modelo de autorização do PrevRural. A diferença por GB precisa ser
comparada com o custo de desenvolver URLs assinadas, quotas, auditoria,
reconciliação, suporte e recuperação.

Wasabi também troca simplicidade de preço por compromissos econômicos: mínimo
mensal de 1 TB, cobrança mínima de 90 dias por objeto e política de egress
adequado ao volume armazenado. B2 não exige permanência mínima e inclui egress
de até três vezes o armazenamento médio; o excedente é cobrado.

## Comparação mensal de referência

Premissas: USD, 1 TB = 1.024 GB, downloads mensais iguais ao espaço ocupado,
arquivos mantidos por mais de 90 dias e, no Supabase, 80% do tráfego atendido
pelo cache. O total do Supabase inclui seu plano Pro de US$ 25.

| Volume ativo | Supabase Pro | Backblaze B2 | Wasabi |
| ---: | ---: | ---: | ---: |
| 100 GB | US$ 25,00 | ~US$ 0,68 | US$ 7,99 |
| 1 TB | ~US$ 61,76 | US$ 6,95 | US$ 7,99 |
| 10 TB | ~US$ 641,06 | US$ 69,50 | US$ 79,90 |

Os primeiros 10 GB do B2 são gratuitos. O Supabase inclui 100 GB de Storage e
250 GB de egress de origem e de cache; excedentes de egress e armazenamento
explicam o crescimento do total na tabela.

No volume atual, inferior a 1 GB, trocar a origem não produz economia material.
Uma cópia no B2, contudo, cabe na franquia gratuita e reduz o risco de depender
de um único provedor — desde que Object Lock, checksums e restauração sejam de
fato configurados e testados.

## Regras para um plano comercial

- medir bytes armazenados e transferidos por escritório;
- não prometer transferência ilimitada;
- incluir uma franquia de download coerente com o provedor;
- cobrar excedente ou reduzir velocidade de forma transparente;
- precificar margem para câmbio, impostos, suporte, cópia redundante e fraude;
- preservar exportação e exclusão no encerramento do contrato;
- só migrar a origem após comparar economia anual com engenharia e operação.

## Brasil e LGPD

Supabase oferece região em São Paulo. B2 e Wasabi não listam região brasileira;
usar qualquer um deles para documentos jurídicos caracteriza transferência
internacional e exige base contratual, transparência, salvaguardas e revisão dos
subprocessadores. Clientes com exigência de residência no Brasil podem demandar
uma modalidade separada.

## Fontes oficiais

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress)
- [Supabase backups](https://supabase.com/docs/guides/platform/backups)
- [Backblaze B2 Pricing](https://www.backblaze.com/cloud-storage/pricing)
- [Backblaze Object Lock](https://www.backblaze.com/docs/cloud-storage-object-lock)
- [Wasabi Pricing FAQ](https://wasabi.com/pricing/faq)
- [Wasabi minimum storage duration](https://docs.wasabi.com/docs/how-does-wasabis-minimum-storage-duration-policy-work)
- [ANPD — transferência internacional](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados)
