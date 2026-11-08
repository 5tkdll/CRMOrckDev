# Pacote 02 - modelo e preparacao da migration

## Estado da entrega

Pacote incremental: nao substitui package.json, lockfile, interface ou next.config.ts. Contem schema inicial de 17 tabelas, config CLI e instrucoes. Sem migration SQL pre-gerada: ela sera gerada localmente pela versao instalada, validada e revisada ANTES de aplicar. Sem acesso remoto executado pelo assistente.
Nao foi possivel instalar Prisma, validar schema via CLI, compilar ou testar contra PostgreSQL no ambiente de geracao. O ZIP foi verificado como artefato; os testes abaixo sao obrigatorios.

## 1. Instalar e registrar dependencias

Na raiz do projeto, PowerShell:

```powershell
npm.cmd install --save-exact @prisma/client@7 @prisma/adapter-pg@7 pg @next/env
npm.cmd install --save-dev --save-exact prisma@7 @types/pg
npm.cmd ls prisma @prisma/client @prisma/adapter-pg
```

Usamos explicitamente a linha Prisma 7 e arquivo prisma7.config.ts com --config em cada comando. Conferir que prisma, @prisma/client e adapter-pg resolveram a mesma versao 7.x; em caso de divergencia, parar e compartilhar a saida. As versoes exatas resolvidas ficarao no package.json e package-lock.json. Nao usar npx sem as dependencias instaladas, nem instalar Prisma latest indiscriminadamente.

## 2. Ambiente local

Copiar as variaveis de .env.database.example para .env.local. Nao sobrescrever configuracoes existentes. Substituir a senha por sua representacao percent-encoded para URL, especialmente se tiver @, :, /, #, %, ? ou outros caracteres reservados. Nao compartilhar credenciais ou URL preenchida.

Confirmar que .env.local esta ignorado:

```powershell
git check-ignore .env.local
```

Se nao retornar .env.local, parar e corrigir o .gitignore antes de commitar.
Adicionar a src/generated/prisma/ ao .gitignore (cliente sera gerado localmente):

```text
/src/generated/prisma/
```

## 3. Validar e gerar cliente (nao cria tabelas)

```powershell
npx.cmd prisma validate --config prisma7.config.ts
npx.cmd prisma generate --config prisma7.config.ts
npm.cmd run typecheck
npm.cmd run build
```

Se falhar, parar e enviar erro sem credenciais. A config usa @next/env para ler .env.local como a aplicacao Next.js.

## 4. Gerar migration SEM aplicar

Banco foi informado como vazio. Somente nesse caso:

```powershell
New-Item -ItemType Directory -Force prisma/migrations/202611080001_initial | Out-Null
npx.cmd prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/202611080001_initial/migration.sql --config prisma7.config.ts
Set-Content -Path prisma/migrations/migration_lock.toml -Value 'provider = "postgresql"' -Encoding ascii
```

Nao repetir este passo sobre uma migration ja aplicada. Nao editar migration depois de aplicada.
Abrir migration.sql e conferir CREATE TABLE, indices e chaves estrangeiras. Nao deve conter DROP TABLE/SCHEMA/DATABASE. Compartilhar o SQL sem credenciais para revisao antes de aplicar.
Esta estrategia nao usa migrate dev e nao exige conceder CREATEDB para shadow database.

## 5. APLICACAO - somente depois da revisao

O comando seguinte ALTERA o banco configurado em MIGRATION_DATABASE_URL. Conferir host 192.168.100.15, banco crmOD-db, usuario crmadmin e que segue sem tabelas de usuario. Nao executar nesta primeira rodada antes de revisar SQL.

```powershell
npx.cmd prisma migrate deploy --config prisma7.config.ts
npx.cmd prisma migrate status --config prisma7.config.ts
```

Nao executar migrate reset, db push --accept-data-loss ou DROP. Se houver erro de migration, parar; nao tentar limpar o banco.

## 6. Conferencia PostgreSQL

```sql
SELECT current_database(), current_user;
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;
```

Esperado apos aplicar: 17 tabelas do modelo e _prisma_migrations. Nenhum lead, usuario de login ou plano e inserido.

## 7. Versionamento

Commitar schema, config, docs, package.json, package-lock.json e migration revisada. Nao commitar .env.local, gerados, node_modules ou dados reais. Proximo passo: usuario limitado, client de runtime, seed controlado de planos e autenticacao. Scripts dev/start continuam restritos a 127.0.0.1.
