# Pacote 05 - Empresas reais

## Escopo e compatibilidade

Consulta ao GitHub em 08/11/2026 confirmou Company com os campos usados, getDb(), requireUser() e pagina Empresas ainda provisoria. Substitui SOMENTE src/app/(crm)/empresas/page.tsx; demais arquivos sao novos. Nao altera env, dependencias, layout global, autenticacao, schema, migrations ou grants. Se ja possui arquivos novos nos mesmos caminhos, comparar antes de extrair.

Listagem paginada (20 por pagina), nome/telefone, avaliacao, site, restricao e arquivamento. Cadastro, edicao e arquivar/restaurar com confirmacao. Nao existe DELETE. Somente nome obrigatorio; motivo tambem obrigatorio quando nao contatar. Telefone preservado mais versao de digitos; nao inventa DDI nem verifica se numero existe. URLs exigem http/https e nao sao buscadas pelo servidor. Instagram e normalizado por formato, sem verificar a titularidade.

Consultas e Server Actions verificam sessao. E CRM interno compartilhado: qualquer usuario ativo tem o mesmo acesso a empresas, sem perfis complexos ou isolamento por proprietario.

## Regras importantes

- Sem restricao registrada NAO significa autorizacao de contato.
- Site vazio e apresentado como Site nao identificado; nao comprova ausencia.
- Avaliacao DUPLICATE e sinal manual, nao realiza mesclagem.
- Possiveis duplicidades por nome exato sem diferenciar maiusculas, telefone normalizado exato ou URL do site exata. Ate 10 coincidencias exibidas; inclui arquivadas. Nao ha comparacao aproximada, equivalencia www/http/https ou normalizacao DDI.
- Antes de salvar com coincidencias, precisa marcar confirmacao. Pode marcar previamente se ja revisou. Nenhum registro existente e mesclado/sobrescrito. Verificacao nao impede corrida entre dois cadastros simultaneos; nao e garantia absoluta de deduplicacao. CLI/SQL externos nao seguem essa regra.
- Edicao usa updatedAt como versao e updateMany condicional; duas abas antigas nao devem sobrescrever silenciosamente mudanca ja salva. O formulario exige recarregar em conflito; copie alteracoes pendentes antes disso.
- Arquivadas sao somente leitura ate restauracao. Arquivar nao cancela tarefas/projetos, nao altera restricao e nao apaga historico. O motivo de restricao e mantido se nao for apagado explicitamente no formulario.
- Nao ha historico de auditoria de cada alteracao de empresa/restricao neste pacote. Historico de permissoes de contato continua separado e nao e reescrito.
- Submissoes de criacao nao possuem chave persistente de idempotencia. Botao fica desabilitado enquanto pendente; em erro de conexao incerto, consultar lista antes de repetir.
- Nao ha interfaces para contacts, research_sources ou activities nesta entrega. Campos existentes nao sao removidos; essas tabelas nao sao alteradas.

## Instalacao e testes

Guardar trabalho atual em commit local; extrair na raiz. Nenhuma dependencia nova.

npx.cmd prisma generate --config prisma7.config.ts
node --test tests/companies-validation.test.mjs
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev

Parar no primeiro erro. Nao executar migrate reset, db push ou nova migration.

## Aceite manual com dados ficticios

1. Sem sessao, /empresas, /empresas/nova e URL de cadastro devem pedir login.
2. Lista vazia mostra estado sem resultados; cadastre Loja Teste ORCK DEV somente com nome.
3. Confirmar registro na lista e apos reiniciar aplicacao. Cadastro nao deve inserir contatos/permissoes ficticios.
4. Editar telefone, cidade/UF, site, Instagram e notas; reabrir e conferir. Site vazio mostra Site nao identificado. Uma URL sem protocolo recebe erro.
5. Marcar Nao contatar sem motivo: erro. Com motivo: salvar, sinal vermelho na lista e aviso no cadastro. Avaliacao comercial permanece independente.
6. Buscar nome, telefone com/sem pontuacao; filtros de avaliacao, site, restricao e arquivamento.
7. Cadastrar mesmo nome/telefone: aviso de coincidencias, sem gravar ate confirmar; abrir cadastro indicado e decidir. Confirmando conscientemente, criar separado, sem alterar o primeiro.
8. Abrir a mesma empresa em duas abas; salvar na primeira, depois tentar salvar segunda: conflito sem sobrescrever. Recarregar para editar nova versao.
9. Arquivar com confirmacao: some das ativas, aparece nas arquivadas; permanece legivel. Restaurar preserva restricao, notas e avaliacao.
10. Testar /empresas/nao-e-uuid: nao encontrada, sem erro cru do banco.
11. Testar mais de 20 empresas se desejar verificar paginacao; nao ha seed em massa automatico.
12. Conferir dashboard: ele ainda nao foi integrado aos dados; somente lista/cadastro Empresas e contagem da conta sao reais.

Dados de teste persistem; nao existe botao de exclusao. Pode arquiva-los. Nao realizar teste destrutivo em dados reais.

## Verificacao da entrega

Artefato ZIP verificado. Ambiente de geracao nao executa Node/TS/Next nem tem acesso ao PostgreSQL: build, testes Node e verificacao de interface precisam ser feitos localmente. Testes incluidos validam parser, nao substituem testes de integracao/autorizacao.

## Git

Versionar arquivos do pacote, nunca .env, dados reais ou gerados. Nenhum arquivo com credenciais incluido. Nao houve push ou alteracao do banco pelo assistente.
