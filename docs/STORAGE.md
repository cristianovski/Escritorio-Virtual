# Estratégia de armazenamento

## Decisão atual

O Supabase permanece como armazenamento principal do MVP porque integra Auth,
RLS, banco, URLs assinadas e operação do produto. O custo por gigabyte não é o
único custo relevante: trocar o provedor exige construir autorização,
assinatura de URLs, quotas, auditoria, reconciliação e suporte operacional.

## Ciclo seguro do documento

1. Validar usuário, quota, tamanho e tipo de arquivo.
2. Gerar uma chave opaca e imutável.
3. Fazer upload em bucket privado.
4. Gravar metadados, tamanho e hash no banco.
5. Enfileirar a segunda cópia.
6. Confirmar checksum no provedor de backup.
7. Expor o documento por URL assinada curta.
8. Ao excluir, mover logicamente para lixeira.
9. Expurgar somente após a retenção e sem bloqueio jurídico.

Falha entre upload e banco deve remover o objeto recém-criado. Falha na segunda
cópia deve gerar retry e alerta, sem declarar o documento protegido.

## Segunda cópia futura

Backblaze B2 é a primeira opção para backup independente pelo custo, versões e
Object Lock. Wasabi é uma alternativa para volumes estáveis, considerando seu
mínimo de capacidade e retenção de cobrança. AWS S3 em São Paulo pode ser uma
modalidade premium para clientes que exigirem residência brasileira.

O backup deve ficar em conta separada, com credencial incapaz de apagar objetos,
manifesto de hashes, reconciliação diária e restaurações testadas.

## Abstração de provedor

O domínio da aplicação deve trabalhar com `bucket`, `objectKey`, `versionId`,
`sizeBytes` e `sha256`. URLs são temporárias e nunca fazem parte da identidade
persistente do documento.

Uma futura troca de provedor deve implementar a mesma interface conceitual:

- `upload`;
- `createSignedReadUrl`;
- `copyToBackup`;
- `markForDeletion`;
- `restoreVersion`;
- `purge`;
- `verifyChecksum`.

## Metas de recuperação

RPO e RTO só podem ser divulgados depois de medidos. Como metas internas
iniciais:

- cópia independente concluída em até 15 minutos;
- restauração amostral mensal;
- restauração completa trimestral em ambiente isolado;
- recuperação operacional em até oito horas.

Não utilizar a promessa “nunca perder arquivos”. A formulação correta é:
“cópias redundantes, versões recuperáveis e restaurações testadas”.
