# Modelo inicial - proposta para revisao

17 tabelas de negocio, alem da tabela de controle criada pelo Prisma Migrate.

- users: identidade futura de login; nenhuma conta ou senha e criada automaticamente.
- companies, contacts, research_sources, contact_permissions: empresas, contatos, origem e historico de permissoes.
- plans, opportunities: catalogo e snapshot dos valores/escopo negociados.
- activities, tasks: historico e pendencias.
- projects, project_checklist_items: escopo contratado e checklist.
- services, service_reminder_rules, service_notices, service_renewals: dominio/hospedagem, regras de lembrete, avisos manuais e renovacoes.
- import_batches, import_rows: lotes, dados originais e decisoes de revisao.

Dinheiro em centavos inteiros. UUIDs gerados pelo Prisma, nao por extensao do servidor. Datas de vencimento em DATE; eventos com instante em TIMESTAMPTZ. Telefone e texto. Relacoes usam Restrict para evitar apagar historico em cascata.

Nao ha unicidade por nome ou telefone de empresa: duplicidades exigem revisao. Uma oportunidade pode ter mais de um projeto; regra de conversao sera decidida na camada de servico.

Validacoes ainda a implementar: valores nao negativos; dia de mensalidade entre 1 e 31; lembretes nao negativos; coerencia entre empresa e vinculos de tarefas/projetos; consistencia dueDate/dueAt; transicoes de status; permissao mais recente por canal. Regras de negocio nao estao completas apenas porque o schema existe.

Tarefas com apenas data usam dueDate; com horario usam dueAt; a aplicacao devera validar a escolha. Lembretes sao regras armazenadas, nao processos agendados nem notificacoes externas. Registro de aviso significa envio manual informado pelo operador.

Planos Start/Advanced, regras 30/15/7/0 e usuario inicial ainda NAO recebem seed neste pacote. Catalogo e autenticacao ficam para a proxima etapa. A interface nao exibe dados reais ainda.
