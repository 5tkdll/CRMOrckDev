# Pacote 03 - conexao de runtime

## Escopo

Adiciona cliente Prisma de servidor com inicializacao sob demanda e script somente de leitura para testar DATABASE_URL via driver pg. O script NAO testa consultas Prisma. Nenhuma tela, rota publica, autenticacao, migration ou dado foi alterado.
Modelo .env.runtime.example nao contem senha real. Arquivos existentes de ambiente e config nao sao sobrescritos. Ambiente gerador sem Node/PostgreSQL: instalacao, compilacao e conexao precisam ser verificadas localmente.

## Aplicar

1. Extrair na raiz do projeto. Nao substituir .env nem .env.local.
2. Como o build anterior informou .env, editar esse arquivo local e manter MIGRATION_DATABASE_URL com crmadmin. Adicionar ou substituir somente DATABASE_URL por:

DATABASE_URL="postgresql://crmapp:SENHA_CRMAPP_CODIFICADA@192.168.100.15:5432/crmOD-db?schema=public"

Substituir o marcador pela senha de crmapp percent-encoded para URL. Nao compartilhar a senha nem a URL preenchida. Nao usar senha de crmadmin nessa chave.
Se ja existe DATABASE_URL em .env.local, remover a duplicidade ou atualizar a chave la: .env.local tem precedencia sobre .env. Variaveis definidas no terminal tambem podem prevalecer. Manter uma unica fonte local para cada chave. Nao prefixar credenciais com NEXT_PUBLIC_.

3. Instalar a protecao de importacao no cliente:

npm.cmd install --save-exact server-only

4. Confirmar ambiente ignorado (sem exibir seu conteudo):

git check-ignore .env

Se usa .env.local: git check-ignore .env.local
.gitignore nao remove arquivos ja rastreados. Conferir tambem git ls-files -- .env .env.local: esperado nenhum retorno. Se retornar algum, nao commitar/pushar; revisar e remover do indice, e trocar segredos se ja publicados.

5. Gerar/verificar/testar:

npx.cmd prisma generate --config prisma7.config.ts
npm.cmd run typecheck
npm.cmd run build
node scripts/check-runtime-db.mjs

Parar no primeiro erro. O teste apenas consulta identidade, permissoes e total de empresas; nao grava dados nem imprime senha. Sucesso exige crmapp no banco correto e sem CREATE no schema/DELETE em companies.

## Uso futuro (somente servidor Node.js)

import { getDb } from "./client"; // ajustar caminho relativo ao arquivo chamador
const companies = await getDb().company.findMany({ take: 20 });

Nao importar de componente com use client, nao usar em Edge runtime, e nao executar consultas no topo do modulo ou durante pre-render estatico. Rotas futuras que consultem o banco devem ser dinamicas e autenticadas. Nao desconectar o singleton apos cada requisicao. Nao criamos endpoint publico de diagnostico.

## Separacao

DATABASE_URL: crmapp para runtime. MIGRATION_DATABASE_URL: crmadmin para CLI. O helper nunca usa fallback administrativo. Nao e necessario repetir migration ou aplicar grants.
Nenhum seed de plano/usuario foi incluido. Sem login implementado, manter servidor em 127.0.0.1. Proxima etapa: autenticacao e teste Prisma em fluxo de servidor protegido.

## Git

Versionar client.ts, script de verificacao, docs e alteracoes em package.json/package-lock.json. O modelo .env.runtime.example pode ser ignorado pelo padrao .env.*; isso e esperado. Nao forcar inclusao de arquivos de ambiente preenchidos.
