# Pacote 04 - autenticacao local

## Alvo e escopo

Preparado a partir do repositorio CRMOrckDev consultado em 08/11/2026 (main observado e57eeaaf520249c3d2ca9e6a03073801299baa43). O relatorio Dropbox de 03/11 foi relido como especificacao; status antigo de planejamento nao substitui as migrations ja aplicadas e verificadas pelo usuario.

Unico arquivo existente substituido: src/app/(crm)/layout.tsx. Preserva Sidebar, shell, workspace, topbar e main. Demais arquivos novos. Nao substitui package.json, lockfile, .env, schema Prisma, cliente db ou migration. Se alterou esse layout depois do commit consultado, comparar antes de substituir.

Implementa login com Server Action, consulta Prisma a users, hash scrypt-v1, cookie HttpOnly SameSite=Strict, JWT assinado com jose (nao criptografado), expiracao fixa de 8h, verificacao de usuario ativo a cada verificacao de sessao, invalidacao de sessao por troca do hash de senha. Cookie contem apenas identificador e versao HMAC do hash, nao senha/nome/email.

## Limites obrigatorios

Somente HTTP em 127.0.0.1 nesta etapa. AUTH_COOKIE_SECURE=false permite HTTP local mesmo no next start; nao e liberacao para LAN ou internet. HTTPS exige true e revisao do deploy.
Logout limpa cookie neste navegador, mas nao revoga imediatamente uma copia roubada do token. Nao ha tabela de sessoes/revogacao individual. Token copiado pode durar ate 8h; desativar usuario ou trocar hash invalida-o, enquanto trocar AUTH_SECRET invalida todas as sessoes. Sessao sem renovacao deslizante.
Limite de tentativas em memoria por e-mail (5/15min) e global (60/5min), inclui tentativas corretas; reinicia com processo e nao e distribuido. Nao e protecao suficiente para publicacao externa.
Sem cadastro publico, recuperacao por e-mail, gestao de usuarios ou troca de senha em UI. Script inicial recusa se ja houver qualquer usuario; nao reseta senhas.
Layout protege paginas atuais do grupo (crm); nao substitui autorizacao em futuras Server Actions, Route Handlers e consultas. Cada operacao de dados deve chamar requireUser() antes de acessar dados. Nao adicionar operacoes desprotegidas apenas porque a tela exige login.

## Instalacao

1. Guardar commit local de trabalho e extrair o ZIP na raiz. Revisar substituicao de src/app/(crm)/layout.tsx.
2. Manter DATABASE_URL com crmapp e MIGRATION_DATABASE_URL com crmadmin.
3. Instalar:

npm.cmd install --save-exact jose@6 server-only

4. Antes de gerar segredo, conferir ambientes ignorados e nao rastreados:

git check-ignore .env
# Se existir .env.local, conferir tambem:
git check-ignore .env.local
git ls-files -- .env .env.local

Ultimo comando deve retornar vazio. Nao prosseguir se arquivo com senha esta rastreado. Nao enviar conteudo de ambiente.

5. Gerar segredo diretamente no arquivo local (nao imprime valor):

node scripts/generate-auth-secret.mjs

Preserva configuracao existente, acrescenta AUTH_SECRET e AUTH_COOKIE_SECURE=false (caso nao esteja na mesma fonte). Se ja houver AUTH_SECRET, recusa sobrescrever. Conferir AUTH_COOKIE_SECURE=false na fonte efetiva de ambiente para HTTP local. Nao duplicar chaves entre .env e .env.local. Nunca versionar o segredo.

6. Verificar codigo antes de inserir usuario:

npx.cmd prisma generate --config prisma7.config.ts
node --test tests/auth-password.test.mjs
npm.cmd run typecheck
npm.cmd run build

Parar no primeiro erro. Nao precisa de migration, db push nem grants extras.

7. Criar conta local (ALTERA users, com confirmacao interativa):

node scripts/create-first-user.mjs

Informar nome, e-mail e senha unica de 12 a 128 caracteres; senha nao aparece no terminal. Usar e-mail que voce guardara; nenhum e-mail sera enviado. Confirmar digitando CRIAR. Script usa crmapp, SQL parametrizado, UUID e transacao com advisory lock. Recusa criar se users nao estiver vazia. Nao passe senha como argumento nem em variavel versionada.

8. Executar:

npm.cmd run dev

Abrir http://127.0.0.1:3000/login. Se usar next start: construir novamente e npm.cmd run start. Nunca alterar hostname para 0.0.0.0 nesta entrega.

## Aceite manual

- Em janela anonima, abrir /dashboard, /empresas e /servicos: devem redirecionar a /login.
- Senha errada: mensagem generica; nenhum acesso.
- Login correto: redireciona a /dashboard.
- Abrir /conta: nome/email reais e contagem real de empresas consultada pelo Prisma.
- Recarregar pagina: manter sessao.
- Sair: volta ao login. Reabrir /dashboard sem sessao: login.
- Conferir em DevTools cookie orck_session com HttpOnly e SameSite Strict; Secure ausente apenas no teste HTTP local. Nao copiar/compartilhar o token.
- Verificar erro generico para e-mail inexistente e senha errada; nao imprimir credenciais.
- Apos cinco tentativas por e-mail, bloqueio temporario (aguardar ate 15min; nao tratar como falha permanente).
- Parar dev e executar build/start; repetir login para verificar configuracao em producao local.
- Os dados de demonstracao dos modulos nao foram substituidos por CRUD real. /conta faz consulta real de verificacao.

## Status dos testes

ZIP e estrutura dos arquivos verificados no ambiente de geracao. Nao foi possivel executar Node/TypeScript/Next nem acessar PostgreSQL aqui. Testes automatizados fornecidos precisam ser rodados no Windows. Nao considerar autenticacao aprovada antes do checklist local.

## Git e reversao

Versionar codigo, testes, docs e alteracoes package.json/package-lock.json. Nunca .env, tokens, node_modules, .next, cliente gerado. Para reverter, restaurar layout e remover arquivos novos; conta criada permanece no banco. Nao excluir usuario automaticamente.
