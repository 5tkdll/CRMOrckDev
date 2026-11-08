# Pacote 06 - Documentos, responsavel, CEP e correcoes

## Base e limites de verificacao

Pacote completo dos arquivos alterados de Empresas, baseado na entrega 05 da conversa e no schema consultado no GitHub em 08/11/2026. A consulta do arquivo de acoes de Empresas no GitHub retornou ausente: o modulo local validado pelo usuario pode ainda nao estar na branch remota consultada. Nao foi possivel comparar eventuais ajustes locais posteriores ao ZIP 05. Comparar git diff antes de substituir.

Nao altera .env, autenticacao, dependencias, menu/sidebar, layout global ou migration inicial. Sem referencia Stitch aprovada, fidelidade dos icones/visual permanece pendente; nao foi simulada uma referencia inexistente.

## Conteudo

- Documento cliente CPF ou CNPJ obrigatorio ao salvar, normalizado sem pontuacao; CNPJ maiusculo, numerico ou alfanumerico. Digitos verificadores locais, sem consulta Receita.
- Nome e CPF do responsavel obrigatorios. CPF do responsavel pode repetir entre empresas. Opcao usar mesmo CPF so para cliente CPF; e derivada e validada tambem no servidor.
- Indice unico composto no banco impede mesmo documento principal, inclusive arquivadas e requisicoes concorrentes. CPF do responsavel nao e unico. Documento diferente nao e mesclado por nome/telefone/site.
- Campos novos inicialmente NULL para preservar registros existentes; a aplicacao exige completar quando salvar. Banco permite NULL para legado e nao possui trigger exigindo preenchimento por outros meios. Formato SQL nao substitui checksum local do servidor.
- CEP opcional com mascara, endereco/numero/complemento separados. Consulta via endpoint autenticado, valida exatamente 8 digitos, envia SOMENTE CEP ao ViaCEP. Timeout 5s; limite basico em memoria 30 consultas/min por usuario (nao distribuido).
- CEP inexistente ou internet indisponivel nao bloqueia cadastro, desde que o CEP tenha 8 digitos ou seja apagado. Resposta nao e verificacao de domicilio.
- Preenche endereco vazio automaticamente; com dados ja preenchidos/corrigidos oferece aplicar resposta. Campos vazios do servico nao apagam conteudo existente. Numero e complemento do cliente sao sempre manuais. Respostas de CEP anterior sao ignoradas; consulta cancelada ao trocar CEP/desmontar.
- Ao errar, campos controlados e checkbox Nao contatar permanecem; reset automatico do formulario e prevenido.
- Arquivar/restaurar com botao direto, sem checkbox de confirmacao. Nao apaga nem cancela vinculos.
- Site sem protocolo recebe https://; nao verifica disponibilidade.
- Telefone local com DDD 10 ou 11 digitos, sem DDI nesta mascara. Letras removidas na digitacao/colagem; servidor rejeita payload com letras. CPF idem; CNPJ aceita letras legitimamente.
- Possiveis duplicidades mostram telefone, cidade/UF, site, estado de arquivamento e restricao. Nao mostram CPF do responsavel.
- Documento completo nao aparece na listagem; busca por documento envia parametro q na URL, que pode ficar no historico/logs HTTP. Evitar compartilhar URLs com documentos e revisar redacao de logs antes de ampliar acesso.

## Arquivos sobrescritos

src/lib/companies/types.ts
src/lib/companies/validation.mjs
src/lib/companies/validation.d.mts
src/server/companies/queries.ts
src/app/(crm)/empresas/actions.ts
src/app/(crm)/empresas/company-form.tsx
src/app/(crm)/empresas/archive-form.tsx
src/app/(crm)/empresas/page.tsx
src/app/(crm)/empresas/nova/page.tsx
src/app/(crm)/empresas/[id]/page.tsx
src/app/(crm)/empresas/companies.module.css
tests/companies-validation.test.mjs

Demais arquivos novos. Manter loading/error/not-found existentes do pacote 05.

## Ordem de instalacao - parar o servidor primeiro

1. Garantir commit local do estado validado e backup do banco conforme sua rotina (nao presumir backup existente). Extrair ZIP na raiz. Nao acessar telas novas antes da migration.
2. Atualizar somente Company no schema existente, sem substituir todo o schema:

node scripts/patch-company-identification.mjs

git diff -- prisma/schema.prisma prisma/migrations/202611080002_company_identification/migration.sql

Script e local, altera schema.prisma, NAO banco. Preserva outros modelos e recusa campos preexistentes sem marcador. Nova migration contem ADD COLUMN, CREATE UNIQUE INDEX e CHECKs dentro de BEGIN/COMMIT, sem DROP/DELETE/TRUNCATE. Campos antigos permanecem intactos.

3. Validar e gerar cliente:

npx.cmd prisma validate --config prisma7.config.ts
npx.cmd prisma generate --config prisma7.config.ts
node --test tests/companies-validation.test.mjs
npm.cmd run typecheck
npm.cmd run build

Nao iniciar servidor se falhar. Build nao comprova migration aplicada.

4. Revisar SQL incluido e alvo local: MIGRATION_DATABASE_URL deve ser crmadmin em 192.168.100.15:5432/crmOD-db. O proximo comando ALTERA o banco existente:

npx.cmd prisma migrate deploy --config prisma7.config.ts
npx.cmd prisma migrate status --config prisma7.config.ts

Nao rodar SQL manualmente alem de deploy, nao rodar migrate reset, db push ou regenerar migration inicial. Migration 202611080002 deve ser aplicada UMA vez. Nao editar SQL depois de aplicado. Restricoes CHECK customizadas nao sao modeladas no schema Prisma; preserva-las em futuras migrations.

5. Nao precisa de novos grants: adicionamos colunas a companies, tabela ja concedida a crmapp. Runtime continua DATABASE_URL com crmapp.

6. Iniciar:

npm.cmd run dev

## Aceite manual

- Cadastro legado abre com aviso; nao preenche documentos ficticios e exige completar antes de salvar edicao. Arquivar/restaurar legado continua permitido.
- CPF/CNPJ e responsavel vazios ou DV incorreto: bloquear. Letras nao ficam em CPF/telefone, inclusive ao colar.
- CNPJ numerico e alfanumerico aceitos com DV valido; testes usam exemplo oficial 12.ABC.345/01DE-35, apenas algoritmo, nao seed.
- Cliente CPF: opcao mesmo CPF preenche e acompanha alteracao; desmarcar libera outro CPF; mudar tipo CNPJ retira opcao.
- Mesmo documento principal ativo ou arquivado: bloquear e mostrar cadastro. Duas empresas com CNPJs diferentes podem ter mesmo responsavel.
- Marcar Nao contatar sem motivo: erro, checkbox permanece marcado e dados preenchidos preservados.
- Site empresa.com.br salva como https://empresa.com.br/.
- Telefone mascara (99) 99999-9999 ou (99) 9999-9999; sem DDI. Numeros antigos com DDI nao sao truncados ao abrir; precisam ser ajustados ao salvar.
- Sem CEP: cadastrar. CEP 8 digitos existente e endereco vazio: preencher. Endereco editado: oferecer aplicar sem sobrescrever. Troca rapida de CEP: nao aplicar resposta antiga.
- CEP nao encontrado/internet indisponivel: mensagem, permitir preenchimento manual e salvar. CEP parcialmente preenchido: corrigir/apagar.
- Arquivar/restaurar: botao direto, sem checkbox. Restricao e documentos preservados.
- Edicao em duas abas: conflito na segunda, sem sobrescrever.
- Testar sem sessao em paginas e /api/cep/01001000: proteger (endpoint JSON 401, paginas login).
- Testar duplicidade em requisicoes concorrentes se viavel: indice unico e ultima barreira.

## Seguranca e escopo

Dados de CPF/CNPJ do responsavel nao devem ir para prints, GitHub, dumps compartilhados ou logs. Nao ha criptografia por coluna nesta entrega. Manter CRM em 127.0.0.1. Sem consulta Receita, sem verificacao de titularidade, sem mudancas nos modulos CSV/dashboard/contatos. CSV minimo e politica de cadastros incompletos para prospeccao deverao ser conciliados antes de implementar importacao; nao foram implementados silenciosamente.

## Verificacao

Sintaxe dos 4 arquivos .mjs validada com node --check; 8 testes unitarios passaram com node --test. Script de patch testado duas vezes em schema sintetico: aplica na primeira e nao altera na segunda. ZIP verificado. TypeScript, Prisma validate/generate, build Next e integracao PostgreSQL nao foram executados aqui; dependem do ambiente local. Nenhuma migration foi aplicada pelo assistente.

## Referencias tecnicas

ViaCEP: https://viacep.com.br/
DV CNPJ Receita: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf/@@download/file
