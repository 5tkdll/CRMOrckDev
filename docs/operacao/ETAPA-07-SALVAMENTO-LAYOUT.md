# Pacote 07 - Confirmacao de salvamento e shell/listagem

## Escopo acordado

Corrige fluxo de retorno de salvamento, ajusta sidebar/topbar/listagem de Empresas pela referencia existente e AGUARDA o layout especifico de cadastro. Nao redesenha formulario nem altera seus campos, mascara, CEP ou estrutura. A tipografia do shell e herdada pelo formulario, mas sua organizacao nao foi redesenhada.

Referencias: CRM-ORCK-DEV/crm_orck_dev_empresas_listagem/code.html e trechos do mesmo arquivo presentes no projeto. Sidebar de 240px #213145, canvas #f8f9ff, primario #4f46e5, cards/tabela/filtros compactos. Fontes Plus Jakarta Sans e JetBrains Mono via Google Fonts no navegador. Sem internet, fallback Arial/monospace; icones sao SVG locais independentes da rede.

Icones SVG locais correspondem aos pictogramas pedidos, mas NAO sao os arquivos originais da fonte Material Symbols. Nao alegar igualdade pixel a pixel. Referencia de cadastro ainda sera enviada pelo usuario. Telas de dashboard, tarefas etc. continuam no conteudo anterior, somente shell compartilhado atualizado.

## Salvamento

Substitui actions.ts completo por retorno explicito discriminado: { ok: true, id } ou { ok: false, state }. Elimina variavel savedId e atribuicao facil de omitir. Criacao retorna id criado; edicao retorna id da empresa atualizada. Atualizacao preserva protecao de concorrencia, validacao, unicidade documento e numero/complemento presentes no parser da entrega 06. Nao foi identificado com certeza se a causa local era linha omitida; pacote elimina essa classe de falha no retorno.

Nao e teste de gravacao real do PostgreSQL. Consultar cadastro antes de repetir gravacao incerta anterior; mensagens antigas podem ter ocorrido apos gravacao bem-sucedida.

## Layout e dados reais

- Sidebar com marca, icones locais, selecao ativa inclusive em /empresas/nova e /empresas/[id], perfil com nome/email autenticados e atalho novo cliente.
- Topbar com breadcrumb, conta, sair e nova empresa; rotulo Ambiente local, nao Base ativa ficticia.
- Listagem com quatro indicadores REAIS somente da base ativa: cadastros, potenciais, site nao identificado e restricoes de contato. O quarto indicador adapta o card de alertas da referencia, sem inventar tarefas vencidas nao integradas.
- Busca por nome/telefone/documento/segmento; filtros de segmento, cidade, avaliacao, arquivo, contato e site; chips site/telefone/restricao; paginacao 20.
- Opcoes de segmentos/cidades vem do banco, limitadas a 100 valores distintos por campo. Parametro existente nao listado e preservado na selecao.
- Tabela apresenta segmento/localizacao, telefone, site/Instagram, avaliacao, restricao, data real de criacao, abrir/editar.
- Coluna de proxima tarefa nao e inventada; tarefas, notificacoes, busca global e exportacao nao sao simuladas como prontas. Exportacao aparece desabilitada. Link Importacoes abre modulo existente, nao implementa importador.
- Sem restricao registrada nao vira Contato permitido; preserva distincao de consentimento.
- Datas em America/Sao_Paulo. IDs curtos visuais derivam de UUID real, nao sao identificadores unicos alternativos.
- Formulario fica como esta. Patch opcional funcional mostra checkbox de coincidencias apenas quando ha avisos; nao muda layout de cadastro.

## Arquivos substituidos

src/app/(crm)/empresas/actions.ts
src/app/(crm)/empresas/page.tsx
src/app/(crm)/layout.tsx
src/components/layout/sidebar.tsx

Demais arquivos sao novos. Nao altera globals.css, root layout, .env, schema, migrations, permissoes ou dependencias. Nao precisa rodar migration. Requer entrega 06 e migration 202611080002 ja aplicadas.

A consulta ao GitHub nesta sessao mostrou sidebar inicial e actions.ts ausente na branch padrao; pacote foi integrado a partir dos arquivos da entrega 06 da conversa. Comparar alteracoes locais antes de sobrescrever. Nao declarar revisao de codigo remoto nao encontrado.

## Aplicar

1. Parar servidor com Ctrl+C; guardar estado local em commit. Extrair ZIP na raiz.
2. Fazer somente ajuste de exibicao do checkbox (script preserva demais dados/estrutura):

node scripts/patch-duplicate-confirmation.mjs

Se padrao nao for encontrado, script nao altera formulario; nao forcar patch. Enviar arquivo para revisao, sem credenciais.

3. Verificar:

node --test tests/company-save-result.test.mjs tests/companies-validation.test.mjs
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev

Parar no primeiro erro. Sem npm install, migrations, db push ou reset.

4. Reabrir empresa a partir da listagem (nao continuar formulario antigo com versao defasada). Conferir primeiro se numero/complemento ja haviam sido salvos. Alterar e salvar uma vez; deve redirecionar ao cadastro com mensagem Cadastro salvo. Reabrir para conferir persistencia.

## Aceite

- Abrir/listar/editar sem sessao: pedir login.
- Edicao apenas numero/complemento persiste e confirma (outros obrigatorios devem estar completos).
- Novo cadastro retorna ID e abre cadastro, sem repetir documento.
- Avisos de coincidencia continuam sendo devolvidos sem gravacao; checkbox so aparece quando ha coincidencias e nao documento principal repetido.
- Nao contatar preservado apos erro; sem checkboxes para arquivar/restaurar.
- Duas abas de edicao: conflito, sem sobrescrever.
- Sidebar renderiza icones mesmo offline, item Empresas ativo nas subrotas; nome/email reais, Sair funciona.
- Indicadores usam dados reais da base ativa, nao mudam com filtros da tabela.
- Filtros e chips conservam demais parametros; paginacao funciona.
- Formulario de cadastro nao foi redesenhado; aguardar layout do usuario.

## Testes executados pelo gerador

Node: tres arquivos .mjs aprovados em --check; quatro testes de interpretacao do retorno passaram. Patch do checkbox testado duas vezes em fixture: alteracao inicial e repeticao idempotente. ZIP verificado.
Nao executados: TypeScript completo, build Next, navegacao ou PostgreSQL. Nao prometer correcao validada no ambiente local antes do aceite.

## Seguranca e versionamento

Nao ha credenciais no pacote. Fontes externas enviam requisicao do navegador ao Google; podem ser hospedadas localmente depois, sem dependencia de build. Documentos em busca podem ficar no historico/URL; evitar compartilhar URLs com dados pessoais. Manter 127.0.0.1, nao liberar LAN/internet. Versionar arquivos de codigo e docs; nunca ambientes ou dados reais.
