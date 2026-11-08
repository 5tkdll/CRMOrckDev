# Escopo consolidado

## Aprovado

CRM local no Windows, acesso futuro pela rede com login, PostgreSQL existente na rede. Repositório: 5tkdll/CRMOrckDev. Next.js, TypeScript e Prisma aprovados.

## Módulos

- Empresas e contatos: dados, origem da pesquisa, classificação, restrição de contato e possíveis duplicidades.
- Importações: CSV mínimo `nome_local,telefone,instagram,site`; colunas adicionais opcionais; prévia, validação, revisão de conflitos e resumo. Não sobrescrever histórico silenciosamente.
- Oportunidades: pesquisado, contato pendente, contatado, interessado, proposta enviada, aguardando pagamento, ganho/perdido. Funil ajustável. Uma empresa pode ter várias oportunidades.
- Atividades e tarefas: contatos manuais, resultados, pendências e retornos.
- Projetos: aguardando pagamento, aguardando conteúdo, produção, revisão, ajustes e publicado. Prazo confirmado pelo responsável.
- Planos: Start até 4 páginas por R$899; Advanced até 6 por R$999. Até 12x sem juros via link, fornecedor pendente. R$79,90/mês de hospedagem/manutenção separado da criação. Preservar oferta histórica.
- Serviços: domínio e hospedagem separados, múltiplos por cliente, fornecedor, responsável, valor, periodicidade, vencimento e renovação automática. Lembretes internos propostos em 30/15/7 dias e no vencimento; registro de aviso manual e histórico de renovação. Renovação não implica pagamento.
- Dashboard: pendências, funil, projetos, atividades e vencimentos. Indicadores reais somente após persistência.
- Exportação e documentação de backup/restauração, com teste posterior.

## Fora do MVP

Chatbot, disparos automáticos, n8n, scraping contínuo, APIs pagas de IA, cobrança automática, emissão fiscal, contabilidade completa, portal público, aplicativo móvel e exposição na internet.

## Restrições comerciais

Não inclui loja virtual, pagamento implementado no site do cliente, pedidos, agendamento, chatbot, integrações personalizadas, fotografia, identidade visual, revisões ilimitadas ou promessa de posicionamento/vendas.

## Regras importantes

Site vazio é site não identificado, não prova de inexistência. Importação e número público não equivalem a autorização de contato. Restrição de não contato é independente da avaliação comercial. Separar mensalidade do cliente, renovação do domínio e renovação da hospedagem no fornecedor. Não guardar senhas dos provedores.

## Status

Este pacote entrega apenas estrutura e navegação. Nenhuma regra acima deve ser considerada funcional por estar documentada.
