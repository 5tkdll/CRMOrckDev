# CRM ORCK DEV

CRM interno para prospecção, vendas de sites e acompanhamento de projetos da ORCK DEV.

## Estado deste pacote

Base inicial em Next.js e TypeScript, com navegação e páginas de escopo. Não é o MVP funcional. Sem banco conectado, autenticação, persistência, CSV funcional ou lembretes executáveis. O visual é uma base simplificada; não reproduz integralmente o Stitch.

## Preparação

1. Extraia o conteúdo deste pacote diretamente na raiz da cópia local do repositório (a mesma pasta que contém `.git`). Não crie uma segunda pasta CRMOrckDev dentro dela.
2. Confira `node --version` e `npm --version`. Use uma versão LTS do Node compatível com a versão de Next resolvida na instalação. Se houver erro de engine, pare e compartilhe a mensagem.
3. Execute `npm install`.
4. Execute `npm run typecheck` e `npm run build`.
5. Execute `npm run dev` e abra http://localhost:3000.

As dependências usam `latest` apenas neste bootstrap, sem versões inventadas ou lockfile simulado. A primeira instalação resolve as versões e cria `package-lock.json`. Revise o resultado e inclua esse lockfile no primeiro commit. Depois dele, use `npm ci` nas instalações reproduzíveis. Não execute atualizações indiscriminadas.

Este pacote foi gerado e inspecionado como arquivos; não teve instalação, compilação ou execução testadas no ambiente do usuário.

## Segurança

Os scripts limitam o servidor a 127.0.0.1. Não altere para acesso pela rede antes de implementar autenticação e revisar a configuração. Não há login real nesta entrega. Não use dados reais.

Credenciais ficam em `.env.local`, ignorado pelo Git. Não commitar dumps, contatos reais, arquivos CSV de clientes ou senhas.

## Primeiro commit

Antes de commitar, verifique no GitHub Desktop a lista de arquivos. Não inclua `node_modules`, `.next`, `.env.local` nem dados reais. Inclua `package-lock.json` depois da instalação validada.

Sugestão de mensagem: `chore: estrutura inicial do CRM ORCK DEV`.

## Organização

- `src/app`: rotas e layouts.
- `src/components`: interface e estrutura compartilhada.
- `src/modules`: módulos comerciais, criados conforme implementação.
- `src/server`: infraestrutura exclusiva do servidor.
- `prisma`: futura modelagem e migrations.
- `docs`: planejamento, design e operação.
- `tests`: organização prevista dos testes.

Veja `docs/planejamento/ESCOPO.md`, `docs/planejamento/ARQUITETURA.md` e `docs/operacao/PRIMEIROS-PASSOS.md`.
