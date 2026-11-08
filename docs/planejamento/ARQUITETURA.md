# Arquitetura inicial

- Aplicação única: Next.js + TypeScript; Prisma e PostgreSQL na etapa de persistência.
- Windows para execução; PostgreSQL em outra máquina da rede.
- Banco dedicado `crm_orck_dev` proposto, sujeito à confirmação. Não usar `evbcalc_db`.
- Acesso por outras máquinas é objetivo, mas fica bloqueado nesta base sem autenticação.
- Rotas em `src/app`; páginas compõem componentes e serviços dos módulos.
- Regras específicas em `src/modules/<modulo>`; criar `components`, `schemas` e `services` conforme necessário.
- Não criar camadas de repositories sem necessidade concreta.
- Acesso ao banco e segredos somente no servidor.
- Valores monetários em centavos inteiros ou decimal; definição no schema posterior.
- Datas de vencimento sem horário e eventos com horário terão semânticas explícitas na modelagem.
- Nenhum schema, migration ou usuário de banco é criado neste pacote.

## Design

Referência: arquivos Stitch adicionados às fontes do projeto. Preservar originais em `docs/design/stitch` quando copiados localmente. Extrair navegação e controles reutilizáveis; não copiar configurações e estruturas repetidas em cada página.

## Próximas decisões

Autenticação e sessão; versões resolvidas da stack; conexão e permissões PostgreSQL; schema; estratégia de backups; detalhes de revisões e manutenção comercial.
