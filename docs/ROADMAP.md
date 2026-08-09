# Roadmap Mestre — Versa Platform

> **Versão consolidada — Anexos I, II, III, IV, V, VI, VII, VIII, IX e X incorporados**  
> **Atualização:** 2026-08-07


> **Documento de direção do projeto**
>
> Este roadmap consolida a visão original da Versa Platform com o **Anexo I — Experiência, CX e Inteligência Profunda**, o **Anexo II — Padrões Invisíveis, Canal de Atendimento e Ativos Criativos**, o **Anexo III — Inteligência Financeira Avançada**, o **Anexo IV — Segurança de Automação, Custo de IA e Nota de Integração**, o **Anexo V — Ingestão Estratégica, Agente Mestre e Agent Registry**, o **Anexo VI — Transparência Operacional, Decision Safety e Governança de Agentes**, o **Anexo VII — Customer Trust, Care e Experience Intelligence**, o **Anexo VIII — Cadência de Inteligência, Scheduler e Uso Seletivo de IA Externa**, o **Anexo IX — Strategy Workspace e Decision Profile** e o **Anexo X — Materiais Operacionais, Consumo e Previsão de Estoque**. Seu objetivo é preservar o foco, registrar as decisões já tomadas e organizar a evolução da plataforma por fases.

---

## 1. Visão da plataforma

A **Versa Platform** será uma plataforma de gestão, inteligência e decisão para varejo, começando pela operação da **Versa Wear** e podendo evoluir futuramente para outros negócios.

A plataforma deverá:

- registrar fatos reais do negócio;
- centralizar dados operacionais, comerciais, financeiros e comportamentais;
- manter uma linha do tempo confiável de produtos, clientes, pedidos, campanhas e decisões;
- transformar dados em indicadores;
- detectar problemas, oportunidades e anomalias;
- sugerir ações com evidências;
- permitir que decisões sejam aceitas, recusadas, modificadas ou adiadas;
- registrar a execução e o resultado de cada decisão;
- automatizar tarefas autorizadas;
- preservar a memória estratégica da empresa;
- registrar estratégias como entidades próprias, com hipótese, execução, agentes, produtos, resultados e aprendizados;
- construir um perfil operacional de decisão do usuário baseado apenas em comportamentos observáveis dentro da plataforma;
- gerir não apenas produtos vendáveis, mas também materiais operacionais consumidos no fulfillment;
- antecipar ruptura de sacolas, embalagens, tags, cartões e outros consumíveis com base no consumo real e previsto;
- aprender com o histórico sem substituir o julgamento humano.

A plataforma deve conseguir responder:

- O que aconteceu?
- Quando aconteceu?
- Quem ou o que foi afetado?
- Por que isso pode ter acontecido?
- Quais evidências sustentam essa hipótese?
- O que provavelmente acontecerá?
- O que devemos fazer?
- O que já tentamos antes?
- Quais estratégias funcionaram, falharam ou ainda estão inconclusivas?
- Quais produtos, campanhas e agentes participaram de cada estratégia?
- Como meu padrão de decisão tem se comportado ao longo do tempo?
- Qual foi o resultado das decisões anteriores?
- Qual é o risco de repetir uma estratégia que já falhou?

---

## 2. Princípios arquiteturais e de produto

- Monólito modular antes de microsserviços.
- Domínios e contextos bem delimitados.
- Multi-tenancy explícito.
- PostgreSQL como principal fonte de verdade.
- TypeScript estrito.
- Eventos de domínio para representar fatos relevantes.
- Transactional Outbox para publicação segura de eventos.
- CQRS aplicado seletivamente, onde houver benefício real.
- Read models para consultas complexas, dashboards e interfaces acionáveis.
- Regras de negócio independentes de frameworks.
- Testes automatizados desde as primeiras funcionalidades.
- Observabilidade desde o início.
- Auditoria de ações e decisões.
- Evolução incremental.
- Sem abstrações prematuras.
- Sem microsserviços por moda.
- Sem inteligência artificial sobre dados frágeis ou sem rastreabilidade.
- Regras determinísticas antes de modelos estatísticos.
- Modelos estatísticos antes de recomendações assistivas complexas.
- Evidências antes de recomendações.
- Humano no controle das ações críticas.
- Toda recomendação relevante deve ser explicável.
- Toda ação relevante deve ser auditável.
- Cliente e qualidade de atendimento são prioridades máximas do produto.
- Resultado financeiro não prevalece automaticamente quando degrada de forma relevante a experiência, confiança ou segurança do cliente.
- A plataforma deve buscar resultado sustentável, não otimização cega de receita.
- Problemas recorrentes do mesmo cliente devem gerar acompanhamento proativo.
- Sinais de fraude devem ser tratados como risco explicável, nunca como culpa presumida.
- Privacidade e LGPD incorporadas à arquitetura.
- Automações críticas implementadas como capacidade nativa da Versa.
- Integrações críticas implementadas por adapters, workers, filas, webhooks e APIs oficiais.
- Nenhum orquestrador externo será dependência necessária para o funcionamento da plataforma.
- Ferramentas externas de automação poderão ser suportadas futuramente como clientes da API e dos webhooks públicos da Versa.
- Agentes não executam continuamente por padrão; cada análise deve possuir motivo, cadência e política explícitos.
- Agenda de agentes e análises deve ser gerenciável dentro da própria plataforma, não hardcoded no código.
- Agente não é sinônimo de LLM.
- IA externa será consultada apenas quando houver ganho real em linguagem natural, interpretação semântica, síntese, geração criativa ou tarefas equivalentes.
- Cálculos, regras, validações, agregações, filtros, scores, alertas e workflows devem preferir execução determinística ou estatística local antes de recorrer a LLM.

### 2.1 Decisão arquitetural — automação e integrações nativas

A arquitetura atual não utilizará n8n como componente interno ou dependência operacional.

A evolução do escopo transformou a Versa de um sistema apoiado por workflows externos em uma plataforma que deverá possuir infraestrutura própria de automação, integração, auditoria e governança.

Decisão vigente:

```text
Versa
→ eventos
→ workers
→ Automation Engine
→ Integration Platform
→ adapters oficiais
→ serviços externos
```

Não será adotado como arquitetura interna:

```text
Versa
→ orquestrador externo obrigatório
→ integrações
```

Consequências:

- o estado das automações permanece dentro da Versa;
- retries, idempotência e circuit breakers permanecem observáveis pela própria plataforma;
- permissões e isolamento de tenant continuam sob o mesmo modelo de autorização;
- custos, falhas e auditoria das integrações ficam centralizados;
- integrações podem participar do mesmo fluxo de decisão e aprovação;
- a plataforma não depende da disponibilidade ou do modelo operacional de uma ferramenta externa;
- adapters poderão ser substituídos sem alterar o domínio;
- APIs e webhooks públicos poderão permitir integrações externas no futuro.

Ferramentas como n8n, Make ou Zapier ficam fora do escopo atual. Uma integração futura com essas ferramentas poderá existir como consumidor opcional da API ou dos webhooks da Versa, sem se tornar dependência da plataforma.

### 2.2 Princípio máximo — cliente, confiança e qualidade de atendimento

A Versa não será otimizada apenas para vender mais.

Hierarquia conceitual:

```text
segurança / legalidade
→ confiança e experiência do cliente
→ saúde sustentável da empresa
→ otimização de receita e eficiência
```

Isso não significa aceitar prejuízo indefinidamente ou ignorar abuso. Significa que a plataforma deverá considerar o custo de longo prazo de:

- atendimento ruim;
- promessa não cumprida;
- problema recorrente;
- demora na resolução;
- cliente frustrado;
- troca mal conduzida;
- pós-venda inexistente;
- falsa acusação de fraude;
- bloqueio indevido;
- experiência deteriorada por uma automação.

Métricas financeiras deverão ser lidas junto de métricas de experiência e confiança.

Uma decisão que aumenta receita no curto prazo, mas aumenta reclamações, recorrência de problemas, cancelamentos ou abandono, não será considerada automaticamente uma boa decisão.

---


## 3. Camadas de inteligência

### 3.1 Camada A — Inteligência determinística

Baseada em SQL, regras, fórmulas, limites e cálculos verificáveis.

Exemplos:

- giro de estoque;
- cobertura;
- ticket médio;
- margem;
- lucro;
- curva ABC;
- produtos parados;
- ruptura;
- estoque mínimo;
- estoque excessivo;
- taxa de conversão;
- CPA;
- ROAS;
- comparação entre períodos;
- metas e desvios;
- alertas operacionais;
- regras de reposição;
- Customer Health Score inicial;
- Índice de Custo de Oportunidade do Estoque inicial;
- ponto de equilíbrio;
- margem de contribuição real;
- ciclo de conversão de caixa;
- burn rate segmentado;
- simulações de pró-labore e retirada;
- health score financeiro explicável.

### 3.2 Camada B — Inteligência estatística e Machine Learning

Baseada em padrões históricos, séries temporais e modelos matemáticos.

Exemplos:

- previsão de vendas;
- previsão de demanda;
- previsão de ruptura;
- previsão de excesso;
- detecção de anomalias;
- clusterização de clientes;
- propensão de recompra;
- risco de abandono;
- detecção de vazio comportamental;
- produtos roteadores;
- análise de cohorts;
- relações entre fornecedores, produtos, pedidos e retenção;
- correlações com atraso temporal entre causa e efeito;
- silêncio anômalo pela ausência de um comportamento esperado;
- cesta perdida e oportunidades de cross-sell não capturadas;
- desvio entre preço tabelado e preço efetivamente praticado;
- deriva de tom e engajamento ao longo das interações;
- cenários financeiros e projeções de caixa;
- previsão híbrida de receita;
- sazonalidade financeira;
- risco de queda abaixo da reserva mínima;
- comparação entre projeção e realizado.

### 3.3 Camada C — Inteligência assistiva com LLM

Responsável por interpretar, explicar, resumir e sugerir ações.

Exemplos:

- explicar indicadores;
- resumir acontecimentos;
- levantar hipóteses;
- sugerir planos de ação;
- produzir campanhas e copys;
- gerar rascunhos de respostas;
- comparar estratégias;
- interpretar dados internos e externos;
- recuperar decisões anteriores;
- explicar riscos;
- gerar sugestões acionáveis;
- registrar justificativas;
- responder perguntas sobre o negócio.

A Camada C não deve:

- inventar fatos;
- substituir regras determinísticas;
- ocultar incertezas;
- executar ações críticas sem autorização;
- apagar ou sobrescrever evidências originais;
- afirmar causalidade quando existe apenas correlação.

#### Grounding obrigatório da Camada C

A Camada C trabalhará com duas fontes separadas:

- **contexto estruturado:** indicadores, eventos e decisões consultados diretamente no PostgreSQL;
- **contexto de texto livre:** mensagens, notas e documentos recuperados por busca semântica.

Regras arquiteturais:

- toda afirmação relevante deve apontar para um `evidence_id`;
- o `evidence_id` deve chegar a uma linha, evento, indicador ou trecho real;
- trechos de texto livre devem preservar origem e posição ou offset;
- contexto SQL e contexto vetorial devem permanecer fisicamente separados;
- embeddings devem ser reprocessados quando o conteúdo original mudar;
- respostas sem evidência citável não serão aceitas em fluxos decisórios;
- um conjunto de perguntas com respostas conhecidas, o **golden set**, deverá medir grounding e alucinação antes da entrada em operação.

---

## 4. Fluxo geral da inteligência

```text
Fato
→ evento
→ dado estruturado
→ indicador
→ análise
→ hipótese
→ recomendação
→ decisão humana
→ ação
→ resultado
→ aprendizado
→ memória estratégica
```

---

# Fase 0 — Fundação estratégica e documentação

**Status:** concluída.

## Objetivo

Definir o que a Versa Platform é antes de iniciar a implementação.

## Tópicos

- visão do produto;
- missão da plataforma;
- problemas que o sistema pretende resolver;
- princípios arquiteturais;
- linguagem ubíqua;
- glossário do negócio;
- domínios e subdomínios;
- contextos delimitados;
- mapa de contextos;
- casos de uso;
- catálogo de eventos;
- regras de negócio;
- agentes previstos;
- arquitetura inicial;
- registro de decisões;
- escopo do MVP;
- limites entre operação, inteligência, decisão e automação;
- documentação da Decision Layer;
- documentação da Strategic Memory;
- documentação da camada de agentes;
- documentação do modelo de maturidade;
- critérios de aceite e recusa de sugestões.

## Contextos principais

- Catalog;
- Inventory;
- Sales;
- Finance;
- Customer Relationship;
- Suppliers;
- Marketing;
- Analytics;
- Strategic Memory;
- Decision Layer;
- Automation.

## Resultado esperado

Uma base documental suficiente para orientar o desenvolvimento sem depender apenas da memória das conversas.

---

# Fase 1 — Fundação executável e primeira vertical slice

**Status:** em andamento.

## Objetivo

Construir a primeira funcionalidade real de ponta a ponta:

```text
Criar produto
→ validar domínio
→ persistir produto
→ registrar ProductCreated
→ processar evento
→ atualizar projeção
→ consultar produto
```

## Tópicos

### Fundação técnica

- monorepo com pnpm;
- Node.js;
- TypeScript estrito;
- Fastify;
- PostgreSQL;
- API;
- worker;
- pacotes compartilhados;
- variáveis de ambiente;
- build;
- typecheck;
- testes;
- Git;
- CI inicial.

### Banco de dados

- pool de conexões;
- migrations;
- checksum de migrations;
- advisory lock;
- transações;
- tabela `schema_migrations`;
- tabela `products`;
- tabela `event_outbox`;
- tabela de projeção de produtos;
- índices;
- constraints;
- rollback;
- isolamento por tenant.

### Multi-tenancy

- `tenantId` obrigatório;
- consultas filtradas por tenant;
- SKU único por tenant;
- isolamento entre organizações;
- proteção contra vazamento de dados;
- futura substituição do header manual por tenant autenticado.

### Domínio Catalog

- entidade `Product`;
- `ProductId`;
- `TenantId`;
- `CategoryId`;
- `EventId`;
- `ProductSku`;
- `ProductName`;
- `ProductStatus`;
- estado inicial `draft`;
- evento `ProductCreated`;
- validação de invariantes.

### Shared Kernel mínimo

- identificadores tipados;
- validação de UUID;
- relógio;
- gerador de IDs;
- erros comuns;
- abstrações realmente compartilhadas.

### Caso de uso

- `CreateProduct`;
- comando de entrada;
- validações;
- persistência transacional;
- tratamento de SKU duplicado;
- retorno do produto criado;
- separação entre aplicação, domínio e infraestrutura.

### API

- `GET /health`;
- `GET /ready`;
- `POST /products`;
- `GET /products/:id`;
- validação de headers;
- validação de body;
- tratamento de erros;
- injeção de dependências;
- testes com `app.inject()`.

### Observabilidade mínima da vertical slice

A primeira vertical slice já deverá produzir uma trilha técnica suficiente para reconstruir uma execução.

- pacote `packages/observability`;
- logger estruturado;
- `correlation_id`;
- `causation_id`;
- `execution_id`;
- contexto de execução;
- timestamps;
- duração das etapas;
- logs de API;
- logs de caso de uso;
- logs de transação;
- logs de outbox;
- logs de worker;
- logs de projeção;
- erros estruturados;
- payloads redigidos quando necessário;
- diferenciação entre eventos técnicos e eventos de negócio;
- base para futura System Timeline.

Fluxo observável esperado:

```text
HTTP
→ Application
→ Domain
→ PostgreSQL
→ Outbox
→ Worker
→ Projection
```

A meta da fase não é construir a interface de observabilidade, mas garantir que os dados de rastreamento existam desde o início.

### Worker e eventos

- polling da outbox;
- processamento em lotes;
- `FOR UPDATE SKIP LOCKED`;
- roteamento por nome e versão;
- idempotência;
- retries;
- `processing_attempts`;
- `last_error`;
- `processed_at`;
- encerramento seguro;
- logs estruturados.

### CQRS inicial

- write model em `products`;
- read model específico para consulta;
- atualização da projeção pelo worker;
- consistência eventual;
- consulta sem sobrecarregar o modelo de escrita.

### Testes

- testes unitários;
- testes de domínio;
- testes de caso de uso;
- testes HTTP;
- testes de integração;
- teste de atomicidade;
- teste de isolamento entre tenants;
- teste do worker;
- teste end-to-end.

### Documentação

- arquitetura da fase;
- contrato HTTP;
- contrato de evento;
- execução local;
- migrations;
- worker;
- troubleshooting;
- ADRs;
- diagrama de sequência.

## Resultado esperado

Primeira vertical slice funcional, modular, multi-tenant, transacional, orientada a eventos, testável e preparada para read models futuros.

---

# Fase 2 — Identidade, autenticação e autorização

## Objetivo

Permitir acesso seguro por pessoas e organizações reais.

## Tópicos

- tenants;
- usuários;
- autenticação;
- login;
- sessões;
- refresh token;
- recuperação e troca de senha;
- perfis;
- papéis;
- permissões;
- autorização por ação;
- associação de usuário a tenant;
- convite de usuários;
- bloqueio e desbloqueio;
- auditoria de login;
- política de senhas;
- rate limiting;
- proteção de rotas;
- contexto autenticado;
- tenant derivado do usuário;
- remoção do `x-tenant-id` manual;
- trilha de auditoria;
- eventos de segurança;
- gestão de dispositivos e sessões;
- consentimentos iniciais;
- gestão de dados pessoais;
- base para LGPD.

## Resultado esperado

Cada usuário acessa somente os dados e as ações permitidas dentro de sua organização.

---

# Fase 3 — Catálogo completo e Actionable Product Foundation

## Objetivo

Transformar o catálogo em uma representação completa e confiável dos produtos, preparando-o para se tornar um centro de decisão.

## Tópicos

- categorias;
- subcategorias;
- marcas;
- coleções;
- tags;
- imagens;
- descrições;
- atributos;
- variantes;
- tamanhos;
- cores;
- materiais;
- códigos de barras;
- SKU por variante;
- produtos simples;
- produtos com variantes;
- kits;
- ativação;
- desativação;
- arquivamento;
- histórico de alterações;
- status comercial;
- disponibilidade;
- validação de cadastro;
- completude do produto;
- prontidão para venda;
- importação e exportação;
- busca;
- filtros;
- paginação;
- read model do catálogo;
- card de produto consolidado;
- tags operacionais;
- base para tags de tração;
- base para tags de ecossistema;
- preparação para Actionable UI.

## Eventos relacionados

- `ProductCreated`;
- `ProductUpdated`;
- `ProductActivated`;
- `ProductDeactivated`;
- `ProductArchived`;
- `ProductVariantCreated`;
- `ProductVariantUpdated`;
- `ProductVariantRemoved`;
- `ProductImageAdded`;
- `ProductImageRemoved`;
- `ProductCategoryChanged`;
- `ProductTagAdded`;
- `ProductTagRemoved`;
- `ProductCollectionChanged`;
- `ProductReadinessReevaluated`.

## Resultado esperado

Um catálogo confiável, pesquisável, projetável e preparado para estoque, vendas, marketing e sugestões acionáveis.

---

# Fase 4 — Estoque e movimentações

## Objetivo

Controlar fisicamente e logicamente produtos vendáveis e materiais operacionais consumidos no fulfillment.

## Princípio de modelagem

```text
Inventory
├── Sellable Products
└── Operational Supplies
```

`SellableProduct` e `OperationalSupply` não são a mesma entidade de domínio. Eles podem compartilhar infraestrutura de movimentação e saldo quando fizer sentido, mas materiais operacionais não devem ganhar artificialmente preço de venda, catálogo comercial ou regras de produto apenas para reutilizar código.

Materiais operacionais incluem, por exemplo:

- sacolas;
- embalagens;
- tags;
- cartões de agradecimento;
- cartões de visita;
- etiquetas;
- fitas;
- adesivos;
- papel de seda;
- materiais de proteção;
- brindes não vendáveis;
- outros consumíveis de fulfillment.

## Tópicos

- cadastro de materiais operacionais;
- categorias de consumíveis;
- unidade de consumo;
- código interno;
- ativação, inativação e descontinuação;
- saldo de consumíveis por localização;

- locais de estoque;
- depósitos;
- lojas;
- saldo por localização;
- entrada e saída;
- ajustes;
- transferências;
- reservas;
- liberação de reserva;
- inventário;
- contagem;
- divergências;
- perdas;
- avarias;
- devoluções;
- estoque mínimo e máximo;
- estoque de segurança;
- ruptura;
- excesso;
- lote;
- validade;
- rastreabilidade;
- custo médio;
- histórico de movimentações;
- reconciliação;
- auditoria;
- capital imobilizado;
- dias sem movimentação;
- base para Índice de Custo de Oportunidade;
- base para Entropia do Estoque;
- tags operacionais em tempo real;
- eventos de indisponibilidade;
- relação entre ruptura e perda de venda;
- consumo de material operacional por pedido;
- custo unitário histórico de consumíveis;
- ponto de reposição de consumíveis;
- cobertura em dias;
- lead time de reposição;
- previsão de ruptura de materiais de fulfillment;
- histórico de uso por produto, pedido, campanha e estratégia.

### OperationalSupply

Estrutura conceitual:

```text
OperationalSupply
├── id
├── tenant_id
├── name
├── internal_code
├── category
├── unit
├── current_stock
├── minimum_stock
├── reorder_point
├── safety_stock
├── average_unit_cost
├── active
├── created_at
└── updated_at
```

### Movimentações de materiais operacionais

```text
OperationalSupplyMovement
├── id
├── supply_id
├── type
├── quantity
├── unit_cost
├── order_id
├── reason
├── actor
├── correlation_id
└── occurred_at
```

Tipos esperados:

- `purchase_entry`;
- `order_consumption`;
- `manual_adjustment`;
- `loss`;
- `disposal`;
- `return_to_stock`;
- `inventory_reconciliation`;
- transferência futura.

## Indicadores

- giro;
- cobertura;
- dias de estoque;
- produtos parados;
- taxa de ruptura;
- perdas;
- divergências;
- estoque imobilizado;
- estoque disponível;
- estoque reservado;
- capital por categoria;
- custo de oportunidade preliminar;
- consumo médio de materiais operacionais;
- cobertura de consumíveis;
- risco de ruptura de consumíveis;
- custo de fulfillment por pedido;
- desperdício de materiais;
- diferença entre consumo previsto e real.

## Resultado esperado

Visibilidade confiável sobre onde cada produto ou material operacional está, quanto existe, como mudou, quanto custa, quanto é consumido e quando precisará ser reposto.

---

# Fase 5 — Fornecedores e compras

## Objetivo

Gerenciar fornecedores, reposições e aquisição de mercadorias.

## Tópicos

- cadastro de fornecedores;
- contatos;
- condições comerciais;
- prazo de entrega;
- pedido de compra;
- itens do pedido;
- aprovação;
- recebimento;
- recebimento parcial;
- divergência;
- custo de aquisição;
- frete;
- impostos;
- lead time;
- histórico de preços;
- catálogo do fornecedor;
- avaliação de fornecedor;
- atraso;
- qualidade;
- devolução ao fornecedor;
- sugestão de reposição;
- comparação de fornecedores;
- previsão de necessidade de compra;
- risco de dependência;
- concentração de fornecedores;
- relação entre atraso e ruptura;
- relação entre fornecedor e LTV;
- dados para o grafo de dependências;
- alertas de recorrência de atraso;
- impacto financeiro de fornecedores;
- fornecedores de materiais operacionais;
- preço histórico por consumível;
- lote mínimo;
- lead time real;
- confiabilidade de fornecimento de embalagens e materiais;
- risco de ruptura operacional;
- sugestão de reposição de consumíveis baseada em cobertura e demanda prevista.

### Supplier Intelligence para materiais operacionais

Exemplo de visão:

```text
Sacola kraft
Fornecedor atual: Fornecedor X
Última compra: 500 unidades
Custo: R$ 0,42/un
Prazo médio: 8 dias
Estoque atual: 47
Ponto de pedido: 80
```

A análise deverá considerar preço, prazo, lote mínimo, qualidade, disponibilidade, histórico de atraso, confiabilidade e impacto potencial de ruptura.

## Agente de fornecedores

- comparar preços;
- avaliar prazos;
- identificar atrasos;
- sugerir fornecedores;
- detectar concentração de risco;
- acompanhar qualidade;
- recomendar renegociação;
- comparar custo total;
- relacionar desempenho do fornecedor com vendas e satisfação.

## Resultado esperado

Compras orientadas por necessidade, custo, prazo, qualidade, risco e impacto no cliente.

---

# Fase 6 — Vendas, pedidos e canais

## Objetivo

Registrar e acompanhar o ciclo completo das vendas.

## Tópicos

- canais de venda;
- pedido;
- itens;
- carrinho;
- cliente;
- desconto;
- cupom;
- pagamento;
- confirmação;
- cancelamento;
- separação;
- entrega;
- retirada;
- devolução;
- troca;
- reembolso;
- status do pedido;
- histórico;
- venda presencial;
- venda por WhatsApp;
- venda pelo site;
- integração futura com marketplaces;
- frete;
- custo de entrega;
- comissão;
- origem da venda;
- atribuição de campanha;
- sessão;
- UTMs;
- identificadores de clique;
- eventos de navegação ligados ao pedido;
- carrinho abandonado;
- produtos vistos;
- produtos adicionados;
- carrinhos incompletos;
- produtos complementares;
- base para produtos roteadores;
- base para grafo de dependências;
- base para linha do tempo unificada.

## Eventos relacionados

- pedido criado;
- pedido confirmado;
- pagamento recebido;
- pedido cancelado;
- item separado;
- pedido enviado;
- pedido entregue;
- devolução solicitada;
- troca solicitada;
- reembolso realizado;
- carrinho criado;
- carrinho abandonado;
- produto visualizado;
- produto adicionado ao carrinho;
- avaliação de risco transacional solicitada;
- acompanhamento prioritário solicitado;
- ocorrência de cliente registrada;
- pedido marcado para revisão próxima;
- acompanhamento pós-entrega solicitado.

### Consumo de materiais por pedido

Cada pedido poderá registrar quais materiais operacionais foram realmente utilizados e em qual quantidade.

Exemplo:

```text
Pedido #1058

Produtos
→ 2 blusas

Materiais utilizados
→ 1 sacola
→ 2 tags
→ 1 cartão de agradecimento
→ 1 embalagem
```

Ao confirmar o fulfillment, o consumo deverá:

- baixar estoque;
- registrar custo unitário vigente;
- atualizar custo físico do pedido;
- preservar usuário e timestamp;
- carregar `correlation_id`;
- ser idempotente para que retries não dupliquem baixas.

### Packaging Recipes / Receitas de Embalagem

Para evitar preenchimento repetitivo, a Versa poderá sugerir automaticamente os materiais esperados.

```text
Embalagem padrão — 1 peça
→ 1 sacola
→ 1 embalagem
→ 1 tag
→ 1 cartão de agradecimento
→ 1 cartão de visita
```

```text
Embalagem — 2 a 3 peças
→ 1 sacola grande
→ 1 embalagem
→ 3 tags
→ 1 cartão de agradecimento
→ 1 cartão de visita
```

A receita pode depender de quantidade, produto, categoria, canal, campanha, estratégia, opção de presente ou experiência de unboxing.

Fluxo:

```text
receita prevista
→ usuário confirma/ajusta
→ consumo real
→ baixa de estoque
→ custo real do pedido
```

O consumo previsto e o real devem ser preservados separadamente.

### Custo físico real do pedido

A análise de margem poderá incluir os materiais consumidos.

```text
Venda                      R$ 34,90
Produto                    R$ 15,26
Sacola                     R$  0,42
Tag                        R$  0,18
Cartão                     R$  0,12
Embalagem                  R$  0,35
──────────────────────────────────
Custo físico               R$ 16,33
```

Isso evita superestimar margem ao ignorar custos recorrentes de fulfillment.

### Gatilhos de cuidado e risco no pedido

Uma nova compra poderá disparar avaliações independentes:

```text
novo pedido
├── Trust & Risk Assessment
└── Customer Care Watch
```

Esses fluxos não devem ser confundidos.

- risco transacional avalia sinais objetivos de possível fraude ou abuso;
- Customer Care Watch avalia se a empresa precisa acompanhar aquele cliente com mais cuidado;
- um cliente pode exigir acompanhamento prioritário sem possuir qualquer risco transacional;
- um alerta de fraude não deve criar automaticamente uma marca permanente no perfil.

Exemplos de ações possíveis:

- revisão manual antes do envio;
- conferência adicional do produto;
- fotografia interna de conferência;
- acompanhamento de postagem;
- confirmação de entrega;
- contato pós-venda;
- encaminhamento para atendimento prioritário;
- solicitação de revisão de pagamento.

### Atendimento inicial por WhatsApp

- envio de mensagens permanece manual;
- geração de texto pelo sistema;
- abertura por link `wa.me` pré-preenchido;
- possibilidade de registrar o clique por mecanismo interno de tracking;
- nenhuma leitura automática por biblioteca não oficial;
- nenhuma automação que coloque o número comercial em risco;
- importação seletiva de conversas por colagem manual;
- preservação fiel do texto bruto importado;
- associação da conversa a cliente, pedido ou oportunidade;
- solução transitória até o fechamento de vendas migrar progressivamente para o site.

### Preço informado durante o atendimento

- captura do valor mencionado em conversa importada;
- comparação com preço oficial;
- identificação de desconto informal;
- registro do preço praticado;
- alerta de erosão de margem;
- distinção entre preço autorizado e exceção não registrada.

> A extração automática de valores em texto livre será implementada somente quando houver base real de conversas e critérios de validação.

## Resultado esperado

Uma visão única das vendas e da jornada de compra, independentemente do canal utilizado.

---

# Fase 7 — Clientes, Customer Experience e relacionamento

## Objetivo

Construir uma visão completa do relacionamento com cada cliente, tratando-o como uma jornada contínua e não como um cadastro estático.

## Tópicos

### Perfil do cliente

- cadastro;
- contatos;
- endereços;
- consentimentos;
- histórico de compras;
- preferências;
- tamanhos;
- categorias favoritas;
- ticket médio;
- frequência;
- última compra;
- recência;
- canais preferidos;
- interações;
- atendimentos;
- reclamações;
- devoluções;
- trocas;
- fidelidade;
- recompra;
- valor do cliente;
- aniversários;
- jornada do cliente;
- histórico estruturado de incidentes;
- responsabilidade do incidente;
- severidade;
- resolução;
- outcome;
- recorrência;
- Customer Experience Risk;
- Customer Care Watch;
- acompanhamento prioritário;
- recuperação de confiança;
- histórico de acompanhamento;
- remoção de marcação quando não for mais necessária.

### Customer Incident History

Problemas não serão registrados apenas como texto solto.

Estrutura conceitual:

```text
CustomerIncident
├── id
├── customer_id
├── order_id
├── type
├── severity
├── source
├── description
├── responsibility
├── resolution
├── outcome
└── occurred_at
```

Responsabilidade possível:

```text
company
customer
carrier
supplier
payment_provider
unknown
```

O objetivo é evitar classificar como “cliente problemático” alguém que sofreu repetidamente falhas da própria operação.

### Customer Care Watch

Clientes com histórico relevante de problemas poderão receber acompanhamento reforçado em uma nova compra.

Fluxo:

```text
nova compra
→ histórico relevante
→ risco de repetição
→ acompanhamento recomendado
→ ações preventivas
→ entrega
→ follow-up
→ outcome
```

Níveis iniciais:

```text
normal
attention
priority_follow_up
critical_review
```

Motivos deverão ser explícitos e separados:

```text
risco transacional
problemas operacionais anteriores
experiência negativa recorrente
acompanhamento VIP
outro motivo documentado
```

Acompanhamento possível:

- conferência manual;
- atenção adicional à separação;
- revisão de endereço;
- verificação de embalagem;
- acompanhamento do transporte;
- contato pós-entrega;
- prioridade no SAC;
- revisão após resolução.

### Recuperação de confiança

Um incidente não termina apenas quando o ticket é fechado.

```text
problema
→ resolução
→ confirmação
→ nova compra
→ acompanhamento
→ experiência posterior
→ confiança recuperada ou risco persistente
```

A plataforma deverá medir quando possível:

- recorrência;
- reabertura;
- tempo até resolução real;
- satisfação após resolução;
- recompra após incidente;
- tempo de recuperação;
- problemas evitados em compras posteriores.

### Customer Experience Risk

Separado de risco de fraude.

Pode considerar:

- problemas recentes;
- falhas repetidas da empresa;
- entregas problemáticas;
- reclamações não resolvidas;
- reabertura;
- sentimento negativo;
- experiência ruim após recompra;
- risco de repetição.

O score deverá ser explicável e poderá existir inicialmente de forma determinística.

### Linha do Tempo Unificada

- Customer Event Timeline;
- `AdClicked`;
- `SiteVisited`;
- `ProductViewed`;
- `WhatsAppConversationStarted`;
- `WhatsAppMessageSent`;
- `CartCreated`;
- `CartAbandoned`;
- `OrderPlaced`;
- `OrderPaid`;
- `OrderDelivered`;
- `FeedbackRequested`;
- `FeedbackReceived`;
- `CustomerReactivated`;
- histórico imutável de interações;
- busca por eventos;
- visão cronológica;
- origem de cada evento;
- conversas relevantes importadas manualmente;
- mensagens preservadas sem interpretação obrigatória no momento da captura;
- origem da importação e usuário responsável;
- cobertura declaradamente seletiva, sem promessa de monitoramento completo.

### Limite da captura inicial do WhatsApp

- somente conversas coladas manualmente entrarão no sistema;
- o histórico disponível não representará todo o canal;
- silêncio anômalo e deriva de tom só poderão ser avaliados nos clientes com histórico suficiente;
- a limitação deverá aparecer na confiança de qualquer análise;
- a venda pelo site será o ponto de virada para uma captura mais completa e estruturada.

### Atribuição multi-touch

- UTMs;
- campanha;
- conjunto;
- anúncio;
- criativo;
- landing page;
- sessão;
- dispositivo;
- origem;
- mídia;
- `fbp`;
- `fbc`;
- identificadores de clique;
- atribuição observada;
- atribuição declarada;
- atribuição estimada;
- primeira interação;
- última interação;
- caminho completo até a conversão;
- vínculo entre marketing e primeira compra;
- vínculo entre marketing e LTV.

### Customer Health Score

- score de 0 a 100;
- RFM;
- engajamento;
- devoluções;
- reclamações;
- tempo sem comprar;
- risco de esfriamento;
- alertas proativos;
- explicação do score;
- histórico do score;
- versão determinística;
- versão estatística futura.

### Loop de unboxing e sentimento

- gatilho após `OrderDelivered`;
- espera configurável;
- solicitação de feedback;
- WhatsApp;
- e-mail;
- preservação da resposta original;
- classificação de sentimento;
- classificação por tema;
- confiança da classificação;
- tag de risco;
- alerta de churn;
- ação de recuperação;
- aprendizado sobre produto;
- aprendizado sobre embalagem;
- aprendizado sobre tamanho;
- aprendizado sobre qualidade.

### Cohorts e safras

- campanha de aquisição;
- mês da primeira compra;
- estação;
- primeira categoria;
- primeiro produto;
- primeiro canal;
- primeira oferta;
- desconto inicial;
- localização;
- criativo;
- coleção;
- retenção por safra;
- LTV por safra;
- recompra por safra;
- comparação marca versus desconto.

### Customer Intelligence

- segmentação RFM;
- clientes novos;
- clientes recorrentes;
- clientes inativos;
- clientes de alto valor;
- clientes sensíveis a preço;
- probabilidade de recompra;
- risco de abandono;
- oportunidade de reativação;
- vazio comportamental;
- mudança de cadência;
- sinais silenciosos de insatisfação;
- silêncio anômalo pela interrupção de uma cadência esperada;
- deriva de tom, redução do tamanho das respostas e aumento do intervalo entre mensagens;
- grau de cobertura do histórico utilizado na análise;
- risco de repetição de problemas;
- recuperação de confiança;
- necessidade de acompanhamento;
- distinção entre falha da empresa e comportamento do cliente;
- impacto de incidentes na recompra;
- qualidade do atendimento ao longo do tempo.

### Métricas de qualidade de atendimento

Evitar métricas simplistas como quantidade de tickets fechados.

Priorizar:

- First Contact Resolution quando aplicável;
- tempo até resolução real;
- taxa de reabertura;
- recorrência do mesmo problema;
- satisfação;
- recompra após incidente;
- tempo de recuperação;
- problemas evitados;
- qualidade percebida;
- necessidade de intervenção manual;
- experiência na compra seguinte.

## Resultado esperado

Relacionamentos mais personalizados, mensuráveis e sustentados por uma linha do tempo confiável, com prevenção de recorrência, recuperação de confiança e acompanhamento proativo.

---

# Fase 8 — Financeiro, custos, preços e margem

## Objetivo

Transformar vendas e operações em uma visão financeira confiável.

## Tópicos

- receitas;
- despesas;
- contas a pagar;
- contas a receber;
- categorias financeiras;
- fluxo de caixa;
- conciliação;
- custo de produto;
- custo de frete;
- impostos;
- taxas;
- comissões;
- descontos;
- custo de aquisição;
- margem bruta;
- margem líquida;
- lucro por produto;
- lucro por pedido;
- lucro por canal;
- lucro por campanha;
- preço de venda;
- histórico de preços;
- políticas de desconto;
- preço mínimo;
- margem mínima;
- ponto de equilíbrio;
- orçamento;
- metas financeiras;
- projeção de caixa;
- capital imobilizado;
- custo de oportunidade;
- retorno do estoque;
- simulação de realocação de capital;
- impacto de promoções;
- impacto de ruptura;
- impacto de produtos roteadores;
- desvio entre preço tabelado e preço praticado;
- descontos informais concedidos em atendimento;
- erosão silenciosa de margem;
- reconciliação entre pedido, conversa e preço oficial;
- runway;
- ponto de equilíbrio;
- margem de contribuição real;
- ciclo de conversão de caixa;
- burn rate segmentado;
- cenários de caixa;
- capital imobilizado pelo custo;
- CAC versus LTV;
- orçado versus realizado;
- obrigações fiscais;
- health score financeiro;
- pró-labore;
- distribuição de lucros;
- reserva mínima;
- retirada segura;
- simulações financeiras;
- previsão híbrida de receita;
- sazonalidade de referência;
- validação contábil e tributária.

### Métricas financeiras avançadas

#### Ponto de equilíbrio

- custo fixo;
- custo variável;
- margem de contribuição;
- receita mínima;
- volume mínimo de vendas;
- visão mensal e por cenário.

#### Margem de contribuição real

```text
preço efetivamente praticado
- custo do produto
- desconto
- taxa de pagamento
- imposto variável
- frete subsidiado
- embalagem variável
- comissão
- custo variável esperado
= margem de contribuição real
```

Dimensões:

- produto;
- variante;
- pedido;
- categoria;
- canal;
- campanha;
- cliente;
- período.

#### Ciclo de conversão de caixa

- prazo de pagamento ao fornecedor;
- tempo em estoque;
- prazo de recebimento;
- necessidade de capital de giro;
- impacto do crescimento;
- diferença entre lucro e liquidez.

#### Burn rate segmentado

- fixo;
- variável;
- operacional;
- marketing;
- estoque;
- folha;
- pró-labore;
- impostos;
- tecnologia;
- logística.

#### Projeção de caixa por cenários

- vendas interrompidas;
- vendas mantidas;
- crescimento;
- queda;
- cenário manual;
- cenário automático;
- menor saldo;
- mês de ruptura;
- primeiro mês abaixo da reserva;
- diferença acumulada.

#### Capital imobilizado

- custo contábil;
- custo de reposição;
- valor atual de venda;
- valor estimado de liquidação;
- perda sazonal;
- custo de oportunidade;
- potencial de recuperação.

#### CAC versus LTV

- janela de cálculo;
- canal;
- campanha;
- cohort;
- modelo de atribuição;
- custos incluídos;
- margem ou receita usada no LTV;
- dado realizado versus projetado;
- confiança.

#### Orçado versus realizado

- receita;
- custo do produto;
- frete;
- taxas;
- marketing;
- despesas operacionais;
- pró-labore;
- impostos;
- compras;
- margem;
- saldo final;
- runway;
- diferença absoluta;
- diferença percentual;
- hipótese relacionada;
- decisão relacionada;
- aprendizado.

### Pró-labore e retirada de lucros

#### Distinção

- pró-labore é remuneração recorrente pelo trabalho;
- pró-labore integra o custo operacional;
- distribuição de lucros é variável;
- lucro contábil não equivale a caixa disponível;
- retirada não será automaticamente autorizada pelo sistema.

#### Política de reserva mínima

- referência inicial de três meses de burn rate;
- quantidade de meses configurável por tenant;
- versionamento;
- data de vigência;
- justificativa;
- histórico de alterações.

#### Limite gerencial de retirada

```text
caixa disponível
- reserva mínima
- obrigações de curto prazo
- impostos provisionados
- fornecedores a pagar
- reposições comprometidas
- retiradas já aprovadas
= limite gerencial de retirada
```

Não entram como caixa disponível:

- contas a receber não liquidadas;
- estoque contabilizado como ativo;
- vendas projetadas;
- crédito disponível;
- lucro ainda não convertido em caixa;
- valores com destinação específica.

Estados:

```text
simulado
→ aguardando validação contábil
→ aprovado
→ executado
```

### Simulação de pró-labore

Entradas:

- pró-labore atual;
- pró-labore simulado;
- caixa;
- burn rate sem pró-labore;
- receita projetada;
- recebimentos;
- obrigações;
- horizonte;
- reserva mínima;
- cenário.

Saídas:

- saldo mês a mês;
- runway;
- menor saldo;
- mês de ruptura;
- primeiro mês abaixo da reserva;
- diferença acumulada;
- risco;
- premissas.

As simulações serão salvas para comparação posterior com o realizado.

> Fórmula e schema técnico pendentes. Serão definidos na Fase 8.

### Previsão híbrida de receita

Princípio:

```text
previsão automática
→ ajuste manual opcional
→ valor efetivo
→ simulação
→ realizado
→ comparação
→ aprendizado
```

Campos conceituais:

- período;
- valor automático;
- fonte automática;
- valor manual;
- justificativa do override;
- valor efetivo;
- confiança;
- versão do modelo;
- versão da sazonalidade;
- autor;
- data de cálculo;
- data de alteração.

A previsão automática permanece preservada, mesmo quando existe ajuste manual.

### Sazonalidade de referência

- Dia das Mães;
- Dia dos Namorados;
- troca de coleção;
- Black Friday;
- Natal;
- outras datas relevantes;
- fonte;
- segmento;
- versão;
- índice;
- confiança;
- substituição gradual pelo histórico da loja.

### Obrigações fiscais

- tipo;
- competência;
- vencimento efetivo;
- valor esperado;
- valor realizado;
- status;
- fonte;
- confirmação contábil;
- pagamento;
- documento relacionado;
- alertas no painel;
- Telegram para severidade alta ou crítica.

Datas não deverão ser rigidamente codificadas no sistema.

### Health score financeiro

Componentes:

- runway;
- margem;
- ciclo de caixa;
- capital imobilizado;
- inadimplência;
- obrigações fiscais;
- risco da previsão.

O score deverá preservar:

- pesos;
- versão da fórmula;
- data;
- faixas;
- evidências;
- fatores positivos;
- riscos;
- evolução histórica.

## Agente de Pricing

- analisar custos;
- acompanhar margens;
- sugerir preços;
- alertar margem baixa;
- simular descontos;
- comparar cenários;
- identificar produtos subprecificados;
- identificar preços que prejudicam conversão;
- identificar produtos roteadores que não devem sofrer reajustes agressivos;
- sugerir redução de preço com justificativa;
- registrar decisão de preço;
- avaliar resultado posterior.

## Resultado esperado

Decisões comerciais baseadas em lucro real, caixa, capital, margem, obrigações, cenários, comportamento e papel estratégico de cada produto.

---

# Fase 9 — Analytics, dashboards e Actionable UI

## Objetivo

Consolidar dados em indicadores úteis e transformar interfaces passivas em centros de decisão.

## Tópicos

### Dashboards

- KPIs;
- filtros por período;
- comparação entre períodos;
- metas;
- alertas;
- relatórios;
- exportações;
- vendas;
- estoque;
- clientes;
- fornecedores;
- financeiro;
- campanhas;
- produtos;
- canais;
- regiões;
- horários;
- categorias;
- SKUs;
- variantes;
- drill-down;
- séries temporais;
- indicadores em tempo real;
- indicadores consolidados;
- ponto de equilíbrio;
- runway;
- burn rate por categoria;
- margem de contribuição real;
- ciclo de conversão de caixa;
- capital imobilizado;
- CAC versus LTV;
- orçado versus realizado;
- obrigações fiscais;
- health score financeiro;
- cenários de pró-labore;
- alertas de reserva mínima.

### Sistema de alertas

- origem;
- categoria;
- severidade;
- entidade afetada;
- tenant;
- mensagem;
- evidências;
- estado;
- data de abertura;
- data de resolução;
- deduplicação;
- cooldown;
- notificação de retorno ao normal;
- histórico de notificações.

Política inicial:

- `critico`: painel e Telegram;
- `alto`: painel e Telegram;
- `medio`: painel;
- `baixo`: painel.

A mesma origem e categoria não deverão notificar repetidamente antes do cooldown ou de uma mudança real de estado.

### Read models

- projeções por produto;
- projeções por cliente;
- projeções financeiras;
- projeções de campanha;
- projeções de estoque;
- cards consolidados;
- worker de atualização;
- consistência eventual;
- versionamento de projeções;
- reconstrução de read models;
- consultas em milissegundos.

### Actionable UI do catálogo

- card de produto;
- tags operacionais;
- tags de tração;
- tags de ecossistema;
- status comercial;
- estoque;
- promoção;
- score;
- conversão;
- vendas por período;
- margem;
- anúncios ativos;
- alertas;
- sugestões de agente;
- ação em um clique;
- histórico da recomendação;
- evidência da recomendação;
- impacto estimado;
- botão para gerar rascunho;
- botão para aplicar e registrar decisão;
- confirmação humana;
- auditoria da ação.

### Métricas principais

- faturamento;
- lucro;
- margem;
- ticket médio;
- quantidade de pedidos;
- taxa de conversão;
- taxa de recompra;
- giro;
- cobertura;
- ruptura;
- estoque parado;
- ROAS;
- CPA;
- CAC;
- LTV;
- produtos mais vendidos;
- produtos mais lucrativos;
- produtos encalhados;
- produtos roteadores;
- Customer Health Score;
- cohorts;
- capital imobilizado;
- custo de oportunidade;
- score de tração.

## Resultado esperado

Uma central operacional e decisória que mostre o estado do negócio e permita agir sem abandonar governança e auditoria.

---

# Fase 10 — Marketing e campanhas

## Objetivo

Planejar, executar, acompanhar e aprender com ações de marketing.

## Tópicos

- campanhas;
- canais;
- público-alvo;
- orçamento;
- criativos;
- copys;
- ofertas;
- produtos promovidos;
- calendário;
- objetivos;
- métricas;
- custo;
- alcance;
- cliques;
- conversões;
- vendas atribuídas;
- CPA;
- ROAS;
- margem da campanha;
- testes A/B;
- hipóteses;
- histórico;
- aprendizados;
- campanhas locais;
- Instagram;
- Meta Ads;
- WhatsApp;
- site;
- recuperação de clientes;
- lançamento de coleção;
- queima de estoque;
- campanhas baseadas em Customer Health Score;
- campanhas por cohort;
- campanhas por contexto ambiental;
- campanhas baseadas em fraquezas do mercado;
- campanhas orientadas por estoque e margem;
- campanhas para produtos roteadores;
- Strategy como entidade de primeira classe;
- Strategy Workspace;
- estratégias em cards;
- vínculo estratégia → produtos;
- vínculo estratégia → campanhas;
- vínculo estratégia → posts;
- vínculo estratégia → automações;
- vínculo estratégia → agentes;
- contribuição individual dos agentes;
- hipótese da estratégia;
- objetivo;
- canais;
- táticas;
- público/contexto;
- período;
- custos;
- métricas;
- outcomes;
- aprendizados;
- histórico de versões;
- ativação, pausa e reativação;
- comparação entre versões;
- hipótese confirmada, parcialmente confirmada, rejeitada ou inconclusiva.

### Estratégias e materiais operacionais

Uma estratégia poderá declarar materiais operacionais adicionais exigidos por execução ou por pedido.

```text
Estratégia: Unboxing premium de lançamento

Consumo por pedido
→ 1 embalagem especial
→ 1 adesivo
→ 1 cartão personalizado
```

O Strategy Workspace deverá relacionar esses materiais à estratégia para permitir cálculo de custo, previsão de necessidade e análise posterior de outcome.

### Strategy como entidade própria

`Strategy` não deverá ser sinônimo de campanha.

```text
Strategy
= hipótese + lógica + objetivo

Campaign
= execução específica

Post / Story / Ad
= peças da execução

Automation
= mecanismo que pode executar parte da estratégia
```

Uma única estratégia poderá gerar várias campanhas e execuções ao longo do tempo.

Estrutura conceitual:

```text
Strategy
├── id
├── tenant_id
├── title
├── objective
├── hypothesis
├── description
├── type
├── channels
├── tactics
├── audience_context
├── start_at
├── end_at
├── status
├── products
├── campaigns
├── posts
├── automations
├── agents
├── contributions
├── expected_outcomes
├── actual_outcomes
├── learnings
├── version
└── audit
```

### Ciclo de vida da estratégia

Estados iniciais:

```text
draft
active
paused
completed
archived
```

Regras:

- `paused` interrompe novas execuções sem apagar histórico;
- uma estratégia pausada poderá ser reativada;
- reativação preserva resultados anteriores;
- mudanças relevantes criam nova versão;
- estratégias concluídas continuam consultáveis;
- arquivamento não apaga evidências nem outcomes.

### Hipótese estratégica

Toda estratégia relevante deverá poder declarar uma hipótese.

Exemplo:

```text
Postagens em grupos locais terão CAC menor
que tráfego pago para produtos abaixo de R$ 50.
```

Resultado da hipótese:

```text
confirmed
partially_confirmed
rejected
inconclusive
```

O resultado deve ser sustentado por dados, período, amostra e limitações.

## Agente de Marketing e Copy

- gerar ideias;
- criar copys;
- adaptar mensagens;
- explorar dores reais;
- construir ofertas;
- sugerir testes;
- analisar campanhas anteriores;
- propor novos ângulos;
- evitar repetição de estratégias malsucedidas;
- usar evidências internas;
- usar contexto de concorrência;
- usar contexto ambiental;
- gerar rascunhos acionáveis.

## Agente de Social Media

- calendário;
- posts;
- stories;
- roteiros;
- legendas;
- campanhas sazonais;
- reaproveitamento;
- consistência de marca;
- adaptação por canal;
- resposta a tendências;
- apoio a lançamentos;
- tom de voz.

### Galeria de produtos e ativos criativos

- vínculo com produto;
- arquivo preparado externamente;
- destino do ativo;
- tipo de foto;
- ocasião;
- descrição;
- contexto textual;
- versão;
- origem;
- data de upload;
- status de uso;
- histórico de utilização;
- busca por metadados;
- fornecimento de contexto aos agentes de Social Media e Copy.

Decisões:

- os agentes trabalharão apenas com metadados e contexto textual;
- não haverá análise da imagem por modelo de visão nesta etapa;
- o backend não redimensionará, comprimirá nem gerará derivados;
- Canva continuará sendo usado para redes sociais;
- iLoveIMG continuará sendo usado para compressão de imagens do site;
- uma mesma foto poderá possuir registros distintos por destino.

> Schema técnico pendente. Será definido na fase correspondente.

## Resultado esperado

Marketing conectado diretamente a vendas, margem, estoque, clientes, contexto, ativos criativos e histórico de decisões.

---

# Fase 11 — Inteligência de mercado e competitiva

## Objetivo

Adicionar contexto externo às decisões internas e transformar monitoramento de concorrentes em engenharia de experiência.

## Tópicos

### Inteligência de mercado

- concorrentes;
- preços;
- tendências;
- produtos emergentes;
- comportamento regional;
- sazonalidade;
- datas comerciais;
- mudanças no setor;
- fornecedores;
- oportunidades;
- ameaças;
- posicionamento;
- diferenciação;
- monitoramento de redes;
- análise de avaliações;
- pesquisa de público.

### Coleta externa

- arquitetura de filas;
- workers;
- scrapers autorizados;
- APIs;
- fontes públicas;
- rate limits;
- proxies quando permitidos;
- versionamento de coleta;
- data da coleta;
- fonte;
- localidade;
- validade;
- confiabilidade;
- normalização;
- deduplicação;
- histórico de mudança.

### Radar de fraquezas

- avaliações de concorrentes;
- reclamações;
- redes sociais;
- temas recorrentes;
- qualidade;
- tamanho;
- tecido;
- prazo;
- troca;
- atendimento;
- embalagem;
- reembolso;
- durabilidade;
- transparência;
- encolhimento;
- frequência;
- tendência;
- hipótese de oportunidade;
- campanha baseada em dor real;
- validação antes de agir.

### Engenharia do “Uau”

- unboxing reviews;
- práticas de grandes marcas;
- embalagem;
- personalização;
- comunicação;
- acompanhamento;
- instruções;
- brindes;
- velocidade;
- tratamento de problemas;
- pós-venda;
- recuperação de falhas;
- registro como inspiração;
- transformação em hipótese;
- experimento;
- decisão;
- resultado.

### Batalha de promessas

- política de troca;
- prazo de frete;
- devolução;
- garantia;
- formas de pagamento;
- parcelamento;
- atendimento;
- disponibilidade;
- descontos;
- programa de fidelidade;
- histórico de mudanças;
- alertas de defasagem;
- eventos de mudança competitiva.

### Matriz de tom de voz

- tipo de problema;
- gravidade;
- emoção do cliente;
- canal;
- momento da jornada;
- responsabilidade da empresa;
- ação de reparação;
- tom recomendado;
- respostas bem-sucedidas;
- respostas malsucedidas;
- padrões de empatia;
- rascunhos para SAC;
- revisão humana.

### Contexto ambiental

- clima;
- previsão do tempo;
- feriados;
- eventos locais;
- calendário escolar;
- datas comerciais;
- festividades;
- shows;
- eventos esportivos;
- movimentos regionais;
- tendências públicas.

## Resultado esperado

Decisões que considerem o mercado, a experiência oferecida por outras marcas e sinais ambientais externos.

---

# Fase 12 — Estatística, Machine Learning e inteligência profunda

## Objetivo

Antecipar cenários, detectar relações ocultas e revelar padrões difíceis de encontrar manualmente.

## Tópicos

### Fundação de dados

- preparação de dados;
- qualidade;
- completude;
- normalização;
- séries temporais;
- features;
- versionamento de datasets;
- rastreabilidade;
- monitoramento de deriva;
- avaliação de modelos;
- métricas de erro;
- reprocessamento;
- comparação modelo versus regra.

### Previsões

- vendas;
- consumo de materiais operacionais;
- cobertura de consumíveis;
- ponto de reposição;
- data provável de ruptura de embalagens, sacolas, tags e outros materiais;
- demanda;
- ruptura;
- excesso;
- recompra;
- abandono;
- fluxo de caixa;
- sazonalidade;
- tendência;
- necessidade de compra;
- receita;
- fluxo de caixa;
- runway;
- risco de reserva mínima;
- cenários de pró-labore;
- sazonalidade financeira;
- diferença entre previsão e realizado.

### Modelagem financeira

- previsão híbrida automática e manual;
- cenários de crescimento, manutenção e queda;
- distribuição probabilística quando houver maturidade;
- intervalo de confiança;
- sensibilidade a receita, margem e burn rate;
- risco de ruptura de caixa;
- comparação entre modelos;
- aprendizado com orçado versus realizado.

### Padrões invisíveis e correlações cruzadas

#### Correlação com atraso

- causas cujo efeito aparece semanas ou meses depois;
- relação temporal entre atraso de fornecedor e cancelamento;
- impacto tardio de ruptura;
- janela de defasagem configurável;
- comparação com grupos de controle quando possível;
- registro explícito de que correlação não prova causalidade.

#### Silêncio anômalo

- ausência de compra esperada;
- ausência de resposta esperada;
- quebra de cadência;
- diferença entre silêncio real, sazonalidade e falta de cobertura de dados;
- confiança proporcional à completude do histórico.

#### Cesta perdida

- combinações esperadas que não aparecem;
- oportunidade de cross-sell;
- itens complementares ausentes;
- comparação entre cestas semelhantes;
- impacto potencial no ticket e na margem.

#### Desvio de preço praticado

- preço oficial;
- preço mencionado em conversa;
- desconto concedido;
- autorização;
- margem estimada;
- recorrência por atendente, produto ou canal.

#### Deriva de tom e engajamento

- respostas progressivamente mais curtas;
- aumento do intervalo entre mensagens;
- redução da iniciativa do cliente;
- mudança de sentimento;
- risco precoce de insatisfação;
- análise limitada às conversas efetivamente importadas.

### Trust & Risk Intelligence

A plataforma poderá combinar regras determinísticas, sinais estatísticos e explicação assistiva para avaliar possíveis riscos transacionais.

Sinais possíveis:

- múltiplas tentativas de pagamento;
- muitos meios de pagamento em curto intervalo;
- chargebacks anteriores;
- pedidos repetidos e cancelados;
- divergências operacionais relevantes;
- valor muito fora do padrão do próprio histórico;
- sequências anômalas de pedidos;
- contas ou pedidos possivelmente relacionados por sinais técnicos permitidos;
- padrões incomuns de checkout;
- histórico de fraude confirmada quando legalmente e operacionalmente válido.

A saída deverá registrar:

```text
RiskCase
├── signals
├── score
├── confidence
├── recommendation
├── human_review
├── final_outcome
└── false_positive
```

Princípios:

- risco não equivale a culpa;
- score deve ser explicável;
- LLM não é fonte única de bloqueio;
- sinais sensíveis ou discriminatórios não serão usados;
- falsos positivos devem ser medidos;
- decisões relevantes exigem revisão conforme nível de risco;
- marcações devem poder ser revistas e removidas;
- outcome real deve retroalimentar avaliação do modelo/regra.

### Customer Experience Intelligence

Modelos futuros poderão estimar:

- risco de nova frustração;
- chance de recorrência do mesmo problema;
- probabilidade de reabertura;
- risco de abandono após incidente;
- probabilidade de recuperação;
- impacto de resolução rápida;
- necessidade de acompanhamento prioritário.

Esses modelos devem distinguir claramente:

```text
risco causado pelo cliente
≠
risco de a empresa falhar novamente com o cliente
```

### Decision Pattern Intelligence

A plataforma poderá detectar padrões operacionais de decisão do usuário sem transformar isso em diagnóstico psicológico.

Dimensões possíveis:

- tolerância a risco por domínio;
- frequência de override;
- frequência de justificativa;
- preferência por evidências;
- preferência por simulações;
- tendência a aprovar, rejeitar, editar ou adiar;
- horizonte de decisão;
- aderência a políticas;
- reação a alertas;
- velocidade de revisão;
- preferência por margem versus crescimento em contextos específicos;
- comportamento diante de incerteza operacional;
- diferença entre preferência declarada e comportamento observado.

A análise deverá separar:

```text
fato observado
→ padrão
→ interpretação
```

Cada interpretação deve possuir:

- período;
- tamanho da amostra;
- evidências;
- confiança;
- limitações;
- versão;
- possibilidade de contestação.

### Detecção de anomalias

- outliers;
- queda súbita de vendas;
- aumento inesperado de devolução;
- mudança de conversão;
- ruptura atípica;
- alteração de comportamento;
- anomalia por ausência;
- vazio comportamental.

### Forecasting de materiais operacionais

A previsão deverá combinar:

- estoque atual;
- consumo médio por pedido;
- consumo por tipo de produto;
- vendas previstas;
- sazonalidade;
- campanhas futuras;
- estratégias futuras;
- Packaging Recipes;
- lead time do fornecedor;
- estoque de segurança;
- lote mínimo.

Exemplo:

```text
Sacolas disponíveis: 47
Consumo médio: 18/semana
Pedidos previstos em 14 dias: 39
Cobertura estimada: 17 dias
Lead time do fornecedor: 8 dias

⚠ Reposição recomendada
```

O ponto de reposição poderá começar determinístico e evoluir estatisticamente quando houver histórico suficiente.

### Entropia do estoque

- capital imobilizado;
- dias parado;
- margem;
- giro;
- probabilidade de venda;
- custo de armazenagem;
- custo de oportunidade;
- comparação entre produto X e Y;
- simulação de liquidação;
- sugestão de realocação de capital;
- score determinístico inicial;
- evolução estatística posterior.

### Grafo de dependências — “Efeito Borboleta”

- fornecedor;
- produto;
- disponibilidade;
- carrinho;
- pedido;
- cliente;
- venda;
- ticket;
- retenção;
- margem;
- LTV;
- impacto indireto;
- relações de dependência;
- alertas de efeito em cadeia;
- explicação de caminhos no grafo.

### Produtos roteadores

- primeira compra;
- porta de entrada;
- baixa margem;
- alta retenção;
- aumento de confiança;
- produtos comprados depois;
- impacto no LTV;
- impacto no carrinho;
- efeito na recompra;
- proteção contra aumento de preço destrutivo;
- recomendação de campanha específica.

### Vazio comportamental

- cadência individual;
- janela esperada de recompra;
- quebra de padrão;
- relação com última compra;
- relação com reclamação;
- relação com devolução;
- relação com falta de estoque;
- diferença entre sazonalidade e churn;
- score de risco;
- explicação da hipótese.

### Cohorts

- aquisição por campanha;
- aquisição por estação;
- aquisição por produto;
- aquisição por canal;
- aquisição por desconto;
- aquisição por marca;
- retenção;
- LTV;
- recompra;
- comparação de estratégias.

### RAG de contexto ambiental

- fontes externas;
- clima;
- calendário;
- eventos locais;
- documentos internos;
- memória estratégica;
- contexto de campanha;
- antecipação de demanda;
- explicação das fontes;
- confiabilidade;
- validade temporal;
- geração de sugestões assistivas.

### Classificação de mensagens: regra antes de LLM

- SKU, quantidade e variação por parser;
- confirmação de pagamento por regra;
- endereço por fluxo estruturado;
- intenção vaga por classificação assistiva;
- reclamação ambígua por Camada C;
- medição da proporção real entre regras e interpretação livre;
- amostra manual de 100 a 200 conversas antes da arquitetura definitiva;
- avaliação de precisão, cobertura e custo.

### Sistema de recomendação

- produtos relacionados;
- produtos comprados juntos;
- recomendação por cliente;
- recomendação por segmento;
- recomendação por contexto;
- recomendação baseada em estoque;
- recomendação baseada em margem;
- recomendação baseada em campanha;
- recomendação explicável.

## Resultado esperado

Redução de decisões reativas e aumento da capacidade de antecipação, sem transformar correlação em causalidade automática.

---

# Fase 13 — Decision Layer

## Objetivo

Transformar fatos, indicadores e previsões em decisões estruturadas, rastreáveis e avaliáveis.

## Tópicos

- problema detectado;
- oportunidade detectada;
- hipótese;
- evidências;
- alternativas;
- recomendação;
- impacto esperado;
- confiança;
- risco;
- prioridade;
- responsável;
- prazo;
- decisão tomada;
- justificativa;
- decisão aceita;
- decisão recusada;
- decisão modificada;
- decisão adiada;
- execução;
- resultado;
- aprendizado;
- reavaliação;
- ações a executar;
- dependências;
- aprovação humana;
- reversão;
- auditoria;
- decisão de pró-labore;
- decisão de retirada;
- validação contábil;
- aprovação;
- execução;
- comparação com cenário;
- resultado financeiro;
- aprovação de diretrizes estratégicas;
- bloqueio de teses incompatíveis;
- precedência entre regras;
- aprovação de distribuição de conhecimento;
- registro de justificativas;
- rollback de diretrizes;
- Decision Safety Layer;
- classificação de risco;
- preview de impacto;
- blast radius;
- confirmação proporcional ao risco;
- override explícito;
- justificativa opcional;
- memória de exceções;
- validade de exceções;
- histórico de intervenções;
- resultado posterior da decisão.

### Decision Safety Layer

Toda ação relevante deverá passar por uma camada de segurança antes da execução.

```text
Intenção
→ Authorization
→ Decision Safety Layer
→ Execution
→ Audit
```

Fontes de avaliação:

```text
Camada A
→ regras determinísticas e limites

Camada B
→ anomalias, desvios e padrões históricos

Camada C
→ explicação, contexto e alternativas
```

Níveis iniciais:

```text
normal
attention
high_risk
forbidden
```

Comportamento:

- `normal`: executa normalmente;
- `attention`: informa o desvio sem interromper;
- `high_risk`: interrompe, explica e exige confirmação explícita;
- `forbidden`: bloqueia quando a ação viola guardrail não sobrescrevível.

### Proteção contra ruptura de materiais operacionais

A Decision Safety Layer deverá considerar o estoque necessário para executar decisões de negócio.

Exemplos de sinais:

- campanha exige mais embalagens que o disponível;
- estratégia de unboxing especial sem estoque suficiente;
- previsão de pedidos supera estoque de sacolas;
- cobertura restante é menor que o lead time do fornecedor;
- mudança de embalagem aumenta excessivamente custo por pedido.

Conforme política e risco, a plataforma poderá permitir, alertar, exigir confirmação ou bloquear.

### Preview de Impacto

Antes de uma ação relevante, a plataforma poderá estimar:

- valor atual;
- valor proposto;
- variação absoluta;
- variação percentual;
- margem;
- caixa;
- estoque;
- entidades afetadas;
- clientes afetados;
- campanhas afetadas;
- automações afetadas;
- dependências;
- pior cenário plausível;
- reversibilidade;
- custo estimado;
- impacto provável na experiência do cliente;
- risco de aumento de reclamações;
- risco de abandono;
- risco de recorrência;
- efeito sobre confiança;
- quantidade de clientes potencialmente afetados;
- quantidade prevista de materiais operacionais consumidos;
- disponibilidade desses materiais;
- cobertura restante após a ação;
- custo incremental de fulfillment.

### Proteção contra dano de experiência

A Decision Safety Layer deverá tratar degradação relevante da experiência do cliente como risco operacional.

Exemplos:

- automação que dispara comunicação excessiva;
- política de troca excessivamente restritiva;
- campanha que promete prazo incompatível;
- mudança que aumenta probabilidade de atraso;
- corte de custo que reduz qualidade de embalagem;
- ação que remove acompanhamento de cliente em situação delicada.

Uma decisão financeiramente positiva não recebe aprovação automática quando houver risco relevante de prejudicar confiança ou experiência.

### Blast Radius

Mudanças estruturais deverão expor o raio de impacto antes da confirmação.

Exemplos:

```text
Diretriz X
→ Pricing
→ Marketing
→ 4 automações
→ 17 campanhas
```

ou:

```text
Alteração de política financeira
→ 3 regras
→ 2 dashboards
→ 1 automação
→ 8 decisões pendentes
```

### Confirmação proporcional ao risco

A confirmação não será igual para todas as ações.

- risco baixo: fluxo normal;
- atenção: aviso;
- alto risco: confirmação reforçada;
- risco extremo reversível: confirmação reforçada + preview completo;
- operação protegida: aprovação adicional conforme política;
- violação de guardrail absoluto: bloqueio.

### Uso do Decision Profile na camada de decisão

O Decision Profile poderá adaptar:

- ordem das explicações;
- quantidade de evidência apresentada;
- comparação com decisões anteriores;
- nível de detalhe;
- destaque de cenários;
- lembretes de políticas declaradas.

O perfil não poderá:

- remover guardrails;
- reduzir proteção por presumir preferência do usuário;
- esconder alternativas relevantes;
- aprovar ação arriscada automaticamente;
- transformar comportamento passado em autorização permanente.

### Override e justificativa opcional

Quando um override for permitido:

- justificativa continua opcional;
- decisão será registrada mesmo sem justificativa;
- se houver justificativa, ela será preservada integralmente;
- a justificativa não altera automaticamente políticas futuras;
- o histórico poderá ser utilizado para sugerir mudanças de política posteriormente.

Estrutura conceitual:

```text
RiskDecisionRecord
├── decision_id
├── tenant_id
├── actor
├── actor_type
├── action
├── entity
├── entity_id
├── previous_value
├── proposed_value
├── risk_level
├── risk_signals
├── rules_triggered
├── anomaly_score
├── recommendation
├── user_decision
├── justification
├── occurred_at
├── correlation_id
└── evidence_ids
```

### Memória de exceções com escopo e validade

Uma justificativa legítima poderá originar uma exceção explícita, mas nunca uma exceção global implícita.

Exemplo:

```text
produto defeituoso
→ permitir preço abaixo da margem
→ somente para SKU X
→ somente para 3 unidades
→ até data Y
```

Exceções deverão possuir:

- escopo;
- entidade;
- limite;
- validade;
- responsável;
- origem;
- aprovação;
- motivo;
- expiração;
- revogação;
- auditoria.

### Governança de diretrizes estratégicas

Toda diretriz produzida a partir do Master Training deverá passar por decisão explícita.

Estados possíveis:

```text
draft
→ analyzed
→ pending_review
→ approved
→ active
→ superseded
→ archived
```

Também poderá existir:

```text
blocked
```

Uma diretriz poderá ser bloqueada quando:

- violar uma regra obrigatória;
- reduzir margem abaixo do mínimo permitido;
- ultrapassar limite financeiro;
- contradizer política legal ou de privacidade;
- tentar remover guardrails;
- conflitar com isolamento de tenant;
- não possuir evidência suficiente.

### Ordem de precedência

```text
1. Segurança e isolamento de tenant
2. Regras legais, privacidade e permissões
3. Invariantes determinísticas do negócio
4. Políticas aprovadas da empresa
5. Diretrizes aprovadas do Agente Mestre
6. Exemplos de treinamento
7. Contexto temporário da solicitação
```

Uma diretriz estratégica nunca poderá sobrescrever proteções de nível superior.

### Decisões financeiras

- simulação vinculada;
- cenário usado;
- premissas;
- reserva mínima;
- limite gerencial;
- parecer contábil quando necessário;
- aprovação;
- responsável;
- data;
- execução;
- evidências;
- impacto realizado;
- possibilidade de cancelamento antes da execução.

### Actionable Decisions

- sugestão vinculada ao card;
- evidência;
- impacto estimado;
- nível de confiança;
- botão “Aplicar e Registrar Decisão”;
- botão “Gerar Rascunho”;
- confirmação;
- permissão;
- comando de negócio;
- evento produzido;
- responsável;
- acompanhamento;
- resultado posterior.

### Curadoria e treinamento manual

- interface de exemplos few-shot;
- exemplos de classificação;
- exemplos de geração;
- categorias criadas dinamicamente;
- categoria como entidade própria;
- slug normalizado;
- fuzzy match para evitar duplicatas;
- renomeação;
- mesclagem;
- aprovação;
- rejeição;
- edição humana;
- origem do exemplo;
- candidato criado a partir de sugestão editada;
- entrada oficial somente após aprovação.

> Não se trata de fine-tuning. O objetivo é curar referências recuperáveis e auditáveis.

### Aprovação de conhecimento distribuído

- agentes de destino;
- motivo da distribuição;
- escopo;
- versão;
- prioridade;
- validade;
- aprovação;
- data de ativação;
- data de expiração;
- conflitos detectados;
- possibilidade de suspensão;
- possibilidade de rollback.

Fluxo:

```text
Agente Mestre sugere destinos
→ humano revisa
→ sistema valida permissões
→ associação é versionada
→ diretriz entra em vigor
```

### Auditor de maturidade

- qualidade dos dados;
- uso dos módulos;
- indicadores ausentes;
- processos manuais;
- decisões sem evidência;
- automações possíveis;
- riscos operacionais;
- maturidade tecnológica;
- maturidade de gestão;
- evolução da empresa.

## Resultado esperado

A empresa passa a ter um processo explícito, auditável e evolutivo de tomada de decisão.

---

# Fase 14 — Memória Estratégica e Evidence Engine

## Objetivo

Preservar o conhecimento acumulado do negócio e permitir que recomendações sejam sustentadas por evidências.

## Tópicos

### Strategic Memory

- acontecimentos relevantes;
- decisões;
- campanhas;
- testes;
- hipóteses;
- resultados;
- erros;
- aprendizados;
- mudanças de estratégia;
- comportamento de clientes;
- fornecedores;
- produtos;
- mercado;
- períodos;
- contexto;
- documentos;
- resumos;
- busca semântica;
- relacionamentos;
- linha do tempo;
- recuperação de decisões antigas;
- conteúdo estratégico inserido pelo usuário;
- cursos;
- mentorias;
- metodologias;
- teses;
- estratégias;
- diretrizes estruturadas;
- histórico de versões;
- origem e autoria;
- conflitos e bloqueios;
- agentes que receberam cada diretriz;
- intervenções da Decision Safety Layer;
- overrides humanos;
- justificativas opcionais;
- exceções temporárias;
- previsões de impacto;
- resultados observados;
- diferença entre impacto previsto e realizado;
- incidentes;
- post-mortems;
- outcomes de recomendações;
- avaliações históricas de agentes;
- estratégias;
- versões de estratégias;
- hipóteses estratégicas;
- produtos relacionados;
- campanhas derivadas;
- contribuições de agentes;
- resultados por estratégia;
- aprendizados estratégicos;
- pausas e reativações;
- perfil operacional de decisão;
- preferências declaradas;
- padrões observados;
- interpretações;
- contradições;
- feedback do usuário sobre o perfil;
- evolução temporal do perfil;
- consumo de materiais por pedido;
- consumo previsto versus real;
- custo histórico de materiais;
- ruptura e reposição;
- impacto de materiais especiais em estratégias e experiência do cliente.

### Operational Supply Outcomes

O Outcome Tracking poderá responder:

- quanto uma estratégia aumentou o custo de fulfillment?
- um unboxing premium melhorou recompra ou satisfação?
- qual campanha consumiu mais material?
- qual Packaging Recipe apresenta mais desperdício?
- houve ruptura que afetou vendas ou experiência?
- fornecedor mais barato realmente reduziu custo total após atrasos e perdas?

### Strategy Memory

A memória estratégica deverá permitir reconstruir:

```text
ideia
→ hipótese
→ estratégia
→ versão
→ execução
→ agentes envolvidos
→ produtos
→ campanhas
→ decisões
→ resultados
→ aprendizado
```

Perguntas esperadas:

- quais estratégias já usamos para este produto?
- quais estratégias de Instagram deram resultado positivo?
- quais estratégias foram pausadas e depois reativadas?
- qual versão da estratégia performou melhor?
- quais hipóteses foram confirmadas?
- quais estratégias tiveram resultado ruim apesar de boa previsão?
- quais agentes mais contribuíram para estratégias bem-sucedidas?

### Decision Profile

O perfil de decisão será memória operacional do usuário, não diagnóstico psicológico.

Estrutura conceitual:

```text
DecisionProfile
├── user_id
├── period
├── declared_preferences
├── observed_patterns
├── inferred_preferences
├── contradictions
├── confidence
├── evidence_ids
├── trend_history
├── last_evaluated_at
└── version
```

Cada padrão poderá ser representado como:

```text
DecisionPattern
├── dimension
├── observation
├── interpretation
├── confidence
├── sample_size
├── evidence_ids
├── valid_from
├── valid_until
└── user_feedback
```

Princípios:

- fatos, padrões e interpretações permanecem separados;
- preferências declaradas não substituem comportamento observado;
- comportamento observado não invalida automaticamente preferência declarada;
- contradições são exibidas, não escondidas;
- inferências precisam ser explicáveis;
- o usuário pode discordar, contextualizar ou corrigir;
- histórico é versionado;
- mudanças temporárias não devem ser tratadas automaticamente como preferência permanente.

### Outcome Tracking

Toda decisão relevante deverá poder ser reavaliada depois da execução.

```text
recomendação
→ decisão
→ execução
→ janela de observação
→ outcome
→ comparação com expectativa
→ aprendizado
```

Outcomes possíveis:

- impacto financeiro;
- mudança de margem;
- mudança de receita;
- estoque escoado;
- ruptura evitada;
- campanha melhorada;
- cliente recuperado;
- erro operacional;
- custo de IA;
- tempo economizado;
- ausência de impacto;
- efeito negativo inesperado.

A memória deverá preservar tanto o resultado quanto as condições em que ele foi medido.

### Master Training — ingestão estratégica

A plataforma permitirá que o usuário atue como tutor e registre conhecimento externo em texto livre.

Fluxo:

```text
texto original do usuário
→ interpretação proposta
→ validação contra regras
→ conflitos identificados
→ diretriz estruturada em rascunho
→ revisão humana
→ testes
→ aprovação
→ vetorização
→ distribuição versionada
→ auditoria
```

O conteúdo original será preservado de forma separada da interpretação da IA.

Campos conceituais:

- título;
- texto original;
- autor;
- origem;
- data da fonte;
- data da ingestão;
- tenant;
- hash do conteúdo;
- interpretação;
- diretriz estruturada;
- conflitos;
- agentes afetados;
- versão;
- estado;
- decisão humana.

### Ciclo de vida do conhecimento

```text
draft
→ analyzed
→ pending_review
→ approved
→ active
→ superseded
→ archived
```

Conhecimentos incompatíveis com regras obrigatórias poderão receber o estado `blocked`.

### Perguntas esperadas

- Já tentamos essa campanha?
- Qual foi o resultado?
- Por que aumentamos o preço?
- Quando esse produto começou a perder vendas?
- Quais fornecedores atrasaram?
- Que decisões melhoraram a margem?
- Quais hipóteses foram rejeitadas?
- O que aprendemos no último Dia das Mães?
- Qual ação recuperou clientes de determinada safra?
- Quais promessas dos concorrentes mudaram?

### Evidence Engine

- localizar evidências;
- citar fontes internas;
- citar fontes externas;
- relacionar eventos;
- apontar dados utilizados;
- diferenciar fato de hipótese;
- informar confiança;
- mostrar limitações;
- mostrar contradições;
- preservar rastreabilidade;
- registrar versão da análise;
- registrar modelo utilizado;
- registrar data de processamento;
- exigir `evidence_id` para afirmações relevantes;
- rastrear evidência até linha, evento, indicador ou trecho;
- preservar offset ou localização do trecho recuperado;
- separar consultas SQL de busca vetorial;
- controlar versão dos embeddings;
- reprocessar embeddings após alteração do conteúdo;
- manter golden set de perguntas e respostas conhecidas;
- medir taxa de respostas sem suporte;
- bloquear respostas decisórias sem evidência suficiente;
- rastrear cada métrica financeira até seus cálculos;
- preservar versões de simulação;
- relacionar orçamento, decisão e realizado;
- armazenar premissas de previsão;
- fornecer evidências para retirada e pró-labore;
- registrar o DTO financeiro enviado à Camada C;
- atribuir `evidence_id` a conhecimentos externos;
- preservar autoria e proveniência;
- registrar `content_hash`;
- ligar a diretriz à fonte original;
- registrar agentes que assimilaram a diretriz;
- permitir rastrear qual versão foi utilizada;
- registrar data de ativação e expiração;
- invalidar embeddings quando a fonte mudar;
- reconstruir o índice vetorial;
- citar a aula ou diretriz original nas recomendações.

### Proveniência do conhecimento

Campos conceituais:

```text
evidence_id
source_type
source_title
source_author
source_date
ingested_by
original_content
content_hash
created_at
version
```

Quando um agente utilizar uma diretriz, deverá citar sua origem, versão e data de aprovação.

### Vetorização e recuperação

A expressão “ensinar aos agentes” significa:

```text
armazenar
→ estruturar
→ indexar
→ autorizar
→ recuperar no momento adequado
```

Não significa obrigatoriamente:

- fine-tuning;
- alteração dos pesos do modelo;
- inclusão permanente em todos os prompts;
- cópia duplicada da mesma diretriz.

Estrutura conceitual:

```text
Knowledge Item
→ Knowledge Version
→ Agent Knowledge Assignment
→ recuperação em tempo de execução
```

### Contexto financeiro anonimizado

A Camada C receberá somente DTOs permitidos, agregados e minimizados.

Exemplo conceitual:

```typescript
interface FinancialInsightContext {
  period: string;
  revenueChangePercent: number;
  contributionMarginPercent: number;
  runwayMonths: number;
  inventoryCapitalRatio: number;
  financialHealthScore: number;
  riskLabels: string[];
}
```

Regras:

- allowlist de campos;
- nenhuma query bruta;
- nenhuma transação individual;
- nenhum nome;
- nenhum documento;
- nenhum endereço;
- nenhum identificador;
- nenhum cliente;
- nenhum pedido;
- nenhuma empresa identificável;
- supressão de grupos muito pequenos;
- arredondamento quando necessário;
- validação antes do envio;
- log do DTO;
- `evidence_id` apontando para cálculos internos.

Fluxo:

```text
dados brutos
→ cálculo interno
→ agregação
→ anonimização
→ validação
→ DTO permitido
→ AI Gateway
```

## Resultado esperado

O conhecimento da empresa deixa de ficar espalhado entre pessoas, conversas, cursos, mentorias, planilhas e ferramentas desconectadas, mantendo origem, versão, aprovação e rastreabilidade.

---

# Fase 15 — Agentes assistivos

## Objetivo

Criar agentes especializados que utilizam dados confiáveis, regras, contexto e memória, sem assumir que toda inteligência depende de LLM externo.

### Princípio: agente não é sinônimo de LLM

Um agente pode executar uma sequência majoritariamente determinística ou estatística.

Exemplo:

```text
SQL
→ regra de negócio
→ estatística
→ score
→ decisão
→ LLM somente se for necessária explicação em linguagem natural
```

Ordem preferencial de resolução:

```text
Camada A — determinística
        ↓
é suficiente?
   sim → finalizar
   não
        ↓
Camada B — estatística / ML
        ↓
é suficiente?
   sim → finalizar
   não
        ↓
Camada C — LLM
```

A Camada C deve ser tratada como recurso especializado, não como caminho padrão.

### AI Gateway e Model Router

Toda chamada de IA externa deverá passar por uma camada central.

```text
Agent / Feature
      ↓
AI Gateway
      ↓
Necessity Policy
      ↓
Model Router
      ↓
Provider / Model
```

O gateway deverá avaliar:

- se LLM é realmente necessário;
- categoria da tarefa;
- tenant;
- agente;
- funcionalidade;
- orçamento;
- qualidade requerida;
- latência aceitável;
- provider disponível;
- modelo permitido;
- cache existente;
- fallback;
- política de privacidade;
- tamanho e tipo do contexto;
- custo estimado.

Casos típicos sem LLM:

- margem;
- markup;
- giro;
- curva ABC;
- ticket médio;
- CAC;
- LTV;
- breakeven;
- alertas de estoque;
- agregações;
- filtros;
- validações;
- regras financeiras;
- scores determinísticos;
- workflows;
- agendamento;
- detecção numérica de anomalias.

Casos típicos com possível LLM:

- copy;
- legenda;
- resumo;
- explicação em linguagem natural;
- interpretação de texto livre;
- Master Training;
- classificação semântica;
- análise de sentimento;
- síntese de evidências;
- geração de hipóteses;
- resposta de atendimento;
- comparação argumentativa.

O LLM deverá receber contexto estruturado e minimizado, preferencialmente preparado pelas Camadas A e B.

## Agentes planejados

### Agente Mestre — Treinador e Orquestrador

Responsabilidades:

- interpretar conhecimento externo;
- identificar tese e contexto;
- propor estrutura de diretriz;
- comparar com regras determinísticas;
- detectar conflitos;
- alertar sobre riscos;
- sugerir agentes afetados;
- preparar versão para revisão;
- explicar como entendeu o ensinamento;
- registrar evidências;
- acompanhar distribuição aprovada;
- avaliar desempenho dos agentes especialistas;
- detectar excesso de recomendações rejeitadas;
- detectar sequência de outcomes negativos;
- detectar degradação de grounding;
- detectar aumento anormal de custo;
- detectar aumento de incidentes;
- comparar versões;
- diagnosticar causas prováveis;
- sugerir ajustes em prompt, modelo, ferramentas, conhecimento ou limites;
- recomendar Shadow Mode;
- recomendar rollback;
- recomendar redução de autonomia;
- recomendar quarentena;
- acompanhar recuperação antes do retorno à produção;
- avaliar utilidade versus frequência de execução;
- detectar análises frequentes que raramente produzem informação nova;
- detectar análises pouco frequentes que estão perdendo eventos relevantes;
- sugerir mudança de cadência;
- sugerir redução de frequência para economizar custo;
- sugerir aumento temporário de frequência quando houver instabilidade;
- comparar custo versus outcome da agenda;
- avaliar contribuições dos agentes dentro de estratégias;
- detectar estratégias em que agentes recorrentes contribuem negativamente;
- usar Decision Profile apenas para adaptar apresentação e contexto;
- comparar recomendações com preferências operacionais declaradas;
- apontar contradições entre padrão observado e preferência declarada sem tratá-las como erro.

### Uso do Decision Profile pelos agentes

Agentes poderão usar o perfil para melhorar comunicação e priorização.

Exemplos:

```text
usuário costuma exigir evidências
→ apresentar evidências antes da recomendação
```

```text
usuário frequentemente compara cenários
→ incluir cenário base, otimista e conservador
```

O perfil não poderá ser usado para:

- manipulação;
- omissão de alternativas;
- reduzir transparência;
- eliminar revisão humana;
- presumir consentimento;
- remover guardrails.

### Supervisão de qualidade dos agentes

O Agente Mestre atuará também como supervisor de qualidade da frota.

Sinais de investigação:

- taxa de rejeição anormalmente alta;
- usuário corrige constantemente a recomendação;
- baixa taxa de evidência válida;
- análises frequentemente negativas ou pouco úteis;
- divergência entre impacto previsto e realizado;
- aumento de custo sem ganho de qualidade;
- regressão após nova versão;
- aumento de retries;
- falhas de ferramentas;
- violações ou tentativas de violação de guardrails;
- drift de comportamento;
- respostas excessivamente parecidas;
- perda de aderência ao escopo.

Fluxo:

```text
telemetria do agente
→ scorecard
→ desvio detectado
→ Agente Mestre investiga
→ hipótese de causa
→ recomendação de intervenção
→ revisão/validação
→ nova versão, shadow, rollback ou quarentena
```

O Agente Mestre poderá propor alterações profundas em:

- system prompt específico do agente;
- modelo;
- temperatura;
- ferramentas;
- permissões;
- fontes;
- Knowledge Assignments;
- limites;
- orçamento;
- fallback;
- escopo;
- critérios de confiança.

Ele não aplicará mudanças estruturais críticas sozinho.

### Estados operacionais do agente

Além do ciclo de vida de versões, o agente poderá possuir estado operacional:

```text
active
degraded
shadow
quarantined
disabled
```

- `active`: operação normal;
- `degraded`: capacidade reduzida ou fallback obrigatório;
- `shadow`: executa análise sem produzir efeitos reais;
- `quarantined`: não participa de fluxos produtivos enquanto é investigado;
- `disabled`: explicitamente desativado.

Entrada e saída de quarentena deverão registrar:

- gatilho;
- métricas;
- versão;
- incidente;
- responsável;
- recomendação do Agente Mestre;
- decisão humana ou política automática autorizada;
- testes de recuperação;
- nova avaliação;
- timestamp.

O retorno de `quarantined` para `active` exige validação e critérios de saída.

O Agente Mestre não poderá:

- executar ações operacionais;
- alterar preços;
- enviar campanhas;
- conceder permissões;
- alterar guardrails;
- ativar conhecimento sem aprovação;
- modificar prompts ativos diretamente;
- ignorar limites financeiros;
- remover regras determinísticas.

### Marketing e Copy

- campanhas;
- ofertas;
- anúncios;
- textos;
- testes;
- posicionamento;
- campanhas baseadas em estoque;
- campanhas baseadas em fraquezas do mercado;
- contexto ambiental.

### Social Media

- calendário;
- posts;
- stories;
- roteiros;
- consistência;
- adaptação por canal;
- campanhas sazonais.

### Pricing

- preços;
- margens;
- descontos;
- simulações;
- produtos roteadores;
- risco de perda de conversão;
- custo de oportunidade.

### Forecasting

- previsões;
- consumo de materiais operacionais;
- cobertura de consumíveis;
- ponto de reposição;
- risco de ruptura de embalagem;
- necessidade antecipada de compra;
- cenários;
- demanda;
- estoque;
- receita;
- fluxo de caixa;
- runway;
- risco de reserva;
- confiança;
- limitações.

### Financial Intelligence

- explicar health score financeiro;
- resumir cenários;
- comparar pró-labore atual e simulado;
- explicar ponto de equilíbrio;
- destacar obrigações;
- explicar capital imobilizado;
- comparar CAC e LTV;
- explicar desvios entre orçado e realizado;
- usar apenas contexto financeiro agregado e anonimizado;
- citar evidências;
- não autorizar retirada;
- encaminhar para decisão humana e validação contábil.

### Recommendation

- produtos;
- clientes;
- campanhas;
- combinações;
- contexto;
- margem;
- estoque.

### Customer Intelligence

- segmentos;
- Customer Health Score;
- recompra;
- abandono;
- valor;
- cohorts;
- vazio comportamental;
- Customer Experience Risk;
- recorrência de incidentes;
- recuperação de confiança;
- qualidade de atendimento;
- acompanhamento prioritário.

### Trust & Risk Agent

Responsabilidades:

- interpretar sinais de risco transacional já calculados;
- agregar contexto permitido;
- explicar por que um caso foi sinalizado;
- recomendar revisão;
- comparar com histórico;
- identificar sinais conflitantes;
- informar confiança;
- registrar limitações;
- acompanhar outcome;
- medir falsos positivos;
- sugerir ajuste de regras quando padrões mudarem.

O agente não poderá:

- declarar fraude como fato apenas por inferência;
- bloquear automaticamente com base exclusiva em LLM;
- utilizar atributos sensíveis ou proxies discriminatórios;
- manter marcação permanente sem base e revisão;
- esconder sinais que levaram à avaliação.

### Customer Care Agent

Responsabilidades:

- identificar clientes que merecem acompanhamento reforçado;
- resumir ocorrências anteriores;
- separar responsabilidade da empresa, cliente, fornecedor, transportadora e pagamento;
- sugerir prevenção de recorrência;
- recomendar conferência especial;
- recomendar follow-up;
- acompanhar nova compra;
- avaliar recuperação da experiência;
- registrar se a prevenção funcionou;
- sugerir melhoria operacional quando problemas se repetirem.

Princípio:

```text
cliente com muitos problemas
não significa
cliente problemático
```

O agente deverá priorizar a hipótese de falha operacional quando as evidências apontarem nessa direção.

### Market Intelligence

- concorrentes;
- tendências;
- oportunidades;
- ameaças;
- promessas;
- reclamações;
- engenharia do “Uau”.

### Fornecedores

- preço;
- materiais operacionais;
- lote mínimo;
- lead time de consumíveis;
- risco de ruptura operacional;
- prazo;
- qualidade;
- risco;
- negociação;
- impacto em ruptura e LTV.

### Evidence Engine

- evidências;
- fontes;
- confiança;
- rastreabilidade;
- contradições.

### UX

- análise de uso;
- fricções;
- jornadas;
- melhorias;
- clareza de relatórios;
- eficácia das ações 1-click.

### Auditor de Maturidade

- diagnóstico;
- lacunas;
- riscos;
- próximos passos;
- evolução.

### Curador de classificação e resposta

- buscar exemplos semelhantes;
- sugerir categoria;
- explicar exemplos usados;
- gerar resposta com referências de tom;
- receber aprovação humana;
- registrar edição;
- transformar edição em candidato de exemplo;
- impedir promoção automática sem curadoria;
- respeitar confiança e cobertura dos dados.

### SAC e Tom de Voz

- classificação de contexto;
- tom recomendado;
- rascunho de resposta;
- empatia;
- gravidade;
- ação de reparação;
- revisão humana.

### Agent Registry — fundação de domínio

Os agentes serão entidades gerenciáveis e versionadas.

Estrutura conceitual:

```text
Agent
└── Agent Version
    ├── identidade
    ├── prompt
    ├── modelo
    ├── ferramentas
    ├── fontes
    ├── conhecimentos
    ├── limites
    └── avaliações
```

Configurações gerenciáveis:

- nome;
- descrição;
- objetivo;
- escopo;
- status;
- responsável;
- provedor;
- modelo;
- prompt específico;
- temperatura;
- ferramentas;
- fontes permitidas;
- coleções vetoriais;
- orçamento;
- limites;
- fallback;
- versão.

Estados de uma versão:

```text
draft
→ testing
→ approved
→ active
→ deprecated
→ archived
```

Alterar prompt, modelo, fontes, ferramentas ou conhecimento cria uma nova versão.

### Agent Knowledge Assignment

A distribuição de conhecimento será representada por associações versionadas entre diretrizes e agentes.

Campos conceituais:

- agent_id;
- agent_version_id;
- knowledge_item_id;
- knowledge_version_id;
- motivo;
- escopo;
- prioridade;
- validade;
- aprovado por;
- ativado em;
- expirado em;
- status.

### Shadow Mode

Uma nova versão poderá executar em paralelo sem afetar produção.

```text
evento real
├── versão ativa → resultado produtivo
└── versão shadow → resultado comparativo
```

O Shadow Mode deverá registrar:

- mesma entrada;
- versão ativa;
- versão candidata;
- resultado de cada uma;
- evidências;
- custo;
- tempo;
- risco;
- divergência;
- outcome posterior quando disponível.

A versão shadow não poderá:

- executar ações;
- alterar dados de negócio;
- consumir orçamento operacional;
- enviar comunicação externa;
- substituir a versão ativa.

### Decision Scorecard

Cada agente deverá possuir scorecard com, quando aplicável:

- sugestões emitidas;
- sugestões aceitas;
- sugestões recusadas;
- sugestões modificadas;
- overrides humanos;
- taxa de grounding;
- taxa de evidência válida;
- outcomes positivos;
- outcomes negativos;
- divergência previsto versus realizado;
- custo total;
- custo por recomendação;
- latência;
- erros;
- retries;
- incidentes;
- regressões por versão;
- intervenções do Agente Mestre;
- tempo em estado `degraded`;
- tempo em quarentena.

### Testes antes da ativação

- golden set;
- cenários de conflito;
- tentativas de violação;
- evidência correta;
- isolamento entre tenants;
- aderência ao tom;
- custo estimado;
- comparação com versão anterior;
- rollout controlado;
- rollback;
- replay em sandbox;
- comparação semântica com versão anterior;
- análise de blast radius.

### Diff semântico entre versões

Além do diff textual, o sistema deverá apresentar o que mudou em significado operacional.

Exemplos:

- ganhou acesso a nova fonte;
- perdeu uma ferramenta;
- mudou modelo;
- alterou temperatura;
- passou a considerar nova diretriz;
- deixou de considerar regra;
- aumentou limite;
- mudou escopo;
- mudou política de fallback;
- mudou autonomia.

## Princípios dos agentes

- não alterar dados críticos sem autorização;
- explicar recomendações;
- mostrar evidências;
- informar incertezas;
- registrar ações;
- respeitar permissões;
- manter histórico;
- não substituir regras determinísticas;
- preservar dados originais;
- permitir revisão humana;
- diferenciar sugestão, decisão e execução;
- respeitar ordem de precedência;
- usar apenas diretrizes autorizadas;
- citar conhecimento externo utilizado;
- preservar versão ativa;
- suportar rollback;
- separar configuração editável de guardrails imutáveis.

## Resultado esperado

Assistentes especializados, versionados e auditáveis, trabalhando sobre uma base confiável, contextualizada e ensinada de forma controlada.

---

# Fase 16 — Automação e orquestração

## Objetivo

Construir o **Automation Engine nativo da Versa** e o **Intelligence Scheduler**, capazes de decidir quando automações, agentes e análises devem executar, preservando decisão, aprovação, segurança, custo, observabilidade e auditoria dentro da própria plataforma.

## Tópicos

- Automation Engine nativo;
- Intelligence Scheduler;
- Analysis Cadence Engine;
- agenda de agentes;
- agenda de análises;
- execução event-driven;
- execução scheduled/batch;
- execução on-demand;
- execução condition-triggered;
- health checks periódicos;
- motor de automações;
- gatilhos;
- condições;
- ações;
- agendamentos;
- eventos;
- webhooks;
- filas;
- retries;
- idempotência;
- aprovação humana;
- histórico;
- logs;
- falhas;
- notificações;
- ações através da Integration Platform;
- automações internas;
- templates;
- versionamento;
- reprocessamento;
- compensação;
- limites de segurança;
- ações 1-click;
- workflows de decisão nativos;
- dry-run;
- testes com dados históricos;
- aprovação por versão;
- prevenção de efeitos colaterais em simulação;
- correlação e causalidade entre automações;
- limite de profundidade;
- detecção de ciclos;
- circuit breaker;
- limites por período, entidade e tenant;
- degradação controlada;
- pausa automática;
- distribuição automatizada de diretrizes aprovadas;
- ativação agendada de conhecimento;
- expiração de diretrizes;
- rollback de associações;
- reindexação controlada;
- Shadow Mode de automações;
- replay em sandbox;
- simulador histórico de políticas;
- blast radius de automações;
- kill switches;
- inbox de exceções;
- post-mortem automático.

### Replay em sandbox

Uma execução passada poderá ser reproduzida com os mesmos inputs em ambiente sem efeitos colaterais.

Usos:

- investigar bugs;
- comparar versão nova com antiga;
- validar correção;
- testar nova política;
- testar novo agente;
- reproduzir incidente;
- comparar custo;
- comparar decisões.

O replay não poderá produzir efeitos reais.

### Simulador histórico de políticas

Antes de ativar uma regra global, a Versa poderá executá-la sobre dados históricos.

Exemplo:

```text
Nova política
→ últimos 90 dias
→ 1.831 operações avaliadas
→ 42 alertas
→ 17 bloqueios
→ 3 falsos positivos conhecidos
```

O simulador deverá mostrar:

- volume analisado;
- ações afetadas;
- bloqueios;
- alertas;
- falsos positivos identificáveis;
- custo;
- entidades atingidas;
- mudanças no resultado;
- limitações da simulação.

### Kill Switches

A plataforma deverá permitir interrupção seletiva de capacidades:

- todas as automações;
- automação específica;
- agente específico;
- integração específica;
- tipo de ação;
- campanha;
- processamento de determinado evento;
- fila específica.

Kill switch deve:

- ser auditado;
- registrar responsável;
- preservar backlog quando apropriado;
- impedir novas execuções;
- possuir procedimento de retomada;
- expor estado na interface.

### Inbox de exceções

Fila central para itens que exigem atenção:

- decisões de alto risco;
- automações pausadas;
- agentes degradados;
- agentes em quarentena;
- integrações em falha;
- dead letters;
- retries excessivos;
- divergências críticas;
- incidentes;
- aprovações pendentes.

### Post-mortem automático

Incidentes relevantes deverão produzir uma reconstrução inicial automática:

```text
o que aconteceu
→ quando
→ sequência de eventos
→ sistemas envolvidos
→ retries
→ circuit breakers
→ ações executadas
→ ações bloqueadas
→ impacto conhecido
→ IDs de correlação
→ estado atual
```

O relatório automático é ponto de partida para análise humana, não conclusão definitiva.

### Intelligence Scheduler / Analysis Cadence Engine

Agentes e análises não devem rodar continuamente sem necessidade.

Modos de acionamento:

```text
event_driven
scheduled
on_demand
condition_triggered
periodic_health_check
```

Exemplos:

```text
Trust & Risk
→ event_driven
→ nova compra relevante

Marketing Weekly Plan
→ scheduled
→ sábado
→ revisão humana no domingo

Pricing
→ condition_triggered
→ margem ou preço cruza limiar

Market Intelligence
→ scheduled
→ uma ou duas vezes por semana

Agente Mestre
→ periodic_health_check
+ acionamento por anomalia
```

### AgentSchedule / AnalysisSchedule

A agenda será entidade gerenciável, persistida e versionada.

Estrutura conceitual:

```text
AgentSchedule
├── id
├── tenant_id
├── agent_id
├── trigger_type
├── schedule
├── timezone
├── earliest_run
├── deadline
├── priority
├── dependencies
├── required_data_freshness
├── max_cost
├── max_concurrency
├── quiet_hours
├── requires_human_review
├── status
├── version
└── audit
```

Estados:

```text
draft
active
paused
disabled
```

Alterações relevantes de agenda deverão:

- criar nova versão;
- registrar responsável;
- preservar configuração anterior;
- registrar motivo;
- aparecer na System Timeline;
- respeitar timezone do tenant;
- permitir rollback.

### Deadline em vez de horário rígido

Quando possível, a agenda poderá expressar uma janela:

```text
earliest_run:
sábado 08:00

deadline:
domingo 08:00
```

Isso permite ao scheduler escolher o melhor momento considerando:

- dados disponíveis;
- capacidade;
- orçamento;
- dependências;
- provider health;
- quiet hours;
- concorrência;
- prioridade.

### Data Freshness

Uma análise não deverá executar silenciosamente com dados obsoletos quando freshness for requisito.

Exemplo:

```text
Weekly Marketing Plan

requer:
✓ vendas atualizadas
✓ estoque atualizado
✓ campanhas sincronizadas
✓ métricas sociais disponíveis
```

Quando uma fonte estiver desatualizada:

- aguardar;
- executar parcialmente somente se permitido;
- registrar cobertura;
- alertar usuário;
- respeitar deadline.

### Dependências entre análises

Análises poderão formar um DAG:

```text
dados atualizados
      ↓
Performance Analysis
      ↓
Product Analysis
      ↓
Marketing Strategy
      ↓
Content Planning
      ↓
Copy Generation
      ↓
Human Review
```

Objetivos:

- evitar chamadas duplicadas;
- reutilizar resultados;
- reduzir custo;
- reduzir inconsistência;
- ordenar conhecimento;
- limitar concorrência.

### Prioridades

Referência inicial:

```text
P0 — segurança e operação crítica
P1 — cliente
P2 — financeiro
P3 — operação
P4 — planejamento
P5 — análise exploratória
```

Uma análise editorial não deve bloquear uma avaliação crítica de fraude, cliente ou operação.

### Quiet Hours

Execuções não urgentes poderão respeitar janelas de silêncio por tenant.

Eventos críticos permanecem elegíveis conforme política.

### Planejamento semanal de Instagram

Exemplo de fluxo:

```text
sábado
→ consolidar dados da semana
→ analisar produtos
→ analisar estoque
→ analisar campanhas
→ analisar conteúdo anterior
→ Marketing Agent cria plano
→ Copy Agent prepara rascunhos
→ salvar como draft

domingo
→ usuário revisa
→ aprova / modifica / rejeita

segunda
→ conteúdo aprovado entra no plano operacional
```

### Otimização de cadência pelo Agente Mestre

O Agente Mestre poderá sugerir mudanças, por exemplo:

```text
Market Intelligence
frequência atual: diária
94% das execuções sem novidade relevante

sugestão:
2 vezes por semana
```

ou:

```text
Pricing
7 dias com alterações relevantes consecutivas

sugestão:
aumentar temporariamente a frequência
```

A alteração não será autônoma por padrão.

```text
Agente Mestre sugere
→ usuário/política revisa
→ schedule versionado
→ nova agenda entra em vigor
```

### Arquitetura do Automation Engine

Estrutura conceitual:

```text
Trigger
→ Conditions
→ Decision
→ Approval
→ Actions
→ Execution
→ Result
```

Componentes esperados:

- registry de automações;
- versões de automação;
- gatilhos por evento;
- gatilhos agendados;
- avaliação de condições;
- execução de ações;
- fila de execução;
- idempotency keys;
- retry com backoff;
- dead-letter strategy;
- correlation e causation IDs;
- circuit breaker;
- limites por tenant;
- aprovação humana;
- dry-run;
- histórico;
- auditoria;
- métricas;
- health de automações.

Ações que dependem de serviços externos serão delegadas à **Integration Platform**, sem transferir a orquestração central para terceiros.

### Distribuição de conhecimento

A automação poderá distribuir diretrizes somente após:

- aprovação humana;
- validação de permissões;
- criação de versão;
- definição dos agentes de destino;
- verificação de conflitos;
- registro de auditoria.

A automação não poderá promover uma tese bloqueada ou pendente de revisão.

### Ciclo de vida da automação

```text
rascunho
→ simulação
→ revisão
→ aprovado
→ ativo
→ pausado
→ arquivado
```

Regras:

- a aprovação é vinculada à versão exata da automação;
- alterar condição ou ação invalida a aprovação anterior;
- uma nova versão exige nova simulação;
- ativação em produção exige aprovação humana;
- histórico de versões deve ser preservado;
- rollback deve apontar para uma versão previamente aprovada.

### Modo de simulação — dry-run

Entrada:

- versão da regra;
- condição;
- ação;
- período histórico;
- tenant;
- filtros;
- limites;
- contexto de execução.

Saída:

- eventos analisados;
- eventos que teriam disparado;
- motivo de cada disparo;
- ações que seriam produzidas;
- entidades afetadas;
- possíveis duplicidades;
- quantidade de execuções;
- alertas simulados;
- custo estimado;
- falhas esperadas;
- data da simulação;
- usuário responsável.

Durante o dry-run, o sistema não poderá:

- enviar mensagens;
- alterar pedidos;
- atualizar preços;
- criar tarefas reais;
- registrar pagamentos;
- chamar integrações externas;
- publicar eventos reais de negócio;
- consumir orçamento de anúncios;
- executar qualquer efeito irreversível.

Os adaptadores de infraestrutura também devem respeitar o modo de simulação.

```text
resultado histórico simulado
≠ garantia de resultado futuro
```

### Encadeamento seguro de automações

Cada cadeia deverá carregar:

- `correlation_id`;
- `causation_id`;
- `automation_chain_id`;
- `chain_depth`;
- `origin_automation_id`;
- `origin_event_id`;
- `tenant_id`.

Proteções:

- profundidade máxima;
- máximo de ações por cadeia;
- máximo de ações por período;
- máximo por entidade;
- máximo por tenant;
- cooldown;
- idempotência;
- detecção de repetição;
- detecção de ciclo;
- pausa automática;
- bloqueio manual;
- recuperação controlada.

Exemplo de ciclo:

```text
Automação A
→ Automação B
→ Automação C
→ Automação A
```

### Circuit breaker entre automações

Estados:

```text
closed
→ open
→ half_open
→ closed
```

- `closed`: execução normal;
- `open`: novas execuções da cadeia são bloqueadas;
- `half_open`: teste controlado de recuperação.

Ao abrir o circuito, registrar:

- automação responsável;
- cadeia;
- profundidade;
- eventos envolvidos;
- entidades afetadas;
- ações executadas;
- ações bloqueadas;
- motivo;
- horário;
- usuário ou processo de origem;
- alerta relacionado.

Alertas de cascata serão inicialmente classificados como `alto` ou `critico` e poderão ser enviados ao Telegram.

### Notificações imediatas

- bot do Telegram;
- envio por chamada HTTP;
- somente severidades `critico` e `alto`;
- deduplicação;
- cooldown;
- notificação de resolução;
- vínculo com alerta original;
- histórico de tentativas;
- falha de envio sem perda do alerta do painel;
- vencimento fiscal;
- caixa abaixo da reserva;
- queda de health score;
- risco de ruptura de caixa;
- margem de contribuição crítica;
- aumento anormal de burn rate.

## Exemplos

- alertar estoque baixo;
- sugerir reposição;
- criar tarefa para revisar preço;
- avisar campanha com CPA alto;
- identificar cliente inativo;
- preparar campanha de reativação;
- disparar pesquisa pós-entrega;
- classificar feedback;
- abrir ação de recuperação;
- gerar resumo diário;
- gerar relatório semanal;
- acompanhar decisão;
- cobrar responsável;
- reavaliar resultado;
- criar rascunho de campanha;
- aplicar decisão autorizada;
- registrar execução;
- simular uma automação antes de ativá-la;
- revisar disparos históricos;
- impedir cascatas;
- abrir circuit breaker;
- pausar cadeia problemática;
- notificar incidente de automação;
- reativar de forma controlada.

## Resultado esperado

A Versa possui um motor de automações próprio, integrado aos eventos, à Decision Layer e às políticas de segurança da plataforma, reduzindo trabalho manual sem depender de um orquestrador externo.

---

# Fase 17 — Interfaces e experiência do usuário

## Objetivo

Criar uma experiência clara para operação, análise, decisão e execução.

## Tópicos

- painel administrativo;
- dashboard;
- catálogo;
- estoque;
- vendas;
- clientes;
- fornecedores;
- financeiro;
- marketing;
- decisões;
- memória;
- agentes;
- notificações;
- configurações;
- permissões;
- busca global;
- linha do tempo;
- visualização de eventos;
- relatórios;
- responsividade;
- acessibilidade;
- mobile;
- modo escuro;
- onboarding;
- ajuda contextual;
- atalhos;
- UX orientada por função;
- cards acionáveis;
- sugestões 1-click;
- confirmação de ação;
- visualização de evidências;
- impacto estimado;
- histórico da decisão;
- status da execução;
- feedback sobre recomendação;
- explicação da IA;
- aba de treinamento manual;
- gestão de categorias e exemplos;
- importação manual de conversas;
- aba de galeria de produtos;
- filtros por destino, produto, ocasião e tipo de foto;
- interface de Master Training;
- formulário de dissertação estratégica;
- visualização do texto original;
- revisão da interpretação;
- conflitos detectados;
- aprovação de diretrizes;
- histórico de versões;
- Agent Registry;
- cards de agentes;
- deep dive do agente;
- árvore de conhecimento;
- fontes autorizadas;
- histórico de recomendações;
- custos e orçamento;
- tuning controlado;
- visualização redigida de prompts;
- comparação de versões;
- rollout e rollback;
- Observability & Intelligence Console;
- System Timeline;
- Analysis History;
- Agent Inspector;
- modo desenvolvedor;
- Inbox de Exceções;
- preview de impacto;
- blast radius visual;
- modal de risco;
- justificativa opcional;
- histórico de overrides;
- replay em sandbox;
- comparação de versões;
- Decision Scorecard;
- estado de quarentena;
- kill switches;
- post-mortems;
- Customer Care Watch no pedido;
- Customer Experience Risk;
- Trust & Risk Cases;
- sinais de risco explicáveis;
- revisão manual;
- falso positivo;
- remoção de marcação;
- histórico de incidentes;
- responsabilidade por incidente;
- acompanhamento prioritário;
- recuperação de confiança;
- alertas de nova compra para cliente com histórico delicado;
- Agenda da Inteligência;
- calendário de agentes;
- editor de cadência;
- pause/resume de schedule;
- histórico de alterações de agenda;
- custo previsto por agenda;
- custo realizado;
- análise atrasada;
- análise pulada;
- deadline;
- freshness dos dados;
- dependências;
- quiet hours;
- prioridade;
- revisão humana programada;
- indicação de execução com ou sem LLM;
- Strategy Workspace;
- cards de estratégias em layout flexível estilo Google Keep;
- busca de estratégias;
- filtros por produto, canal, agente, status, resultado, período e tipo;
- estratégia fixada;
- estratégia pausada;
- estratégia reativada;
- tela detalhada da estratégia;
- hipótese;
- contribuições de agentes;
- produtos relacionados;
- campanhas relacionadas;
- posts e execuções relacionadas;
- outcomes;
- comparação previsto versus realizado;
- histórico de versões;
- aprendizados;
- Decision Profile;
- perfil rico do usuário;
- preferências declaradas versus observadas;
- evidências de cada padrão;
- confiança;
- período analisado;
- tamanho de amostra;
- contradições;
- evolução temporal;
- opção de discordar;
- opção de adicionar contexto;
- histórico de alterações do perfil.

### Materiais Operacionais na interface

A gestão deverá possuir uma visão dedicada aos consumíveis.

Exemplos:

```text
Sacola kraft
Estoque: 47
Cobertura: 17 dias
Ponto de pedido: 80
Status: atenção
```

```text
Tag preta
Estoque: 312
Cobertura: 42 dias
Status: saudável
```

Ações:

- entrada;
- ajuste;
- baixa manual;
- inventário;
- editar mínimo e ponto de reposição;
- associar fornecedor;
- consultar consumo e custo;
- consultar pedidos relacionados;
- configurar Packaging Recipe;
- inativar e reativar material.

No pedido, a interface deverá mostrar materiais previstos e permitir correção antes de confirmar o consumo real.

### Strategy Workspace

A tela principal utilizará cards compactos, organizáveis e pesquisáveis.

Exemplo:

```text
┌─────────────────────────────┐
│ Grupos de vendas locais     │
│ ● ATIVA                     │
│ Facebook • WhatsApp         │
│ Produtos: 3                 │
│ Resultado: positivo         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Stories de prova social     │
│ ⏸ PAUSADA                   │
│ Instagram                   │
│ Produtos: 2                 │
│ Última execução: 03/08      │
└─────────────────────────────┘
```

Cada card poderá apresentar:

- título;
- status;
- tags;
- canais;
- produtos;
- agentes;
- número de execuções;
- resultado resumido;
- confiança;
- período;
- fixação.

Ao abrir:

- objetivo;
- hipótese;
- descrição;
- canais;
- táticas;
- público/contexto;
- produtos;
- agentes e contribuição individual;
- evidências;
- campanhas;
- posts;
- automações;
- custos;
- métricas;
- outcomes;
- aprendizados;
- versões;
- histórico;
- timeline.

Ações:

- criar;
- editar;
- duplicar;
- fixar;
- pausar;
- reativar;
- concluir;
- arquivar;
- comparar versões;
- abrir produtos relacionados;
- abrir campanhas relacionadas;
- abrir análise de outcomes.

### Decision Profile / Operator Profile

A aba de perfil deverá mostrar como o usuário costuma decidir dentro da Versa, com base em dados observáveis.

Exemplo:

```text
Perfil de decisão

Risco financeiro
→ baixo

Risco de marketing
→ moderado

Preferência por evidências
→ alta

Revisão de decisões críticas
→ frequente
```

Todo padrão deverá permitir abrir:

```text
Por que concluímos isso?
```

e mostrar:

- fatos;
- período;
- tamanho de amostra;
- evidence IDs;
- interpretação;
- confiança;
- limitações;
- decisões relacionadas.

Ações do usuário:

```text
[Discordo desta avaliação]
[Adicionar contexto]
[Definir preferência]
[Ver evidências]
```

### Perfil declarado versus observado

A interface poderá comparar:

```text
Como você declarou que prefere operar
vs.
Como suas decisões têm se comportado
```

Divergências deverão ser apresentadas de forma neutra.

### Contradições do perfil

Exemplo:

```text
Normalmente evita descontos altos,
mas aprovou 4 descontos agressivos
em liquidações de estoque.

Hipótese:
o padrão muda quando existe estoque parado.
```

Contradições são informação útil e não erro do usuário.

### Agenda da Inteligência

A interface permitirá administrar cadência sem editar código.

Visões:

```text
Hoje
08:00  Financial Daily Review       concluído
10:00  Supplier Health Check        concluído
14:00  Market Scan                  aguardando

Sábado
09:00  Weekly Marketing Analysis
10:00  Content Planning
11:00  Copy Drafts

Domingo
08:00  Planejamento pronto
        aguardando revisão humana
```

Ações:

- criar agenda;
- editar;
- pausar;
- reativar;
- desabilitar;
- executar agora;
- visualizar próxima execução;
- visualizar última execução;
- alterar janela;
- alterar prioridade;
- definir deadline;
- definir quiet hours;
- configurar dependências;
- configurar freshness;
- definir orçamento;
- exigir revisão humana;
- consultar histórico;
- fazer rollback de configuração.

Indicadores:

- próximas análises;
- execuções recentes;
- atrasadas;
- puladas;
- bloqueadas por dependência;
- bloqueadas por orçamento;
- aguardando dados;
- aguardando revisão;
- custo previsto da semana;
- custo realizado da semana;
- chamadas LLM previstas;
- chamadas LLM realizadas.

### Customer Care Watch na interface

Ao abrir um pedido, a interface poderá mostrar:

```text
Acompanhamento recomendado
→ motivo
→ incidentes relevantes
→ responsabilidade
→ ações preventivas
→ follow-up sugerido
```

Exemplo de ações:

- conferir produto;
- conferir embalagem;
- acompanhar postagem;
- revisar prazo;
- confirmar recebimento;
- contato pós-venda.

A interface deverá deixar claro quando o acompanhamento existe porque a empresa falhou anteriormente.

### Trust & Risk Review

Casos de possível fraude deverão apresentar:

- score;
- confiança;
- sinais;
- regras acionadas;
- histórico relevante;
- recomendação;
- opção de revisão;
- resultado posterior;
- marcação de falso positivo;
- remoção ou encerramento do caso.

Evitar rótulos definitivos como:

```text
fraudster = true
```

Preferir:

```text
transaction_risk = high
```

com justificativa e validade contextual.

### Observability & Intelligence Console

A interface deverá oferecer três visões principais.

#### System Timeline

Linha do tempo humana das execuções:

```text
HTTP
→ caso de uso
→ domínio
→ banco
→ evento
→ outbox
→ worker
→ integração/agente
→ resultado
```

Filtros:

- período;
- tenant;
- usuário;
- produto;
- agente;
- automação;
- integração;
- evento;
- worker;
- `correlation_id`;
- `causation_id`;
- severidade;
- erro;
- retry;
- custo;
- duração.

#### Analysis History

Cada análise deverá mostrar:

- agente;
- versão;
- trigger;
- contexto autorizado;
- regras consultadas;
- evidências;
- diretrizes;
- modelo;
- custo;
- duração;
- saída estruturada;
- recomendação;
- confiança;
- decisão humana;
- outcome posterior.

Não será armazenado ou exibido raciocínio interno bruto do modelo. A trilha auditável será estruturada em:

- fatos considerados;
- evidências;
- regras aplicadas;
- hipóteses declaradas;
- conclusões;
- justificativa resumida;
- limitações.

#### Agent Inspector

Cada execução do agente poderá mostrar:

```text
Trigger
→ Context Retrieval
→ Evidence Lookup
→ Deterministic Rules
→ Statistical Analysis quando necessário
→ LLM Call somente quando necessário
→ Structured Response
→ Validation
→ Recommendation
```

Com:

- duração;
- status;
- versão;
- custo;
- evidências;
- erros;
- retries;
- IDs relacionados;
- outcome.

### Modo desenvolvedor

Durante desenvolvimento e diagnóstico, uma visão técnica poderá expor:

- correlation IDs;
- causation IDs;
- execution IDs;
- payloads redigidos;
- eventos;
- outbox;
- queries e duração;
- retries;
- filas;
- worker;
- versão do serviço;
- versão do agente;
- modelo;
- custos;
- circuit breakers;
- traces.

A interface comercial poderá esconder esses detalhes por padrão.

### UX da Decision Safety Layer

Alertas deverão mostrar:

- ação pretendida;
- estado atual;
- estado proposto;
- motivos do risco;
- regras acionadas;
- anomalias;
- impacto estimado;
- blast radius;
- reversibilidade;
- recomendação;
- opções seguras;
- botão de cancelar;
- confirmação proporcional ao risco;
- justificativa opcional.

### Interface de Master Training

A interface deverá permitir:

- inserir texto livre;
- informar título e origem;
- revisar como o Agente Mestre entendeu;
- visualizar regras conflitantes;
- editar a diretriz proposta;
- aprovar;
- bloquear;
- arquivar;
- escolher agentes afetados;
- acompanhar vetorização;
- consultar o histórico de utilização.

### Agent Registry — painel geral

Cada card poderá exibir:

- avatar;
- nome;
- objetivo resumido;
- status;
- versão ativa;
- provedor e modelo;
- sugestões recentes;
- ações recentes;
- custo no período;
- alertas;
- itens em treinamento.

### Agent Registry — visão expandida

#### Identidade e escopo

- objetivo;
- limites;
- responsável;
- versão ativa;
- ações permitidas;
- ações proibidas.

#### Runtime

- provedor;
- modelo;
- temperatura;
- fallback;
- status;
- limites de chamadas.

#### Conhecimento

- diretrizes ativas;
- fontes;
- evidências;
- árvore de conhecimento;
- última atualização;
- itens pendentes.

#### Dados e ferramentas

- tabelas autorizadas;
- read models;
- coleções vetoriais;
- ferramentas;
- integrações;
- permissões.

#### Governança

- estado operacional;
- scorecard;
- taxa de aceitação;
- taxa de rejeição;
- outcomes;
- divergência previsto versus realizado;
- intervenções do Agente Mestre;
- histórico de shadow;
- histórico de quarentena;
- critérios de saída da quarentena;
- orçamento;
- tokens;
- custo;
- última avaliação;
- incidentes;
- rollout;
- rollback.

#### Histórico

- recomendações;
- rascunhos;
- decisões;
- aprovações;
- recusas;
- mudanças de versão;
- conhecimento utilizado.

### Transparência com controle de acesso

- usuário operacional vê objetivo e limites resumidos;
- gestor autorizado vê configurações funcionais;
- administrador técnico vê prompt estrutural versionado;
- segredos e credenciais nunca são exibidos;
- detalhes sensíveis poderão ser redigidos;
- informações de outros tenants nunca são expostas.

## Agente de UX

- analisar fricções;
- identificar telas confusas;
- sugerir melhorias;
- avaliar jornadas;
- acompanhar uso;
- medir eficácia;
- propor simplificações;
- avaliar ações acionáveis;
- acompanhar rejeições de sugestões.

## Resultado esperado

Uma plataforma utilizável diariamente, com transparência controlada sobre agentes, conhecimento, versões, custos e limites.

---

# Fase 18 — Integration Platform e integrações externas

## Objetivo

Construir a camada nativa de integrações da Versa e conectar a plataforma aos canais e serviços utilizados pela operação através de APIs oficiais, webhooks, adapters e processos de sincronização controlados.

## Princípio

A Versa será responsável pela própria infraestrutura de integração.

```text
domínio / aplicação
→ evento ou comando
→ Integration Platform
→ Provider Adapter
→ API oficial externa
```

A camada de domínio não conhecerá detalhes de SDKs, endpoints, tokens ou particularidades de cada fornecedor.

## Integration Platform

### Integration Registry

Cada integração deverá possuir representação gerenciável por tenant.

Campos conceituais:

```text
Integration
├── id
├── tenant_id
├── provider
├── status
├── scopes
├── configuration
├── credentials_reference
├── last_sync_at
├── health
└── audit
```

### Credential Vault

Responsabilidades:

- credenciais isoladas por tenant;
- criptografia;
- rotação;
- expiração;
- revogação;
- escopos mínimos;
- auditoria de acesso;
- nunca expor segredo em logs;
- nunca persistir credencial em eventos de domínio.

### Provider Adapters

Estrutura conceitual:

```text
integrations/
├── meta/
├── whatsapp/
├── instagram/
├── google/
├── ecommerce/
├── payments/
├── shipping/
├── accounting/
└── future-provider/
```

Cada adapter encapsulará:

- autenticação;
- endpoints;
- mapeamento de payload;
- paginação;
- rate limits;
- retries;
- idempotência;
- erros específicos do provedor;
- normalização para contratos internos.

### Webhook Gateway

Responsabilidades:

- receber webhooks;
- autenticar origem;
- validar assinatura;
- deduplicar;
- registrar recebimento;
- normalizar payload;
- preservar payload bruto quando necessário;
- publicar evento interno;
- responder dentro do prazo do provedor;
- reprocessar falhas.

### Sync Engine

Responsabilidades:

- sincronização incremental;
- cursor/checkpoint;
- full sync controlado;
- reconciliação;
- resolução de conflitos;
- retry com backoff;
- rate limiting;
- dead-letter strategy;
- reprocessamento;
- health;
- auditoria;
- origem dos dados.

### Integration Health

Indicadores:

- status;
- última sincronização;
- latência;
- taxa de erro;
- retries;
- chamadas bloqueadas por rate limit;
- webhooks inválidos;
- backlog;
- credencial expirada;
- circuit breaker;
- versão do adapter.

## Canais e serviços planejados

- site da Versa Wear;
- WhatsApp;
- Instagram;
- Meta Ads;
- Google Ads;
- e-mail;
- meios de pagamento;
- transportadoras;
- marketplaces;
- plataformas de e-commerce;
- emissão fiscal;
- contabilidade;
- bancos;
- planilhas;
- ferramentas de atendimento.

## Dados e capacidades

- webhooks;
- APIs;
- importação;
- exportação;
- sincronização;
- resolução de conflitos;
- monitoramento;
- UTMs;
- `fbp`;
- `fbc`;
- IDs de sessão;
- IDs de clique;
- dados de campanha;
- dados de criativo;
- dados de conversão;
- consentimento;
- falhas de integração;
- reprocessamento;
- rate limits;
- filas;
- rastreabilidade da origem;
- circuit breakers;
- observabilidade;
- auditoria por tenant.

## Ferramentas externas de automação

n8n, Make, Zapier e ferramentas semelhantes **não fazem parte da arquitetura interna atual**.

No futuro, a Versa poderá oferecer:

```text
Versa API / Webhooks
→ n8n, Make, Zapier ou sistemas próprios do cliente
```

Essas ferramentas serão consumidores externos opcionais. A plataforma continuará funcionando integralmente sem elas.

## Nota de referência — WhatsApp

Antes de planejar qualquer integração de WhatsApp, consultar o **Anexo II — seção de Canal de Atendimento**.

Decisão vigente:

```text
texto gerado no sistema
→ revisão humana
→ link wa.me
→ envio manual
```

Análise de conversa:

```text
conversa selecionada
→ colagem manual
→ armazenamento fiel
→ análise
→ sugestão
```

Não fazem parte da decisão atual:

- Baileys;
- leitura automática não oficial;
- scraping de conversa;
- automação de sessão do WhatsApp Web;
- qualquer solução que coloque o número comercial em risco.

Uma integração oficial futura poderá ser avaliada somente quando existirem:

- necessidade operacional comprovada;
- volume suficiente;
- orçamento;
- consentimento;
- arquitetura de privacidade;
- integração oficial adequada;
- análise de custo e benefício;
- nova decisão arquitetural registrada.

## Resultado esperado

A Versa passa a possuir uma camada própria, auditável e multi-tenant para integração com serviços externos, mantendo controle sobre credenciais, sincronização, falhas, retries, rate limits e saúde das conexões.
---

# Fase 19 — Observabilidade, segurança, privacidade e confiabilidade

## Objetivo

Preparar a plataforma para operação contínua, auditoria e crescimento seguro.

## Tópicos

### Observabilidade

- logs estruturados;
- métricas;
- traces;
- health checks;
- readiness;
- alertas;
- dashboards técnicos;
- correlação de requisições;
- correlação de eventos;
- monitoramento de workers;
- monitoramento de projeções;
- monitoramento de integrações;
- monitoramento do Integration Registry;
- monitoramento do Webhook Gateway;
- monitoramento do Sync Engine;
- monitoramento de retries e dead letters;
- monitoramento de rate limits;
- monitoramento de credenciais expiradas;
- monitoramento de modelos;
- monitoramento de automações;
- monitoramento de circuit breakers;
- monitoramento de cadeias;
- monitoramento de custo de IA;
- reconciliação de custo estimado e faturado;
- System Timeline;
- histórico de análises;
- logs de negócio;
- logs técnicos estruturados;
- traces de agentes;
- scorecards de agentes;
- outcomes;
- divergência previsto versus realizado;
- replay auditável;
- post-mortems;
- inbox de exceções;
- estados de quarentena;
- agenda de agentes;
- execuções por schedule;
- análises puladas;
- análises atrasadas;
- bloqueios por freshness;
- bloqueios por orçamento;
- taxa de utilização de LLM;
- execuções resolvidas sem LLM;
- cache hit rate;
- fallback de modelo;
- decisões do Necessity Policy.

### Governança do Intelligence Scheduler

- timezone por tenant;
- versionamento de schedules;
- histórico de alterações;
- RBAC de edição;
- limites de concorrência;
- prioridades;
- deadlines;
- quiet hours;
- data freshness;
- dependências;
- deduplicação;
- idempotência;
- prevenção de execução simultânea indevida;
- orçamento;
- cancelamento;
- pause/resume;
- auditoria;
- alertas de atraso;
- alertas de starvation;
- política para execução parcial.

### Governança do AI Gateway

Toda chamada externa de IA deverá ser rastreável.

Registrar:

- tenant;
- agente;
- funcionalidade;
- motivo da chamada;
- categoria da tarefa;
- resultado da Necessity Policy;
- provider;
- modelo;
- fallback;
- cache;
- custo;
- tokens;
- latência;
- contexto enviado;
- classificação de dados;
- resultado;
- erro;
- correlation_id.

A plataforma deverá medir:

```text
execuções totais
execuções sem LLM
execuções com LLM
percentual de uso externo
custo por resultado útil
```

Objetivo:

> usar IA externa onde ela agrega valor, e não onde apenas substitui código determinístico.

### Observabilidade orientada a negócio

A telemetria deverá separar eventos técnicos de eventos compreensíveis para operação.

Exemplos técnicos:

```text
database.query.completed
worker.job.retry
integration.request.failed
```

Exemplos de negócio:

```text
Preço alterado
Margem entrou em zona de risco
Usuário ignorou alerta
Agente sugeriu reposição
Automação evitou ruptura
Agente entrou em quarentena
```

Ambos deverão poder ser correlacionados pela mesma execução.

### Governança de Trust & Risk e Customer Care

- critérios explicáveis;
- revisão humana;
- minimização de dados;
- separação entre risco transacional e risco de experiência;
- proteção contra atributos sensíveis;
- proteção contra proxies discriminatórios;
- medição de falso positivo;
- medição de falso negativo quando possível;
- retenção limitada;
- revisão de marcações;
- remoção de marcações;
- validade temporal;
- trilha de decisão;
- auditoria de override;
- outcome tracking;
- histórico de mudança de regras;
- versionamento do score;
- direito de revisão operacional;
- monitoramento de drift.

Uma pessoa não deve permanecer indefinidamente sob marcação de risco por um evento antigo sem reavaliação.

### Governança de qualidade de atendimento

- métricas de resolução real;
- recorrência;
- reabertura;
- recuperação de confiança;
- alertas de deterioração;
- acompanhamento de clientes vulneráveis à recorrência operacional;
- auditoria das recomendações de atendimento;
- avaliação de impacto de automações na experiência;
- comparação entre resultado financeiro e impacto de CX.

### Governança de materiais operacionais

Requisitos:

- movimentações auditáveis;
- ajustes manuais rastreáveis;
- custo histórico preservado;
- consumo vinculado a pedido;
- consumo previsto separado do real;
- idempotência na baixa;
- permissões por ação;
- reconciliação de inventário;
- política explícita para estoque negativo;
- materiais inativos preservando histórico;
- fornecedores e lead times rastreáveis;
- correlação com pedidos, campanhas, estratégias e outcomes.

### Governança do Strategy Workspace

- versionamento;
- histórico imutável de resultados;
- permissões de edição;
- permissões de pausa/reativação;
- auditoria de mudanças;
- preservação de estratégias concluídas;
- vínculo rastreável com campanhas, produtos e agentes;
- outcomes associados a período e versão;
- prevenção de sobrescrita do passado;
- retenção de evidências;
- diferenciação entre hipótese e fato;
- estado e motivo de pausa;
- autoria e contribuição dos agentes.

### Governança do Decision Profile

O perfil é operacional e explicável.

Permitido:

- padrões de decisão observáveis;
- preferências operacionais;
- resposta a alertas;
- frequência de override;
- uso de evidências;
- estilo de revisão;
- horizonte de decisão;
- tolerância a risco por contexto operacional.

Não permitido:

- diagnóstico psicológico;
- inferência clínica;
- traços de saúde mental;
- ideologia;
- religião;
- caráter;
- inteligência;
- honestidade presumida;
- atributos sensíveis;
- proxies para atributos sensíveis.

Requisitos:

- evidence IDs;
- confiança;
- período;
- tamanho de amostra;
- versionamento;
- feedback do usuário;
- contestação;
- correção;
- contexto adicional;
- expiração/reavaliação de padrões antigos;
- transparência sobre uso pelos agentes;
- RBAC;
- retenção adequada;
- audit trail.

O Decision Profile nunca poderá remover guardrails nem autorizar ações irreversíveis sozinho.

### Segurança

- auditoria;
- gestão de segredos;
- criptografia;
- rate limiting;
- proteção contra abuso;
- hardening;
- análise de dependências;
- políticas de acesso;
- resposta a incidentes;
- trilha de ações;
- autenticação forte;
- segregação de tenants;
- RBAC para Agent Registry;
- proteção de prompts;
- redação de informações sensíveis;
- guardrails imutáveis;
- validação de ferramentas;
- proibição de remoção de controles críticos;
- isolamento de conhecimento por tenant.

### Guardrails de agentes

Configurações no banco poderão ser alteradas de forma controlada, mas estas proteções permanecerão na aplicação:

- isolamento de tenant;
- autorização;
- anonimização;
- validação de ferramentas;
- exigência de evidências;
- limites financeiros;
- proibição de ações críticas não autorizadas;
- auditoria;
- políticas legais;
- regras de retenção.

Um administrador não poderá remover essas proteções apenas editando uma configuração.

### Privacidade e LGPD

- consentimentos;
- finalidades;
- retenção;
- minimização;
- anonimização;
- exclusão;
- portabilidade;
- dados pessoais;
- dados de navegação;
- UTMs;
- IDs de sessão;
- `fbp`;
- `fbc`;
- rastreabilidade;
- acesso do titular;
- governança de dados.

### Governança financeira

- validação contábil;
- trilha de aprovação;
- versionamento de políticas;
- reconciliação;
- retenção de documentos;
- segregação de funções;
- registro de premissas;
- auditoria de simulações;
- proteção contra retirada automática;
- revisão tributária quando necessária.

### Privacidade financeira para IA

- DTOs específicos;
- allowlist;
- classificação de dados;
- minimização;
- agregação;
- supressão de grupos pequenos;
- ausência de identificadores;
- ausência de transações individuais;
- validação automática;
- log do contexto enviado;
- `evidence_id`;
- política de retenção.

### Monitoramento de custo de IA e LLM

O monitoramento deverá distinguir uso necessário, uso evitado e uso degradado/fallback.

Dimensões mínimas:

- tenant;
- agente;
- funcionalidade;
- categoria de uso;
- provedor;
- modelo;
- chamada;
- usuário;
- automação;
- decisão;
- ambiente;
- período;
- tokens de entrada;
- tokens de saída;
- tokens em cache;
- moeda;
- tabela de preço;
- versão do preço;
- custo estimado;
- custo faturado;
- `llm_required`;
- `necessity_reason`;
- `cache_hit`;
- `fallback_used`;
- `resolved_without_llm`;
- `schedule_id`;
- `analysis_execution_id`.

Distinção obrigatória:

```text
estimated_cost
billed_cost
```

O custo de uma chamada deve preservar:

- preço usado no momento;
- `pricing_version`;
- `pricing_effective_at`;
- quantidade de tokens;
- descontos ou cache;
- moeda;
- data;
- origem;
- vínculo com agente e funcionalidade.

### Orçamentos de IA

Os limites poderão existir:

- por tenant;
- por agente;
- por funcionalidade;
- por categoria;
- por modelo;
- por provedor;
- por dia;
- por mês;
- de forma global.

Tipos:

```text
soft_limit
hard_limit
```

- `soft_limit`: alerta sem bloqueio;
- `hard_limit`: bloqueio ou exigência de aprovação.

Faixas iniciais configuráveis:

- 70%: aviso;
- 85%: alerta alto;
- 100%: bloqueio, aprovação ou degradação controlada.

### LLM Necessity Policy

Antes de chamar IA externa, a plataforma deverá responder:

```text
Esta tarefa exige LLM?
```

A política poderá considerar:

- existe implementação determinística adequada?
- existe modelo estatístico adequado?
- existe resultado recente reutilizável?
- existe cache válido?
- a tarefa exige linguagem natural?
- a tarefa exige interpretação semântica?
- a tarefa exige criatividade?
- o benefício esperado justifica o custo?
- o dado pode ser enviado ao provider?
- há orçamento?
- o modelo está saudável?

A decisão deverá ser observável e auditável.

### Degradação controlada

Ao atingir limites, o sistema poderá:

- usar modelo mais barato;
- reduzir contexto;
- reutilizar cache;
- trocar LLM por regra determinística;
- gerar resposta simplificada;
- exigir aprovação;
- pausar agente não essencial;
- bloquear funcionalidade não essencial.

Nenhuma degradação pode acontecer silenciosamente.

### Custo versus valor

Métricas futuras:

- custo por sugestão;
- custo por resposta aprovada;
- custo por campanha;
- custo por decisão aceita;
- custo por automação;
- custo por cliente recuperado;
- custo por receita atribuída;
- economia de tempo estimada.

O custo de IA alimentará:

- burn rate segmentado;
- orçado versus realizado;
- projeção de caixa;
- health score financeiro;
- orçamento de tecnologia;
- análise de retorno dos agentes.

### Segurança de automações

- auditoria de dry-runs;
- registro de versões;
- aprovação por versão;
- proteção contra efeitos colaterais;
- `correlation_id`;
- `causation_id`;
- `automation_chain_id`;
- limite de profundidade;
- detecção de ciclos;
- circuit breaker;
- alertas de cascata;
- recuperação em `half_open`;
- logs de ações bloqueadas;
- runbook para incidentes de automação.

### Governança do Agent Registry

- versionamento de agentes;
- estados operacionais `active`, `degraded`, `shadow`, `quarantined`, `disabled`;
- critérios explícitos de entrada e saída de quarentena;
- scorecards;
- thresholds de qualidade;
- taxa de aceitação/rejeição;
- outcome tracking;
- regressão por versão;
- intervenção do Agente Mestre;
- recomendação de quarentena;
- redução de autonomia;
- aprovação para retorno à produção;
- shadow obrigatório após determinadas alterações;
- replay antes de reativação;
- post-mortem de incidentes de agentes;
- assinatura ou hash da versão;
- aprovação;
- rollout gradual;
- rollback;
- comparação entre versões;
- golden set;
- testes de segurança;
- auditoria de conhecimento;
- validade das diretrizes;
- expiração;
- suspensão;
- histórico de responsáveis;
- incidentes por agente.

### Controle de acesso ao prompt

- acesso por função;
- versão redigida;
- ocultação de segredos;
- ocultação de credenciais;
- ocultação de detalhes exploráveis;
- trilha de consulta;
- bloqueio de exportação não autorizada;
- separação por tenant.

### Qualidade e segurança da IA

- golden set versionado;
- perguntas com resposta conhecida;
- taxa de grounding;
- taxa de evidência válida;
- avaliação de alucinação;
- teste de regressão de prompts;
- versionamento de modelos;
- versionamento de exemplos;
- registro de contexto usado;
- bloqueio de resposta sem suporte;
- monitoramento de deriva;
- detecção de degradação de aceitação;
- detecção de sequência de outcomes negativos;
- detecção de aumento anormal de custo;
- detecção de regressão de versão;
- detecção de falha recorrente de ferramenta;
- avaliação do Agente Mestre;
- recomendação de intervenção.

### Governança de replay e simulação

- execução somente em sandbox;
- ausência de efeitos colaterais;
- marcação explícita de dados simulados;
- retenção;
- versionamento;
- usuário responsável;
- origem da execução;
- custo;
- auditoria;
- comparação com execução original.

### Confiabilidade

- backups;
- restauração;
- retenção;
- recuperação de falhas;
- dead-letter;
- reprocessamento;
- disaster recovery;
- testes de carga;
- testes de segurança;
- monitoramento de custos gerais;
- monitoramento específico de IA e LLM;
- capacidade;
- SLOs;
- SLIs;
- runbooks;
- planos de contingência.

### Coleta competitiva responsável

- legislação aplicável;
- termos de uso;
- limites de acesso;
- propriedade intelectual;
- dados pessoais;
- autenticação;
- rate limits;
- bloqueios técnicos;
- políticas de plataforma;
- proibição de acesso indevido;
- governança de fontes.

## Resultado esperado

Uma plataforma segura, auditável, recuperável, financeiramente observável e capaz de governar agentes, conhecimento, prompts e fontes sem transformar a Camada C em uma caixa-preta.

---

# Fase 20 — Escalabilidade e evolução da arquitetura

## Objetivo

Escalar somente os pontos que realmente exigirem separação.

## Tópicos

- análise de gargalos;
- cache;
- Redis;
- filas;
- mensageria;
- particionamento;
- réplicas de leitura;
- processamento assíncrono;
- workers especializados;
- event streaming;
- isolamento de módulos;
- extração de serviços;
- contratos entre serviços;
- versionamento de eventos;
- observabilidade distribuída;
- escalabilidade horizontal;
- containers;
- Docker;
- CI/CD;
- ambientes;
- feature flags;
- blue-green;
- rollback;
- infraestrutura como código;
- data warehouse;
- lakehouse;
- banco analítico;
- grafo especializado;
- processamento de ML;
- filas de scraping;
- filas de agentes;
- orquestração de pipelines.

## Princípio

Microsserviços só serão considerados quando houver necessidade concreta de:

- escala independente;
- isolamento operacional;
- equipes independentes;
- limites de domínio maduros;
- requisitos diferentes de disponibilidade;
- gargalos comprovados.

## Resultado esperado

Crescimento técnico sem abandonar clareza, rastreabilidade e controle.

---

# Fase 21 — Produto SaaS e expansão

## Objetivo

Transformar a plataforma interna em um produto utilizável por outras empresas.

## Tópicos

- onboarding de tenants;
- planos;
- cobrança;
- assinatura;
- limites;
- trial;
- customização;
- branding;
- configuração por segmento;
- templates;
- isolamento;
- suporte;
- central de ajuda;
- métricas de uso;
- administração da plataforma;
- gestão de clientes SaaS;
- migração;
- importação inicial;
- marketplace de integrações;
- marketplace de automações;
- marketplace de agentes;
- catálogo de modelos;
- catálogo de dashboards;
- benchmark por segmento;
- anonimização para benchmark;
- governança de IA;
- SLAs;
- suporte multiempresa;
- billing por uso;
- feature flags por plano.

## Resultado esperado

Uma plataforma comercializável, validada inicialmente dentro da própria Versa Wear.

---

# 5. Ideias transversais

## 5.1 Actionable UI

A interface não deve apenas mostrar dados. Ela deve permitir:

- compreender;
- investigar;
- decidir;
- executar;
- registrar;
- acompanhar resultados.

```text
Insight
→ evidência
→ sugestão
→ confirmação
→ comando
→ evento
→ auditoria
→ resultado
```

## 5.2 Customer Event Timeline

O cliente será entendido por uma linha do tempo de eventos, sem obrigar a adoção de Event Sourcing completo em todo o sistema.

A timeline deve registrar:

- origem;
- momento;
- canal;
- contexto;
- cliente;
- sessão;
- campanha;
- produto;
- pedido;
- resultado.

## 5.3 Separação entre fato, correlação e causalidade

A plataforma deve distinguir:

- fato observado;
- correlação;
- hipótese;
- causa confirmada;
- recomendação;
- decisão;
- ação.

## 5.4 Histórico completo

Toda alteração relevante deve registrar:

- quem fez;
- quando fez;
- o que mudou;
- por que mudou;
- estado anterior;
- estado novo;
- decisão relacionada;
- resultado posterior.

## 5.5 Aceitar, recusar, modificar ou adiar sugestões

Toda recomendação relevante poderá ser:

- aceita;
- recusada;
- modificada;
- adiada;
- executada;
- cancelada;
- avaliada depois.

A justificativa deve ser preservada.

## 5.6 Evidências

Toda análise deve informar, quando possível:

- dados usados;
- período;
- regras;
- modelo;
- confiança;
- limitações;
- fontes;
- contradições;
- alternativas.

## 5.7 Humano no controle

A plataforma pode:

- detectar;
- explicar;
- recomendar;
- simular;
- preparar;
- automatizar tarefas autorizadas.

Decisões críticas continuam sob controle humano.

## 5.8 Progressive Intelligence

```text
Regra determinística
→ modelo estatístico
→ explicação assistiva
→ decisão
→ automação autorizada
```

## 5.9 Grounding obrigatório

```text
Resposta
→ evidence_id
→ fonte real
→ localização rastreável
```

Contexto SQL e contexto vetorial não devem ser misturados sem identificação da origem.

## 5.10 WhatsApp como solução transitória

```text
Geração no sistema
→ revisão humana
→ abertura via wa.me
→ envio manual
```

Conversas serão importadas seletivamente por colagem manual. A arquitetura não pressupõe monitoramento integral do canal.

## 5.11 Alertas com controle de ruído

```text
Detecção
→ severidade
→ deduplicação
→ cooldown
→ painel
→ Telegram para crítico/alto
```

## 5.12 Ativos criativos orientados por metadados

```text
Arquivo preparado externamente
→ upload
→ metadados
→ organização
→ uso pelos agentes
```

Não haverá visão computacional nem processamento de imagem no backend nesta etapa.

## 5.13 Inteligência financeira explicável

```text
transações
→ cálculos determinísticos
→ métricas
→ cenários
→ decisão
→ realizado
→ aprendizado
```

Scores e previsões nunca substituirão seus componentes, pesos, premissas e evidências.

## 5.14 Lucro não é caixa

A plataforma deverá preservar a distinção entre:

- lucro contábil;
- caixa disponível;
- contas a receber;
- obrigações;
- estoque;
- reserva mínima;
- valor gerencialmente retirável;
- valor contabilmente e tributariamente validado.

## 5.15 Anonimização financeira para IA

```text
dado bruto
→ cálculo
→ agregação
→ DTO permitido
→ validação
→ AI Gateway
```

A anonimização será baseada em allowlist, classificação e minimização, não em comparação simples de strings.

## 5.16 Automação segura por padrão

```text
rascunho
→ dry-run
→ revisão
→ aprovação da versão
→ ativação
→ monitoramento
```

Toda automação deverá ser simulável antes de produzir efeitos reais.

## 5.17 Causalidade entre eventos e automações

```text
correlation_id
→ cadeia completa

causation_id
→ causa imediata
```

Esses identificadores permitirão rastrear cascatas, detectar ciclos e interromper cadeias inseguras.

## 5.18 Circuit breaker de automação

```text
closed
→ open
→ half_open
→ closed
```

O circuito deverá bloquear cascatas e permitir recuperação controlada.

## 5.19 FinOps de IA

```text
chamada
→ tokens
→ preço versionado
→ custo estimado
→ custo faturado
→ orçamento
→ valor gerado
```

O uso de LLM deverá ser financeiramente rastreável, orçado e relacionado ao valor produzido.

## 5.20 Decisão vigente de WhatsApp

```text
geração no sistema
→ revisão humana
→ wa.me
→ envio manual
```

Leitura automática não oficial permanece fora do escopo. Uma integração oficial futura exigirá nova decisão arquitetural.

## 5.21 Ensino estratégico controlado

```text
fonte original
→ interpretação
→ validação
→ revisão humana
→ aprovação
→ versão
→ distribuição
```

O sistema preservará o texto original e não confundirá vetorização com fine-tuning.

## 5.22 Agente Mestre sem poder operacional

```text
interpretar
→ estruturar
→ alertar
→ sugerir
```

O Agente Mestre não executa ações de loja, não altera guardrails e não ativa conhecimento sozinho.

## 5.23 Agentes como entidades versionadas

```text
Agent
→ Agent Version
→ Knowledge Assignment
→ avaliação
→ publicação
→ rollback
```

## 5.24 Transparência com segurança

A interface mostrará objetivos, limites, fontes, custos e histórico conforme o nível de acesso, sem expor segredos ou permitir a remoção de proteções fundamentais.

## 5.25 Observability & Intelligence Console

```text
System Timeline
+ Analysis History
+ Agent Inspector
+ Developer Mode
```

A plataforma deverá explicar operacionalmente o que aconteceu sem depender de logs brutos.

## 5.26 Decision Safety Layer

```text
intenção
→ risco
→ impacto
→ confirmação
→ execução
→ outcome
```

A proteção deve existir na arquitetura, e não apenas na interface.

## 5.27 Shadow Mode e Replay

Novas versões de agentes e automações poderão ser comparadas em paralelo e execuções passadas poderão ser reproduzidas em sandbox sem efeitos reais.

## 5.28 Outcome Tracking

Recomendações e decisões deverão ser avaliadas pelo resultado posterior, não apenas pela qualidade aparente da resposta.

## 5.29 Decision Scorecard

Agentes serão medidos por utilidade, grounding, custo, aceitação, outcomes e regressões.

## 5.30 Supervisão do Agente Mestre

O Agente Mestre atuará como supervisor da qualidade da frota, podendo recomendar mudanças, Shadow Mode, rollback, redução de autonomia ou quarentena.

## 5.31 Quarentena de agentes

Agentes problemáticos poderão ser isolados da produção sem serem excluídos, preservando diagnóstico, testes e possibilidade de recuperação.

## 5.32 Kill Switches e Inbox de Exceções

Capacidades críticas poderão ser pausadas seletivamente e exceções serão centralizadas para investigação e aprovação.

## 5.33 Post-mortem automático

Incidentes relevantes terão uma reconstrução inicial automática baseada em traces, eventos, retries, circuit breakers e IDs de correlação.

## 5.34 Blast Radius e Preview de Impacto

A plataforma deverá mostrar o impacto potencial de mudanças relevantes antes de executá-las.

## 5.35 Customer Care Watch

Clientes com problemas recorrentes deverão receber acompanhamento proativo em compras futuras, com foco em evitar que a empresa repita a mesma falha.

## 5.36 Trust & Risk Intelligence

Sinais de possível fraude serão avaliados de forma explicável, revisável e orientada por evidências, sem transformar suspeita em culpa presumida.

## 5.37 Recuperação de Confiança

A resolução de um problema deverá ser acompanhada até que a experiência posterior indique recuperação ou persistência do risco.

## 5.38 Customer Experience Risk

A Versa deverá medir também o risco de a própria operação voltar a falhar com o cliente.

## 5.39 Cliente como prioridade máxima

```text
segurança
→ confiança
→ experiência
→ sustentabilidade
→ otimização
```

A plataforma não deverá considerar uma estratégia superior apenas porque gera mais receita.

## 5.40 Agenda da Inteligência

Agentes e análises terão cadência explícita, gerenciável e versionada dentro da plataforma.

```text
evento certo
+ momento certo
+ dados certos
+ agente certo
+ custo adequado
= análise útil
```

## 5.41 Intelligence Scheduler

O sistema coordenará prioridades, dependências, deadlines, freshness, concorrência, quiet hours e orçamento antes de executar análises.

## 5.42 LLM Only When Needed

IA externa será uma ferramenta especializada.

```text
Camada A
→ Camada B
→ Camada C somente quando necessário
```

## 5.43 AI Gateway e Model Router

Todas as chamadas externas de IA passarão por um gateway central com política de necessidade, orçamento, cache, fallback, privacidade, observabilidade e roteamento de modelo.

## 5.44 Agente não é LLM

Agentes poderão ser majoritariamente determinísticos e utilizar LLM somente para tarefas em que linguagem ou interpretação semântica agreguem valor.

## 5.45 Strategy Workspace

Estratégias serão entidades próprias, visualizadas em cards, com hipótese, produtos, canais, agentes, contribuições, versões, execuções, outcomes e aprendizados.

## 5.46 Strategy Lifecycle

```text
draft
→ active
→ paused
→ active
→ completed
→ archived
```

Pausa e reativação preservam histórico.

## 5.47 Estratégia como experimento

```text
hipótese
→ execução
→ resultado
→ confirmação / rejeição
→ aprendizado
```

## 5.48 Decision Profile

A Versa poderá modelar como o operador costuma decidir dentro da plataforma, desde que toda conclusão seja explicável, revisável e baseada em evidências observáveis.

## 5.49 Fatos, padrões e interpretações

```text
fato
→ padrão
→ interpretação
```

As três camadas nunca deverão ser confundidas.

## 5.50 Perfil declarado versus observado

A plataforma poderá comparar preferências explicitamente declaradas com padrões históricos, mostrando convergências e contradições sem tratar divergência como erro.

## 5.51 Estoque além do produto

A Versa deverá controlar também materiais consumidos para entregar o pedido, não apenas itens vendáveis.

## 5.52 Packaging Recipes

Receitas de embalagem permitirão prever e sugerir consumíveis por pedido, preservando ajuste humano e consumo real.

## 5.53 Custo físico real do pedido

```text
produto
+ embalagem
+ sacola
+ tag
+ cartões
+ outros consumíveis
= custo físico real
```

## 5.54 Forecasting de consumíveis

A previsão deverá antecipar ruptura usando consumo real, vendas previstas, sazonalidade, estratégias futuras e lead time.

## 5.55 Estratégia consciente de estoque operacional

Campanhas e estratégias deverão estimar materiais necessários antes da ativação e participar do Preview de Impacto.

---

# 6. Mapeamento das ideias profundas por fase

| Ideia | Fases principais |
|---|---|
| Actionable Product Cards | 3, 9, 13, 15, 17 |
| Read models do catálogo | 1, 3, 9 |
| Tags operacionais | 3, 4, 6, 9 |
| Tags de tração | 9, 12 |
| Tags de ecossistema | 10, 18 |
| Ações 1-click | 13, 15, 16, 17 |
| Customer Event Timeline | 6, 7, 18 |
| Atribuição multi-touch | 7, 10, 18, 19 |
| Customer Health Score | 7, 12, 13 |
| Unboxing e sentimento | 7, 15, 16, 18 |
| Cohorts | 7, 9, 12 |
| Entropia do estoque | 4, 8, 12 |
| Grafo de dependências | 5, 6, 7, 8, 12 |
| Produtos roteadores | 3, 6, 7, 8, 12 |
| Vazio comportamental | 7, 12, 13 |
| RAG ambiental | 11, 12, 15, 16 |
| Radar de fraquezas | 11, 15 |
| Engenharia do “Uau” | 11, 13 |
| Batalha de promessas | 11, 13 |
| Matriz de tom de voz | 7, 11, 15 |
| Governança, LGPD e auditoria | 2, 18, 19 |
| Strategic Memory | 13, 14, 15 |
| Evidence Engine | 13, 14, 15 |
| Automação autorizada | 13, 16, 17 |
| Automation Engine nativo | 16, 19 |
| Integration Platform nativa | 18, 19 |
| Integration Registry | 18, 19 |
| Credential Vault | 18, 19 |
| Provider Adapters | 18 |
| Webhook Gateway | 18, 19 |
| Sync Engine | 18, 19 |
| Integration Health | 18, 19 |
| API/Webhooks públicos para integrações opcionais | 18, 20, 21 |
| Escalabilidade futura | 20 |
| SaaS | 21 |
| Correlação temporal defasada | 5, 6, 7, 8, 12 |
| Silêncio anômalo | 7, 12, 13 |
| Cesta perdida | 3, 6, 9, 12 |
| Preço tabelado versus praticado | 6, 8, 12, 14 |
| Deriva de tom e engajamento | 7, 12, 15 |
| Evidence ID obrigatório | 13, 14, 15 |
| Contexto SQL e vetorial separados | 12, 14, 15 |
| Golden set da Camada C | 14, 15, 19 |
| Importação manual de conversas | 6, 7, 15, 17 |
| Classificação regra versus LLM | 6, 7, 12, 15 |
| Aba de treinamento manual | 13, 14, 15, 17 |
| Alertas com Telegram | 9, 12, 13, 16, 19 |
| WhatsApp manual via wa.me | 6, 7, 15, 18 |
| Galeria de produtos | 3, 10, 17 |
| Processamento externo de imagens | 10 |
| Ponto de equilíbrio | 8, 9 |
| Margem de contribuição real | 6, 8, 9 |
| Ciclo de conversão de caixa | 5, 6, 8, 12 |
| Burn rate segmentado | 8, 9 |
| Cenários de caixa | 8, 12 |
| Capital imobilizado financeiro | 4, 8, 9, 12 |
| CAC versus LTV | 7, 8, 9, 10, 12 |
| Orçado versus realizado | 8, 9, 13, 14 |
| Obrigações fiscais | 8, 9, 16, 19 |
| Health score financeiro | 8, 9, 12, 13 |
| Pró-labore | 8 |
| Retirada segura | 8, 13 |
| Simulação de pró-labore | 8, 12 |
| Previsão híbrida de receita | 8, 12 |
| Sazonalidade financeira | 8, 11, 12 |
| DTO financeiro anonimizado | 8, 14, 15, 19 |
| Validação contábil | 8, 13, 19 |
| Dry-run de automação | 16 |
| Aprovação por versão de automação | 16 |
| Simulação sem efeitos colaterais | 16, 19 |
| Correlation e causation IDs | 1, 16, 19 |
| Limite de profundidade de cadeia | 16 |
| Detecção de ciclos | 16 |
| Circuit breaker de automações | 16, 19 |
| Alerta de cascata via Telegram | 16, 19 |
| Custo de IA por agente | 15, 19 |
| Custo por modelo e provedor | 15, 19 |
| Tokens e cache | 15, 19 |
| Orçamento de IA | 8, 16, 19 |
| Soft limit e hard limit | 16, 19 |
| Custo estimado versus faturado | 8, 19 |
| Custo de IA no burn rate | 8, 9, 19 |
| Custo versus valor gerado | 9, 13, 19 |
| Nota de referência do WhatsApp | 18 |
| Possível integração oficial futura | 18, 19 |
| Master Training | 14, 17 |
| Conteúdo original imutável | 14 |
| Estruturação de diretrizes | 13, 14 |
| Proveniência e evidence ID | 14 |
| Vetorização de conhecimento | 14 |
| Regras de precedência | 13, 14, 19 |
| Agente Mestre | 15 |
| Sugestão de agentes afetados | 15 |
| Distribuição aprovada de conhecimento | 13, 15, 16 |
| Entidade Agent | 15 |
| Agent Version | 15, 19 |
| Agent Knowledge Assignment | 14, 15 |
| Agent Registry | 17 |
| Deep Dive do agente | 17, 19 |
| Árvore de conhecimento | 14, 17 |
| Visualização de prompts com RBAC | 2, 17, 19 |
| Guardrails imutáveis | 15, 19 |
| Golden set de agentes | 15, 19 |
| Rollout e rollback de agentes | 15, 19 |
| Custos e orçamentos por agente | 15, 19 |
| Observabilidade mínima da vertical slice | 1 |
| Logs estruturados | 1, 19 |
| System Timeline | 1, 17, 19 |
| Analysis History | 14, 15, 17, 19 |
| Agent Inspector | 15, 17, 19 |
| Developer Mode | 1, 17, 19 |
| Decision Safety Layer | 13, 17, 19 |
| Preview de Impacto | 13, 17 |
| Blast Radius | 13, 15, 16, 17 |
| Confirmação proporcional ao risco | 13, 17, 19 |
| Override com justificativa opcional | 13, 14, 17 |
| Memória de exceções | 13, 14, 19 |
| Outcome Tracking | 13, 14, 15, 19 |
| Decision Scorecard | 15, 17, 19 |
| Shadow Mode de agentes | 15, 19 |
| Shadow Mode de automações | 16, 19 |
| Replay em sandbox | 15, 16, 17, 19 |
| Simulador histórico de políticas | 13, 16, 19 |
| Diff semântico de versões | 15, 17, 19 |
| Kill Switches | 16, 17, 19 |
| Inbox de Exceções | 16, 17, 19 |
| Post-mortem automático | 16, 17, 19 |
| Observabilidade orientada a negócio | 1, 17, 19 |
| Supervisão de agentes pelo Agente Mestre | 15, 19 |
| Estados operacionais de agentes | 15, 17, 19 |
| Quarentena de agentes | 15, 17, 19 |
| Reentrada controlada após quarentena | 15, 19 |
| Customer Incident History | 6, 7, 14, 19 |
| Customer Care Watch | 6, 7, 15, 17, 19 |
| Customer Experience Risk | 7, 12, 13, 17, 19 |
| Recuperação de Confiança | 7, 14, 15, 17 |
| Trust & Risk Intelligence | 6, 12, 13, 15, 17, 19 |
| Trust & Risk Agent | 15, 17, 19 |
| Customer Care Agent | 7, 15, 17, 19 |
| RiskCase e outcome de fraude | 12, 14, 19 |
| Falsos positivos de risco | 12, 15, 19 |
| Acompanhamento prioritário pós-compra | 6, 7, 17 |
| Métricas de qualidade de atendimento | 7, 9, 15, 19 |
| Proteção de CX na Decision Safety | 13, 17, 19 |
| Prioridade máxima de cliente e atendimento | transversal |
| Intelligence Scheduler | 15, 16, 17, 19 |
| Analysis Cadence Engine | 15, 16, 17, 19 |
| AgentSchedule versionado | 16, 17, 19 |
| Agenda da Inteligência | 17 |
| Event-driven agents | 15, 16 |
| Scheduled/batch analyses | 15, 16 |
| On-demand analyses | 15, 16, 17 |
| Condition-triggered analyses | 15, 16 |
| Periodic health checks | 15, 16, 19 |
| Deadlines de análise | 16, 17, 19 |
| Data freshness | 16, 17, 19 |
| Dependências/DAG de análises | 16, 19 |
| Quiet hours | 16, 17, 19 |
| Prioridades de execução | 16, 17, 19 |
| Custo previsto por agenda | 16, 17, 19 |
| Otimização de cadência pelo Agente Mestre | 15, 16, 19 |
| AI Gateway | 15, 19 |
| Model Router | 15, 19 |
| LLM Necessity Policy | 15, 19 |
| Cache de respostas de IA | 15, 19 |
| Fallback de modelo | 15, 19 |
| Métrica de uso evitado de LLM | 15, 19 |
| LLM only when needed | transversal |
| Agente não é sinônimo de LLM | transversal |
| Strategy como entidade | 10, 14, 17, 19 |
| Strategy Workspace | 10, 17 |
| Cards de estratégias | 17 |
| Strategy Lifecycle | 10, 14, 17, 19 |
| Pausa e reativação de estratégias | 10, 17, 19 |
| Hipótese estratégica | 10, 14 |
| Strategy Outcome Tracking | 10, 14, 17, 19 |
| Contribuição de agentes por estratégia | 10, 14, 15, 17, 19 |
| Relação Strategy → Product | 10, 14, 17 |
| Relação Strategy → Campaign | 10, 14, 17 |
| Relação Strategy → Post/Automation | 10, 14, 16, 17 |
| Versionamento de estratégias | 10, 14, 17, 19 |
| Decision Pattern Intelligence | 12, 14, 15, 19 |
| Decision Profile | 12, 13, 14, 15, 17, 19 |
| Perfil declarado versus observado | 14, 17 |
| Contradições do perfil | 12, 14, 17 |
| Evidências do perfil | 14, 17, 19 |
| Feedback/contestação do perfil | 14, 17, 19 |
| Uso do perfil por agentes | 13, 15, 19 |
| Governança do Decision Profile | 19 |
| Operational Supplies | 4, 5, 6, 12, 17, 19 |
| Estoque de materiais operacionais | 4, 5, 6, 17, 19 |
| Consumo por pedido | 4, 6, 14, 19 |
| Packaging Recipes | 6, 10, 17, 19 |
| Custo físico real do pedido | 6, 13, 14 |
| Forecasting de consumíveis | 5, 12, 15 |
| Ponto de reposição de consumíveis | 4, 5, 12, 17 |
| Cobertura em dias de consumíveis | 4, 12, 17 |
| Supplier Intelligence para consumíveis | 5, 15, 19 |
| Strategy → Operational Supplies | 10, 13, 17 |
| Preview de consumo por estratégia | 10, 13, 17 |
| Alertas de ruptura de consumíveis | 12, 13, 17 |
| Outcome de materiais operacionais | 14 |

---

# 7. Ordem resumida das fases

```text
Fase 0  — Estratégia e documentação
Fase 1  — Fundação executável e primeira vertical slice
Fase 2  — Identidade, autenticação e autorização
Fase 3  — Catálogo completo e Actionable Product Foundation
Fase 4  — Estoque e movimentações
Fase 5  — Fornecedores e compras
Fase 6  — Vendas, pedidos e canais
Fase 7  — Clientes, CX e relacionamento
Fase 8  — Financeiro, custos, preços e margem
Fase 9  — Analytics, dashboards e Actionable UI
Fase 10 — Marketing e campanhas
Fase 11 — Inteligência de mercado e competitiva
Fase 12 — Estatística, ML e inteligência profunda
Fase 13 — Decision Layer
Fase 14 — Memória Estratégica e Evidence Engine
Fase 15 — Agentes assistivos
Fase 16 — Automation Engine e orquestração nativa
Fase 17 — Interfaces e experiência do usuário
Fase 18 — Integration Platform e integrações externas
Fase 19 — Observabilidade, segurança, privacidade e confiabilidade
Fase 20 — Escalabilidade e evolução da arquitetura
Fase 21 — Produto SaaS e expansão
```

---

# 8. Dependências principais entre fases

```text
Fase 0
  ↓
Fase 1
  ↓
Fase 2
  ↓
Fases 3, 4, 5, 6, 7 e 8
  ↓
Fase 9
  ↓
Fases 10 e 11
  ↓
Fase 12
  ↓
Fase 13
  ↓
Fase 14
  ↓
Fase 15
  ↓
Fase 16
  ↓
Fase 17
  ↓
Fase 18
  ↓
Fase 19
  ↓
Fase 20
  ↓
Fase 21
```

Algumas fases podem avançar em paralelo, mas as dependências de dados devem ser respeitadas.

Exemplos:

- ML depende de dados confiáveis.
- Agentes dependem de regras, contexto e evidências.
- Actionable UI depende de Decision Layer e permissões.
- Customer Health Score depende de histórico real.
- Grafo de dependências depende de fornecedores, estoque, pedidos e clientes.
- Inteligência competitiva depende de coleta governada.
- SaaS depende de segurança, isolamento e operação madura.
- simulações financeiras dependem de transações e obrigações confiáveis.
- retirada segura depende de caixa conciliado e validação contábil.
- insights financeiros da Camada C dependem de DTOs agregados e anonimizados.
- automações em produção dependem de dry-run e aprovação da versão.
- o Automation Engine é nativo e não depende de orquestrador externo.
- ações externas do Automation Engine dependem da Integration Platform e de adapters autorizados.
- cadeias de automação dependem de correlação, causalidade e circuit breaker.
- a Integration Platform depende de identidade, isolamento de tenant, gestão de segredos e observabilidade.
- cada provider externo deve ser encapsulado por adapter próprio.
- webhooks externos dependem de validação de assinatura, idempotência e deduplicação.
- sincronizações externas dependem de checkpoints, retries, rate limits e reconciliação.
- ferramentas externas de automação só poderão ser opcionais e consumir API/webhooks públicos da Versa.
- agentes em escala dependem de orçamento e monitoramento específico de custo de IA.
- qualquer mudança na estratégia de WhatsApp depende de integração oficial e nova decisão arquitetural.
- Master Training depende do Evidence Engine e de revisão humana.
- o Agente Mestre depende de regras determinísticas e precedência explícita.
- o Agent Registry depende de identidade, autorização, versionamento e auditoria.
- a distribuição de conhecimento depende de aprovação e associação versionada.
- a visualização de prompts depende de RBAC e redação de informações sensíveis.
- a ativação de versões de agentes depende de testes, golden set e rollback.
- a Decision Safety Layer depende de regras determinísticas, histórico e trilha de auditoria.
- Preview de Impacto e Blast Radius dependem de dados confiáveis e grafo de dependências quando aplicável.
- Outcome Tracking depende de decisões e execuções correlacionadas.
- scorecards de agentes dependem de histórico de recomendações, decisões e outcomes.
- a supervisão do Agente Mestre depende de métricas objetivas e não pode se basear apenas em autoavaliação do próprio agente.
- quarentena de agentes depende de critérios explícitos, auditoria e procedimento de recuperação.
- Shadow Mode depende de execução sem efeitos colaterais.
- Replay depende de inputs/versionamento suficientes para reconstruir a execução.
- post-mortem automático depende de logs estruturados, eventos e correlation IDs.
- kill switches dependem de isolamento claro das capacidades que podem ser pausadas.
- Trust & Risk depende de dados transacionais confiáveis e não deve usar o LLM como único mecanismo de bloqueio.
- Customer Care Watch depende de histórico estruturado de incidentes e responsabilidade.
- Customer Experience Risk depende de histórico suficiente e deve declarar cobertura e confiança.
- alertas de fraude precisam medir falsos positivos e permitir revisão/remoção.
- acompanhamento prioritário não pode ser apresentado como suspeita de fraude quando sua origem for experiência anterior ruim.
- métricas de atendimento precisam medir resolução e recorrência, não apenas volume de tickets fechados.
- otimizações financeiras e comerciais devem ser avaliadas também pelo impacto de experiência quando houver efeito relevante sobre clientes.
- schedules dependem de timezone explícito por tenant.
- análises agendadas dependem de freshness e disponibilidade das fontes declaradas.
- DAGs de análise dependem de outputs versionados e contratos claros entre etapas.
- o scheduler depende de idempotência, deduplicação e controle de concorrência.
- o Agente Mestre pode sugerir cadência, mas não deve alterar agendas críticas silenciosamente.
- toda chamada externa de IA depende da LLM Necessity Policy.
- o AI Gateway deve centralizar provider, modelo, custo, cache, fallback, privacidade e observabilidade.
- lógica determinística adequada não deve ser substituída por LLM apenas por conveniência.
- análises estatísticas locais devem ser preferidas quando resolverem o problema com qualidade suficiente.
- respostas em linguagem natural podem usar LLM sobre dados estruturados preparados pelas camadas anteriores.
- Strategy Workspace depende de produtos, campanhas, eventos e Outcome Tracking para produzir histórico útil.
- Strategy não deve ser confundida com Campaign; estratégia representa hipótese/lógica e campanha representa execução.
- pausa de estratégia deve interromper novas execuções sem apagar histórico.
- reativação deve preservar versões e outcomes anteriores.
- atribuição de resultado a uma estratégia deve declarar período, versão, cobertura e limitações.
- contribuições de agentes em estratégias devem ser auditáveis.
- Decision Profile depende de decisões, overrides, outcomes e evidências suficientes.
- padrões do Decision Profile devem distinguir fato, padrão e interpretação.
- inferências do Decision Profile devem possuir confiança, período, amostra e evidence IDs.
- feedback do usuário sobre o perfil deve ser preservado e versionado.
- Decision Profile não pode usar atributos sensíveis nem produzir diagnóstico psicológico.
- Decision Profile pode personalizar explicação e UX, mas nunca remover guardrails ou ocultar alternativas relevantes.
- materiais operacionais não devem ser modelados como produtos vendáveis apenas para reutilizar código.
- a infraestrutura de movimentação pode ser compartilhada, mas regras de domínio permanecem distintas.
- consumo previsto por Packaging Recipe deve ser separado do consumo real confirmado no fulfillment.
- baixa associada a pedido deve ser idempotente para evitar consumo duplicado em retries.
- custo físico do pedido depende do custo histórico dos materiais no momento do consumo.
- forecasting de consumíveis depende de histórico de uso, previsão de pedidos e lead time.
- estratégias que exigem materiais especiais devem declarar esse consumo para o Preview de Impacto.
- materiais inativos ou descontinuados devem preservar histórico em pedidos antigos.

---

# 9. Foco atual

O foco exclusivo neste momento é:

```text
Fase 1
```

Não devemos antecipar:

- estoque completo;
- vendas;
- clientes;
- IA;
- scrapers;
- RAG;
- grafos;
- frontend complexo;
- automações;
- ML;
- integrações externas.

Antes disso, precisamos concluir:

- domínio `Product`;
- persistência transacional;
- contrato `ProductCreated`;
- outbox;
- worker;
- projeção;
- consulta;
- testes;
- documentação.

---

# 10. Regra de controle de escopo

Toda ideia nova deve passar por estas perguntas:

1. É necessária para concluir a fase atual?
2. É uma dependência real?
3. É apenas uma melhoria futura?
4. Em qual fase ela pertence?
5. Pode ser registrada sem interromper o trabalho atual?

Quando não for necessária agora:

```text
Registrar
→ classificar
→ justificar
→ adiar
→ continuar a fase atual
```

---

# 11. Critério de sucesso da Versa Platform

A Versa Platform será bem-sucedida quando conseguir unir:

```text
Operação
+ dados confiáveis
+ histórico
+ indicadores
+ contexto
+ inteligência
+ evidências
+ decisões
+ ações
+ automações
+ memória
```

O objetivo final não é apenas construir software.

O objetivo é construir uma plataforma que ajude a Versa a:

- entender o negócio;
- detectar problemas cedo;
- identificar oportunidades;
- tomar decisões melhores;
- agir com mais velocidade;
- aprender com o passado;
- preservar conhecimento;
- crescer com mais controle;
- oferecer uma experiência melhor ao cliente;
- transformar dados dispersos em inteligência útil e executável.


---

# 11. Registro de decisão — retirada do n8n do núcleo

**Data:** 2026-08-06  
**Status:** aceita

## Contexto

O planejamento inicial previa o uso de n8n para acelerar integrações e automações de uma solução menor.

A arquitetura evoluiu para uma plataforma multi-tenant, orientada a eventos, com:

- Transactional Outbox;
- workers;
- Decision Layer;
- Automation Engine;
- Agent Registry;
- auditoria;
- custos;
- permissões;
- observabilidade;
- integração com múltiplos provedores.

Nesse contexto, manter um orquestrador externo como dependência central criaria uma segunda camada de estado, segurança, auditoria e operação.

## Decisão

Retirar o n8n dos planos atuais e construir automação e integração como capacidades nativas da Versa.

```text
Automation Engine
+
Integration Platform
+
Provider Adapters
+
Workers / Queues
+
Webhooks / APIs oficiais
```

## Consequências positivas

- uma fonte de verdade para automações;
- isolamento de tenant consistente;
- auditoria central;
- segurança e permissões uniformes;
- melhor integração com eventos e decisões;
- observabilidade ponta a ponta;
- controle de custo;
- menor acoplamento operacional;
- capacidade de evoluir adapters por provedor.

## Trade-off assumido

A Versa terá de implementar capacidades que ferramentas externas já fornecem, incluindo:

- scheduler;
- retries;
- backoff;
- idempotência;
- circuit breaker;
- webhook handling;
- credential management;
- health;
- execução versionada;
- logs e auditoria.

Esse custo é aceito porque essas capacidades passam a fazer parte do produto e da governança da plataforma.

## Futuro

Ferramentas externas de automação poderão ser suportadas posteriormente através da API e dos webhooks públicos da Versa, sem serem necessárias para o funcionamento do sistema.

---

# Anexo II — Padrões Invisíveis, Canal de Atendimento e Ativos Criativos

> Este anexo complementa o Roadmap Mestre e o Anexo I.  
> Ele registra decisões de direção sobre inteligência profunda, grounding, WhatsApp, treinamento manual, alertas e galeria de produtos.  
> Os tópicos abaixo já foram distribuídos nas fases correspondentes deste roadmap.

## AII.1 Padrões invisíveis

### AII.1.1 Correlação com atraso

Detectar relações em que o efeito aparece semanas ou meses depois da causa.

Exemplos:

- atraso de fornecedor seguido por ruptura;
- ruptura seguida por carrinhos incompletos;
- carrinhos incompletos seguidos por queda de ticket;
- experiência ruim seguida por redução de recompra;
- cancelamentos posteriores associados a produtos ou fornecedores específicos.

Regras:

- a dimensão temporal deve ser explícita;
- a janela de defasagem deve ser registrada;
- correlação não deve ser apresentada como causalidade confirmada;
- a análise deve citar as evidências usadas.

### AII.1.2 Silêncio anômalo

Detectar a ausência de um padrão esperado.

Exemplos:

- cliente que deixa de comprar na cadência habitual;
- cliente que deixa de responder;
- produto que deixa de aparecer em cestas recorrentes;
- canal que deixa de gerar conversões sem evento de falha explícito.

Limite inicial:

- no WhatsApp, somente clientes com conversas importadas e histórico suficiente poderão ser avaliados;
- falta de dados não pode ser interpretada automaticamente como falta de engajamento.

### AII.1.3 Cesta perdida

Identificar combinações que deveriam aparecer juntas, mas não aparecem.

Objetivos:

- detectar cross-sell não capturado;
- encontrar complemento ausente;
- medir ticket perdido;
- sugerir bundle;
- sugerir exposição conjunta;
- gerar hipótese para campanha.

### AII.1.4 Preço tabelado versus preço praticado

Comparar:

- preço oficial;
- preço do pedido;
- preço mencionado em conversa;
- desconto registrado;
- desconto informal;
- margem esperada;
- margem real.

A extração de valores em texto livre pertence à Camada C ou a parsers específicos, mas a comparação financeira pertence à Camada A.

### AII.1.5 Deriva de tom e engajamento

Detectar mudanças graduais, como:

- respostas mais curtas;
- maior intervalo entre mensagens;
- menor iniciativa;
- mudança de sentimento;
- redução de perguntas;
- desaparecimento após uma experiência específica.

A confiança deverá considerar a cobertura real das conversas importadas.

## AII.2 Grounding da Camada C

### AII.2.1 Fontes separadas

#### Contexto estruturado

- indicadores;
- eventos;
- decisões;
- projeções;
- dados consultados via SQL.

#### Contexto de texto livre

- mensagens;
- notas;
- documentos;
- conversas importadas;
- trechos recuperados semanticamente.

### AII.2.2 Evidence Engine

Toda resposta relevante deve possuir um `evidence_id` rastreável.

A evidência deve apontar para:

- linha ou entidade estruturada;
- evento;
- indicador;
- decisão;
- documento;
- trecho;
- offset ou posição;
- versão da fonte.

Respostas sem evidência citável não serão aceitas em fluxos de decisão.

### AII.2.3 Separação física

- SQL permanece como contexto estruturado e atualizado;
- embeddings formam um índice vetorial separado;
- alteração do texto original exige reprocessamento;
- versão do embedding deve ser registrada;
- remoção da fonte deve remover ou invalidar o embedding correspondente.

### AII.2.4 Golden set

Antes da Camada C entrar em produção:

- definir perguntas com respostas conhecidas;
- medir grounding;
- medir evidência válida;
- medir alucinação;
- comparar versões de prompt;
- comparar modelos;
- manter testes de regressão.

## AII.3 Captura seletiva de conversas

A ingestão inicial será manual:

```text
selecionar cliente
→ colar conversa
→ preservar texto bruto
→ registrar origem
→ analisar
→ sugerir classificação e resposta
```

Decisões:

- não usar biblioteca não oficial para ler WhatsApp;
- não arriscar bloqueio do número comercial;
- não afirmar que o histórico importado representa toda a jornada;
- preservar o texto antes de aplicar qualquer interpretação;
- permitir embeddings retroativos no futuro.

> Schema técnico pendente. Será definido nas Fases 6 e 7.

## AII.4 Regra determinística antes de LLM

Exemplos normalmente estruturáveis:

- SKU;
- quantidade;
- cor;
- tamanho;
- confirmação de pagamento;
- endereço;
- opção de entrega.

Exemplos que podem exigir Camada C:

- reclamação vaga;
- ironia;
- sentimento ambíguo;
- pedido incompleto;
- intenção implícita;
- comparação entre várias mensagens.

Antes da arquitetura definitiva:

- classificar manualmente de 100 a 200 conversas;
- medir categorias recorrentes;
- medir cobertura de parser;
- medir necessidade real de LLM;
- avaliar custo e precisão.

## AII.5 Aba de treinamento manual

Não será fine-tuning.

Será uma interface de curadoria para:

- exemplos de classificação;
- exemplos de geração;
- categorias;
- aprovação;
- rejeição;
- edição;
- histórico;
- origem;
- auditoria.

### Categorias abertas

A categoria será uma entidade própria com:

- nome;
- slug;
- descrição;
- status;
- data;
- tenant;
- aliases;
- categoria mesclada de origem.

Deverá existir:

- normalização;
- fuzzy match;
- aviso de similaridade;
- renomeação;
- mesclagem sem migração em massa.

### Loop de aprendizado

```text
mensagem
→ exemplos semelhantes
→ categoria sugerida
→ resposta sugerida
→ revisão humana
→ edição
→ candidato de novo exemplo
→ aprovação
```

Exemplos editados não entram automaticamente na base oficial.

> Schema técnico pendente. Será definido nas Fases 13, 14 e 15.

## AII.6 Sistema de alertas

Campos conceituais:

- origem;
- categoria;
- severidade;
- tenant;
- entidade;
- evidências;
- mensagem;
- estado;
- abertura;
- última ocorrência;
- resolução;
- cooldown;
- contagem;
- canal notificado.

Política:

- `critico`: painel e Telegram;
- `alto`: painel e Telegram;
- `medio`: painel;
- `baixo`: painel.

Deduplicação:

- mesma origem e categoria não notificam repetidamente dentro do cooldown;
- mudança relevante de estado pode gerar nova notificação;
- retorno ao normal gera notificação de resolução;
- falha no Telegram não remove o alerta do painel.

> Schema técnico pendente. Será definido nas Fases 9 e 16.

## AII.7 Canal de atendimento — WhatsApp

### Decisão atual

- mensagem gerada pelo sistema;
- revisão humana;
- abertura via `wa.me`;
- envio manual;
- tracking opcional do clique;
- nenhuma leitura automática não oficial.

### Análise de conversa

- cliente existente ou novo;
- colagem manual do histórico;
- armazenamento fiel;
- classificação;
- sugestão;
- aprovação;
- possível promoção como exemplo.

### Trade-off assumido

A cobertura é seletiva.

Por isso:

- silêncio anômalo terá cobertura parcial;
- deriva de tom terá cobertura parcial;
- Customer Health Score deverá considerar a qualidade do histórico;
- recomendações deverão informar limitações.

### Ponto de virada

Quando o volume crescer:

- o fechamento migra para o site;
- eventos de navegação e pedido passam a ser capturados diretamente;
- o WhatsApp permanece como canal de relacionamento e suporte;
- integrações oficiais poderão ser avaliadas.

## AII.8 Galeria de produtos

### Objetivo

Organizar ativos visuais para Social Media e Copywriting.

### Metadados

- produto;
- destino;
- tipo de foto;
- ocasião;
- descrição;
- contexto;
- origem;
- versão;
- data;
- status;
- histórico de uso.

### Decisões

- sem análise visual por IA nesta etapa;
- sem redimensionamento no backend;
- sem compressão no backend;
- sem geração de derivados;
- Canva para redes sociais;
- iLoveIMG para imagens do site;
- versões por destino são arquivos diferentes;
- os agentes recebem apenas metadados e contexto textual.

> Schema técnico pendente. Será definido nas Fases 3 e 10.

## AII.9 Distribuição por fases

| Item | Fases |
|---|---|
| Correlação temporal defasada | 5, 6, 7, 8, 12 |
| Silêncio anômalo | 7, 12, 13 |
| Cesta perdida | 3, 6, 9, 12 |
| Preço tabelado versus praticado | 6, 8, 12, 14 |
| Deriva de tom e engajamento | 7, 12, 15 |
| Grounding e `evidence_id` | 13, 14, 15 |
| Contexto SQL e vetorial | 12, 14, 15 |
| Golden set | 14, 15, 19 |
| Importação manual de conversa | 6, 7, 15, 17 |
| Classificação regra versus LLM | 6, 7, 12, 15 |
| Aba de treinamento | 13, 14, 15, 17 |
| Alertas e Telegram | 9, 12, 13, 16, 19 |
| WhatsApp manual | 6, 7, 15, 18 |
| Galeria de produtos | 3, 10, 17 |

## AII.10 Nota de escopo

Nenhum item deste anexo altera o foco atual.

```text
Registrar
→ classificar
→ justificar
→ adiar
→ continuar a Fase 1
```

O objetivo imediato continua sendo:

```text
Product
→ domínio
→ PostgreSQL
→ Transactional Outbox
→ worker
→ read model
→ API
→ testes
```

---

# Anexo III — Inteligência Financeira Avançada

> Complementa o Roadmap Mestre, o Anexo I e o Anexo II.  
> Consolida métricas, simulações, previsões e regras de privacidade para o domínio financeiro.  
> Os itens deste anexo já foram distribuídos pelas fases correspondentes do roadmap.

## AIII.1 Métricas financeiras adicionais

### AIII.1.1 Ponto de equilíbrio

Responde quanto a empresa precisa vender para cobrir custos fixos e variáveis.

Entradas:

- custos fixos;
- custos variáveis;
- margem de contribuição;
- preço ou ticket médio;
- mix de produtos;
- período.

Saídas:

- receita mínima;
- volume mínimo;
- distância para o ponto de equilíbrio;
- comparação com realizado;
- comparação por cenário.

### AIII.1.2 Margem de contribuição real

```text
preço efetivamente praticado
- custo do produto
- desconto
- taxa de gateway
- imposto variável
- frete subsidiado
- embalagem variável
- comissão
- custo variável esperado
= margem de contribuição real
```

Deve existir por produto, variante, pedido, categoria, canal, campanha e período.

A métrica deve usar o preço praticado, inclusive quando diferente do preço tabelado.

### AIII.1.3 Ciclo de conversão de caixa

Mede o tempo entre pagar o fornecedor e receber efetivamente do cliente.

Componentes:

- prazo do fornecedor;
- dias em estoque;
- prazo de recebimento;
- recebíveis;
- capital de giro;
- impacto do crescimento.

### AIII.1.4 Burn rate segmentado

Separações:

- fixo;
- variável;
- operacional;
- marketing;
- estoque;
- tecnologia;
- logística;
- folha;
- pró-labore;
- impostos.

O objetivo é impedir que uma média única esconda a origem do gasto.

### AIII.1.5 Projeção de caixa por cenários

Cenários iniciais:

- vendas param;
- vendas se mantêm;
- vendas crescem;
- vendas caem;
- cenário personalizado.

Cada cenário deve mostrar:

- saldo mês a mês;
- runway;
- menor saldo;
- mês de ruptura;
- primeiro mês abaixo da reserva;
- diferença acumulada;
- premissas;
- confiança.

### AIII.1.6 Capital imobilizado em estoque

Indicadores:

- capital pelo custo;
- custo de reposição;
- valor de venda atual;
- valor estimado de liquidação;
- perda sazonal;
- capital parado;
- custo de oportunidade;
- potencial de recuperação.

Estoque contabilizado como ativo não deve ser tratado como caixa disponível.

### AIII.1.7 CAC versus LTV

#### CAC

Deve declarar:

- período;
- canal;
- campanha;
- modelo de atribuição;
- custos incluídos;
- clientes realmente novos.

#### LTV

Deve declarar:

- receita ou margem;
- horizonte;
- cohort;
- devoluções;
- custo de servir;
- realizado ou projetado;
- confiança.

Comparações devem usar premissas compatíveis.

### AIII.1.8 Orçado versus realizado

Dimensões:

- receita;
- custo;
- frete;
- taxas;
- marketing;
- despesas;
- pró-labore;
- impostos;
- compras;
- margem;
- saldo;
- runway.

Cada comparação deve preservar:

- previsto;
- realizado;
- diferença absoluta;
- diferença percentual;
- hipótese;
- decisão;
- explicação;
- aprendizado.

### AIII.1.9 Obrigações fiscais

Campos conceituais:

- tipo;
- competência;
- vencimento;
- valor esperado;
- valor realizado;
- status;
- fonte;
- confirmação contábil;
- pagamento;
- documento.

Alertas:

- vencimento próximo;
- vence hoje;
- atrasada;
- valor divergente;
- paga;
- resolvida.

Datas não serão rigidamente codificadas.

### AIII.1.10 Health score financeiro

Componentes possíveis:

- runway;
- margem;
- ciclo de caixa;
- capital imobilizado;
- inadimplência;
- obrigações;
- risco da previsão.

O score deverá mostrar:

- valor consolidado;
- componentes;
- pesos;
- versão;
- evidências;
- fatores positivos;
- riscos;
- histórico.

## AIII.2 Pró-labore e retirada de lucros

### AIII.2.1 Distinção conceitual

- pró-labore remunera o trabalho;
- integra o custo operacional;
- distribuição de lucros é variável;
- lucro contábil não equivale a caixa;
- caixa excedente não implica autorização automática de retirada.

### AIII.2.2 Reserva mínima

Política inicial:

```text
reserve_target_months = 3
```

A quantidade de meses será:

- configurável por tenant;
- versionada;
- datada;
- justificada;
- usada nas simulações.

### AIII.2.3 Limite gerencial de retirada

```text
caixa disponível
- reserva mínima
- obrigações de curto prazo
- impostos provisionados
- fornecedores a pagar
- reposições comprometidas
- retiradas aprovadas
= limite gerencial
```

Não entram como caixa disponível:

- recebíveis não liquidados;
- estoque;
- vendas projetadas;
- limite de crédito;
- lucro ainda não convertido em caixa;
- valores com destinação específica.

O resultado é gerencial e deve passar por validação contábil e tributária antes da execução.

### AIII.2.4 Estados

```text
simulado
→ aguardando validação contábil
→ aprovado
→ executado
```

## AIII.3 Simulação de pró-labore

### Entradas

- valor atual;
- valor proposto;
- caixa;
- burn rate;
- receita prevista;
- recebimentos;
- obrigações;
- horizonte;
- reserva;
- cenário.

### Saídas

- saldo mensal;
- runway;
- menor saldo;
- mês de ruptura;
- primeiro mês abaixo da reserva;
- diferença acumulada;
- risco;
- premissas.

As simulações devem ser persistidas para futura comparação com o realizado.

> Fórmula e schema técnico pendentes. Serão definidos na Fase 8.

## AIII.4 Previsão híbrida de receita

### Princípio

A previsão automática permanece visível. O ajuste manual, quando existir, prevalece somente como valor efetivo.

```text
automatic_value
manual_value
effective_value
```

### Campos conceituais

- período;
- valor automático;
- fonte;
- valor manual;
- justificativa;
- valor efetivo;
- confiança;
- modelo;
- sazonalidade;
- autor;
- datas.

### Ciclo

```text
automático
→ ajuste manual
→ cenário
→ execução
→ realizado
→ comparação
→ aprendizado
```

## AIII.5 Sazonalidade de referência

Referências iniciais podem incluir:

- Dia das Mães;
- Dia dos Namorados;
- troca de coleção;
- Black Friday;
- Natal.

Cada índice deverá ter:

- fonte;
- segmento;
- versão;
- período;
- confiança;
- data;
- possibilidade de substituição pelo histórico próprio.

Não inclui feed de mercado em tempo real nesta etapa.

## AIII.6 Anonimização para a Camada C

### Princípio

O LLM não receberá transações brutas nem entidades completas.

Receberá apenas métricas agregadas por um DTO permitido.

```typescript
interface FinancialInsightContext {
  period: string;
  revenueChangePercent: number;
  contributionMarginPercent: number;
  runwayMonths: number;
  inventoryCapitalRatio: number;
  financialHealthScore: number;
  riskLabels: string[];
}
```

### Regras

- allowlist;
- minimização;
- agregação;
- supressão de grupos pequenos;
- arredondamento;
- ausência de nomes;
- ausência de documentos;
- ausência de endereços;
- ausência de IDs;
- ausência de clientes;
- ausência de pedidos;
- ausência de empresa identificável;
- validação antes do envio;
- registro do DTO;
- `evidence_id`;
- política de retenção.

Não será usada comparação simples de strings como mecanismo principal de anonimização.

## AIII.7 Distribuição por fases

| Item | Fases |
|---|---|
| Ponto de equilíbrio | 8, 9 |
| Margem de contribuição real | 6, 8, 9 |
| Ciclo de conversão de caixa | 5, 6, 8, 12 |
| Burn rate segmentado | 8, 9 |
| Cenários de caixa | 8, 12 |
| Capital imobilizado | 4, 8, 9, 12 |
| CAC versus LTV | 7, 8, 9, 10, 12 |
| Orçado versus realizado | 8, 9, 13, 14 |
| Obrigações fiscais | 8, 9, 16, 19 |
| Health score financeiro | 8, 9, 12, 13 |
| Pró-labore | 8 |
| Retirada segura | 8, 13 |
| Simulação de pró-labore | 8, 12 |
| Previsão híbrida | 8, 12 |
| Sazonalidade | 8, 11, 12 |
| DTO anonimizado | 8, 14, 15, 19 |
| Validação contábil | 8, 13, 19 |

## AIII.8 Nota de escopo

Nenhum item deste anexo altera o foco atual.

```text
Registrar
→ classificar
→ justificar
→ adiar
→ continuar a Fase 1
```

O objetivo imediato permanece:

```text
Product
→ domínio
→ PostgreSQL
→ Transactional Outbox
→ worker
→ read model
→ API
→ testes
```

---

# Anexo IV — Segurança de Automação, Custo de IA e Nota de Integração

> Complementa o Roadmap Mestre e os Anexos I, II e III.  
> Consolida decisões de segurança para automações, observabilidade financeira de IA e a referência vigente para o canal WhatsApp.  
> Os itens deste anexo já foram distribuídos pelas fases correspondentes.

## AIV.1 Segurança de automação

### AIV.1.1 Dry-run

Toda automação deverá poder ser executada contra dados históricos sem realizar ações reais.

Entrada:

- regra;
- versão;
- condição;
- ação;
- intervalo histórico;
- tenant;
- filtros;
- limites.

Saída:

- eventos analisados;
- eventos que disparariam;
- motivo;
- ações simuladas;
- entidades afetadas;
- duplicidades;
- quantidade;
- alertas;
- custo estimado;
- falhas;
- usuário;
- data.

### AIV.1.2 Ausência de efeitos colaterais

Durante a simulação, não será permitido:

- enviar mensagens;
- alterar pedidos;
- atualizar preços;
- criar tarefas reais;
- registrar pagamentos;
- chamar sistemas externos;
- publicar eventos reais;
- consumir orçamento;
- executar ação irreversível.

A proteção deve existir também nos adaptadores de infraestrutura.

### AIV.1.3 Aprovação por versão

```text
rascunho
→ simulação
→ revisão
→ aprovado
→ ativo
→ pausado
→ arquivado
```

Regras:

- aprovação vinculada à versão;
- alteração relevante exige nova simulação;
- alteração relevante exige nova aprovação;
- histórico preservado;
- rollback somente para versão conhecida.

### AIV.1.4 Rastreamento de cadeia

Campos:

- `correlation_id`;
- `causation_id`;
- `automation_chain_id`;
- `chain_depth`;
- `origin_automation_id`;
- `origin_event_id`;
- `tenant_id`.

### AIV.1.5 Proteções contra cascata

- profundidade máxima;
- limite de ações por cadeia;
- limite por período;
- limite por entidade;
- limite por tenant;
- cooldown;
- idempotência;
- detecção de repetição;
- detecção de ciclo;
- pausa automática;
- bloqueio manual;
- recuperação controlada.

### AIV.1.6 Circuit breaker

Estados:

```text
closed
→ open
→ half_open
→ closed
```

Ao abrir o circuito, registrar:

- automação;
- cadeia;
- profundidade;
- eventos;
- entidades;
- ações executadas;
- ações bloqueadas;
- motivo;
- horário;
- alerta.

Cascatas serão classificadas inicialmente como `alto` ou `critico`.

## AIV.2 Monitoramento de custo de IA e LLM

### AIV.2.0 Princípio de uso seletivo

A Versa não utilizará LLM como executor universal.

```text
determinístico
→ estatístico / ML
→ LLM somente quando necessário
```

Toda chamada externa deverá passar pelo AI Gateway e pela LLM Necessity Policy.

### AIV.2.1 Dimensões

- tenant;
- agente;
- funcionalidade;
- categoria;
- provedor;
- modelo;
- chamada;
- usuário;
- automação;
- decisão;
- ambiente;
- período;
- tokens de entrada;
- tokens de saída;
- tokens em cache;
- moeda;
- tabela de preços;
- versão do preço;
- custo estimado;
- custo faturado;
- motivo da chamada;
- resultado da Necessity Policy;
- cache;
- fallback;
- resolução sem LLM;
- schedule;
- execução de análise.

### AIV.2.2 Estimado versus faturado

```text
estimated_cost
billed_cost
```

Preservar:

- `pricing_version`;
- `pricing_effective_at`;
- preço aplicado;
- moeda;
- tokens;
- cache;
- descontos;
- origem;
- data.

### AIV.2.3 Orçamentos

Podem existir:

- por tenant;
- por agente;
- por funcionalidade;
- por categoria;
- por modelo;
- por provedor;
- por dia;
- por mês;
- globalmente.

Tipos:

```text
soft_limit
hard_limit
```

Faixas iniciais configuráveis:

- 70%: aviso;
- 85%: alerta alto;
- 100%: bloqueio, aprovação ou degradação.

### AIV.2.3.1 Métrica de uso evitado

Além do custo das chamadas realizadas, medir:

- execuções resolvidas sem LLM;
- chamadas evitadas;
- economia estimada;
- cache hits;
- fallback para lógica local;
- custo evitado por agente;
- custo evitado por tenant.

### AIV.2.4 Degradação controlada

Possibilidades:

- modelo mais barato;
- contexto reduzido;
- cache;
- regra determinística;
- resposta simplificada;
- aprovação humana;
- pausa de agente;
- bloqueio de uso não essencial.

A degradação nunca deve ser silenciosa.

### AIV.2.5 Custo versus valor

- custo por sugestão;
- custo por resposta aprovada;
- custo por campanha;
- custo por decisão;
- custo por automação;
- custo por cliente recuperado;
- custo por receita atribuída;
- economia de tempo estimada.

### AIV.2.6 Integração financeira

O custo de IA alimentará:

- burn rate;
- orçado versus realizado;
- projeção de caixa;
- health score financeiro;
- orçamento de tecnologia;
- análise de retorno dos agentes.

## AIV.3 Nota de referência — WhatsApp

### AIV.3.1 Decisão vigente

Envio:

```text
texto gerado
→ revisão humana
→ wa.me
→ envio manual
```

Análise:

```text
conversa selecionada
→ colagem manual
→ armazenamento fiel
→ análise
→ sugestão
```

### AIV.3.2 Fora do escopo atual

- Baileys;
- leitura automática não oficial;
- scraping;
- automação de sessão do WhatsApp Web;
- soluções com risco de bloqueio do número.

### AIV.3.3 Possível revisão futura

Uma integração oficial poderá ser avaliada quando houver:

- necessidade comprovada;
- volume;
- orçamento;
- consentimento;
- privacidade;
- solução oficial;
- análise de custo e benefício;
- nova decisão arquitetural.

## AIV.4 Distribuição por fases

| Item | Fases |
|---|---|
| Dry-run | 16 |
| Aprovação por versão | 16 |
| Simulação sem efeitos colaterais | 16, 19 |
| Correlation e causation IDs | 1, 16, 19 |
| Limite de profundidade | 16 |
| Detecção de ciclos | 16 |
| Circuit breaker | 16, 19 |
| Alertas de cascata | 16, 19 |
| Custo por agente | 15, 19 |
| Custo por modelo e provedor | 15, 19 |
| Tokens e cache | 15, 19 |
| Orçamento de IA | 8, 16, 19 |
| Soft e hard limits | 16, 19 |
| Estimado versus faturado | 8, 19 |
| Custo no burn rate | 8, 9, 19 |
| Custo versus valor | 9, 13, 19 |
| Referência WhatsApp | 18 |
| Integração oficial futura | 18, 19 |

## AIV.5 Nota de escopo

Nenhum item deste anexo altera o foco atual.

```text
Registrar
→ classificar
→ justificar
→ adiar
→ continuar a Fase 1
```

O objetivo imediato permanece:

```text
Product
→ domínio
→ PostgreSQL
→ Transactional Outbox
→ worker
→ read model
→ API
→ testes
```

---

# Anexo V — Ingestão Estratégica, Agente Mestre e Agent Registry

> Complementa o Roadmap Mestre e os Anexos I, II, III e IV.  
> Documenta a ingestão de conhecimento externo pelo usuário, o papel do Agente Mestre e a interface de transparência e controle dos agentes.  
> Os itens deste anexo já foram distribuídos pelas Fases 13, 14, 15, 16, 17 e 19.

## AV.1 Ingestão Estratégica e Agente Mestre

A plataforma poderá receber conhecimento externo em texto livre, incluindo:

- cursos;
- mentorias;
- metodologias;
- estratégias;
- teses;
- aprendizados;
- frameworks;
- práticas operacionais.

O usuário atuará como tutor, mas o conteúdo não será promovido diretamente para produção.

## AV.1.1 Papel do Agente Mestre

O Agente Mestre será um treinador e orquestrador pedagógico.

Responsabilidades:

- interpretar a dissertação;
- identificar a tese;
- organizar o conteúdo;
- avaliar viabilidade estrutural;
- comparar com regras determinísticas;
- detectar riscos;
- apontar conflitos;
- propor diretriz estruturada;
- sugerir agentes afetados;
- explicar seu entendimento;
- preparar a revisão humana.

O Agente Mestre não poderá:

- executar ações operacionais;
- modificar preços;
- enviar mensagens;
- lançar campanhas;
- conceder permissões;
- alterar guardrails;
- ativar diretrizes sozinho;
- alterar prompts ativos diretamente;
- ignorar limites financeiros;
- remover regras sistêmicas.

## AV.1.2 Fluxo de aprendizado — Master Training

```text
usuário insere texto livre
→ conteúdo original é preservado
→ Agente Mestre interpreta
→ regras determinísticas são consultadas
→ conflitos são identificados
→ diretriz estruturada é proposta
→ usuário revisa
→ golden set e testes são executados
→ usuário aprova
→ conteúdo é versionado e vetorizado
→ agentes autorizados recebem associações
→ uso é auditado
```

## AV.1.3 Estados do conhecimento

```text
draft
→ analyzed
→ pending_review
→ approved
→ active
→ superseded
→ archived
```

Estado adicional:

```text
blocked
```

Uma diretriz poderá ser bloqueada quando:

- violar regra obrigatória;
- reduzir margem abaixo do mínimo;
- contradizer política legal;
- violar privacidade;
- ultrapassar limite financeiro;
- tentar remover guardrail;
- não possuir evidência suficiente.

## AV.1.4 Ordem de precedência

```text
1. Segurança e isolamento de tenant
2. Regras legais, privacidade e permissões
3. Invariantes determinísticas do negócio
4. Políticas aprovadas da empresa
5. Diretrizes aprovadas do Agente Mestre
6. Exemplos de treinamento
7. Contexto temporário da solicitação
```

Conhecimento externo nunca poderá substituir proteções de nível superior.

## AV.1.5 Preservação da fonte

O sistema armazenará separadamente:

- texto original;
- autor;
- origem;
- título;
- data da fonte;
- data da ingestão;
- tenant;
- hash;
- interpretação;
- diretriz;
- conflitos;
- decisão;
- versão;
- agentes afetados.

A interpretação não substituirá o texto original.

## AV.1.6 Evidência e proveniência

Campos conceituais:

```text
evidence_id
source_type
source_title
source_author
source_date
ingested_by
original_content
content_hash
created_at
version
```

Quando um agente utilizar uma diretriz, deverá citar:

- título;
- versão;
- origem;
- data de aprovação;
- `evidence_id`.

## AV.1.7 Vetorização e recuperação

Ensinar significa:

```text
armazenar
→ estruturar
→ indexar
→ autorizar
→ recuperar
```

Não significa necessariamente:

- fine-tuning;
- alteração dos pesos do modelo;
- conhecimento permanente no prompt;
- duplicação para cada agente.

Estrutura:

```text
Knowledge Item
→ Knowledge Version
→ Agent Knowledge Assignment
→ recuperação em tempo de execução
```

## AV.1.8 Distribuição segura

O Agente Mestre poderá sugerir os agentes afetados.

A distribuição efetiva exigirá:

- revisão humana;
- validação de permissões;
- versão aprovada;
- escopo;
- validade;
- prioridade;
- registro de conflitos;
- auditoria.

```text
Agente Mestre sugere
→ humano revisa
→ sistema valida
→ associação é versionada
→ diretriz entra em vigor
```

## AV.2 Agent Registry e Control Plane

Os agentes serão entidades gerenciáveis, versionadas e auditáveis.

## AV.2.1 Entidade Agent

Configurações gerenciáveis:

- nome;
- descrição;
- objetivo;
- escopo;
- responsável;
- status;
- provedor;
- modelo;
- prompt específico;
- temperatura;
- ferramentas;
- fontes;
- coleções vetoriais;
- orçamento;
- limites;
- fallback.

## AV.2.2 Agent Version

```text
Agent
└── Agent Version
    ├── prompt
    ├── modelo
    ├── ferramentas
    ├── conhecimentos
    ├── fontes
    ├── limites
    └── avaliações
```

Estados:

```text
draft
→ testing
→ approved
→ active
→ deprecated
→ archived
```

Alterar prompt, modelo, ferramentas, fontes ou conhecimento cria uma nova versão.

## AV.2.3 Guardrails imutáveis

Continuarão protegidos pela aplicação:

- isolamento de tenant;
- autorização;
- anonimização;
- validação de ferramentas;
- exigência de evidências;
- limites financeiros;
- políticas legais;
- auditoria;
- proibição de ações críticas não autorizadas.

Essas proteções não poderão ser removidas por edição no banco.

## AV.2.4 Painel Geral

Cards poderão apresentar:

- avatar;
- nome;
- objetivo;
- status;
- versão ativa;
- modelo;
- sugestões recentes;
- ações recentes;
- custo no período;
- alertas;
- itens em treinamento.

## AV.2.5 Visão Expandida

### Identidade e escopo

- objetivo;
- limites;
- responsável;
- versão;
- ações permitidas;
- ações proibidas.

### Runtime

- provedor;
- modelo;
- temperatura;
- fallback;
- status;
- limites.

### Conhecimento

- diretrizes;
- fontes;
- evidências;
- árvore de conhecimento;
- última atualização;
- itens pendentes.

### Dados e ferramentas

- tabelas autorizadas;
- read models;
- coleções vetoriais;
- ferramentas;
- integrações.

### Governança

- orçamento;
- tokens;
- custo;
- avaliações;
- incidentes;
- rollout;
- rollback.

### Histórico

- recomendações;
- rascunhos;
- decisões;
- aprovações;
- recusas;
- versões;
- conhecimento utilizado.

## AV.2.6 Transparência e RBAC

```text
usuário operacional
→ objetivo e limites resumidos

gestor autorizado
→ configurações funcionais

administrador técnico
→ prompt estrutural versionado
```

Nunca serão exibidos:

- segredos;
- credenciais;
- tokens;
- informações de outros tenants;
- detalhes que permitam contornar proteções.

A interface poderá mostrar uma versão redigida.

## AV.2.7 Testes e publicação

Antes de ativar uma versão:

- golden set;
- teste de conflitos;
- teste de evidência;
- teste de isolamento;
- teste de limites;
- teste de custo;
- comparação com versão anterior;
- aprovação;
- rollout gradual;
- plano de rollback.

## AV.3 Distribuição por fases

| Item | Fases |
|---|---|
| Master Training | 14, 17 |
| Conteúdo original | 14 |
| Estruturação de diretrizes | 13, 14 |
| Evidence ID e proveniência | 14 |
| Vetorização e recuperação | 14 |
| Regras de precedência | 13, 14, 19 |
| Agente Mestre | 15 |
| Sugestão de agentes afetados | 15 |
| Distribuição aprovada | 13, 15, 16 |
| Entidade Agent | 15 |
| Agent Version | 15, 19 |
| Agent Knowledge Assignment | 14, 15 |
| Agent Registry | 17 |
| Deep Dive do agente | 17, 19 |
| RBAC de prompts | 2, 17, 19 |
| Guardrails imutáveis | 15, 19 |
| Golden set | 15, 19 |
| Rollout e rollback | 15, 19 |
| Custos por agente | 15, 19 |

## AV.4 Nota de escopo

Nenhum item deste anexo altera o foco atual.

```text
Registrar no Anexo V
→ classificar nas fases correspondentes
→ manter foco
→ continuar a Fase 1
```

O objetivo imediato permanece:

```text
Catalog
→ Product
→ ProductCreated
→ PostgreSQL
→ Transactional Outbox
→ worker
→ read model
→ API
→ testes
```

---

# Anexo VI — Transparência Operacional, Decision Safety e Governança de Agentes

> Complementa o Roadmap Mestre e os Anexos I, II, III, IV e V.  
> Documenta a transparência operacional, prevenção de ações de alto risco, avaliação de resultados, supervisão da frota de agentes e mecanismos de diagnóstico e recuperação.  
> Os itens deste anexo foram distribuídos principalmente pelas Fases 1, 13, 14, 15, 16, 17 e 19.

## AVI.1 Transparência operacional

A Versa deverá permitir que desenvolvedores e gestores reconstruam o que aconteceu “por baixo dos panos” sem depender de leitura manual de logs crus.

### AVI.1.1 System Timeline

```text
HTTP
→ Application
→ Domain
→ Database
→ Outbox
→ Worker
→ Agent / Automation / Integration
→ Result
```

Cada execução deverá ser correlacionável por identificadores como:

- `correlation_id`;
- `causation_id`;
- `execution_id`;
- `event_id`;
- `automation_chain_id`;
- `agent_execution_id`.

### AVI.1.2 Logs técnicos e logs de negócio

Logs técnicos serão estruturados para máquina.

Logs de negócio serão apresentados em linguagem operacional.

```text
database.transaction.committed
```

poderá se relacionar com:

```text
Produto criado com sucesso
```

### AVI.1.3 Analysis History

Cada análise deverá registrar:

- agente;
- versão;
- contexto autorizado;
- regras;
- evidências;
- diretrizes;
- modelo;
- custo;
- duração;
- recomendação;
- confiança;
- decisão humana;
- outcome.

A plataforma não dependerá da exposição de chain-of-thought bruto. A explicação auditável será composta por fatos, evidências, regras, hipóteses declaradas, conclusões e limitações.

### AVI.1.4 Agent Inspector

A execução de um agente poderá ser vista por etapas:

```text
Trigger
→ Context Retrieval
→ Evidence Lookup
→ Deterministic Rules
→ Model Call
→ Structured Response
→ Validation
→ Recommendation
```

### AVI.1.5 Modo Desenvolvedor

A interface técnica poderá mostrar:

- payloads redigidos;
- eventos;
- outbox;
- queries;
- tempos;
- retries;
- filas;
- worker;
- versões;
- custos;
- circuit breakers;
- traces.

## AVI.2 Decision Safety Layer

Toda ação relevante será classificada antes da execução.

```text
Intenção
→ Authorization
→ Safety Evaluation
→ Impact Preview
→ Confirmation / Block
→ Execution
→ Audit
→ Outcome
```

### AVI.2.1 Exemplos

- pró-labore alterado abruptamente para zero;
- preço reduzido para valor incompatível com custo;
- campanha com orçamento muito acima do histórico;
- retirada que ameaça reserva mínima;
- automação com raio de impacto inesperado;
- mudança de diretriz que afeta múltiplos agentes.

### AVI.2.2 Níveis

```text
normal
attention
high_risk
forbidden
```

### AVI.2.3 Justificativa opcional

O usuário poderá justificar um override permitido, mas a justificativa não será obrigatória.

Se informada, será armazenada junto da decisão e de seu contexto.

Ela não altera automaticamente políticas ou guardrails.

### AVI.2.4 Preview de Impacto e Blast Radius

Antes de executar ações relevantes, a plataforma deverá mostrar consequências estimadas e dependências afetadas.

### AVI.2.5 Memória de exceções

Exceções legítimas poderão ser criadas com escopo e validade explícitos.

Nenhuma justificativa será convertida silenciosamente em permissão permanente.

## AVI.3 Shadow Mode e Replay

### AVI.3.1 Shadow Mode

Novas versões de agentes e automações poderão executar em paralelo sem produzir efeitos reais.

Objetivo:

- comparar comportamento;
- detectar regressão;
- medir custo;
- avaliar grounding;
- medir divergência;
- observar outcomes.

### AVI.3.2 Replay

Execuções históricas poderão ser reproduzidas em sandbox com:

- mesma entrada;
- versão original;
- versão candidata;
- regras escolhidas;
- dados históricos permitidos;
- ausência de efeitos colaterais.

## AVI.4 Simulação histórica de políticas

Políticas relevantes poderão ser testadas contra histórico antes da ativação.

Saída esperada:

- operações analisadas;
- operações afetadas;
- alertas;
- bloqueios;
- falsos positivos identificáveis;
- custo;
- impacto;
- limitações.

## AVI.5 Outcome Tracking

A qualidade da plataforma será medida também pelo que aconteceu depois.

```text
sugestão
→ decisão
→ ação
→ resultado
→ comparação
→ aprendizado
```

Outcomes poderão ser financeiros, operacionais, comerciais, de CX, de custo ou de segurança.

## AVI.6 Decision Scorecard

Agentes poderão ser avaliados por:

- taxa de aceitação;
- taxa de rejeição;
- taxa de edição;
- grounding;
- evidências válidas;
- outcomes positivos;
- outcomes negativos;
- previsto versus realizado;
- custo;
- latência;
- erros;
- retries;
- incidentes;
- regressões.

## AVI.7 Agente Mestre como supervisor de qualidade

Além de treinador e orquestrador, o Agente Mestre acompanhará a saúde dos especialistas.

### AVI.7.1 Sinais de degradação

- quase todas as sugestões recusadas;
- correções humanas recorrentes;
- outcomes negativos em sequência;
- queda de grounding;
- aumento de custo;
- aumento de erros;
- drift;
- regressão após nova versão;
- comportamento fora do escopo.

### AVI.7.2 Diagnóstico

O Agente Mestre poderá sugerir que o problema esteja em:

- prompt;
- modelo;
- temperatura;
- ferramenta;
- conhecimento;
- fonte;
- permissão;
- limite;
- orçamento;
- contexto;
- escopo;
- fallback.

### AVI.7.3 Intervenções recomendáveis

- ajustar configuração;
- gerar nova versão;
- executar golden set;
- entrar em Shadow Mode;
- reduzir autonomia;
- trocar fallback;
- fazer rollback;
- pausar;
- colocar em quarentena.

O Agente Mestre propõe e explica. Mudanças estruturais críticas e retorno à produção obedecem às políticas de aprovação da plataforma.

## AVI.8 Quarentena de agentes

Estados operacionais:

```text
active
degraded
shadow
quarantined
disabled
```

Um agente em `quarantined`:

- não executa ações produtivas;
- não participa de automações produtivas;
- pode continuar disponível para diagnóstico;
- pode ser submetido a replay;
- pode executar golden set;
- pode executar em shadow quando autorizado.

Retorno à produção exige:

- causa investigada;
- correção;
- testes;
- comparação;
- critérios de saída satisfeitos;
- aprovação conforme risco;
- auditoria.

## AVI.9 Diff semântico

Mudanças de versão deverão ser apresentadas também em termos de efeito operacional, não apenas diferença textual.

## AVI.10 Kill Switches

A plataforma deverá permitir pausa seletiva de:

- agentes;
- automações;
- integrações;
- campanhas;
- tipos de ação;
- filas;
- tipos de evento.

## AVI.11 Inbox de Exceções

Central operacional para:

- decisões arriscadas;
- agentes degradados;
- agentes em quarentena;
- integrações com falha;
- automações pausadas;
- dead letters;
- retries excessivos;
- aprovações pendentes;
- incidentes.

## AVI.12 Post-mortem automático

Incidentes relevantes terão uma reconstrução inicial automática contendo cronologia, componentes, IDs de correlação, retries, circuit breakers, impacto e estado atual.

## AVI.13 Distribuição por fases

| Item | Fases |
|---|---|
| Observabilidade mínima | 1 |
| Structured Logging | 1, 19 |
| System Timeline | 1, 17, 19 |
| Analysis History | 14, 15, 17, 19 |
| Agent Inspector | 15, 17, 19 |
| Developer Mode | 1, 17, 19 |
| Decision Safety Layer | 13, 17, 19 |
| Preview de Impacto | 13, 17 |
| Blast Radius | 13, 15, 16, 17 |
| Override e justificativa | 13, 14, 17 |
| Memória de exceções | 13, 14, 19 |
| Outcome Tracking | 13, 14, 15, 19 |
| Decision Scorecard | 15, 17, 19 |
| Shadow Mode | 15, 16, 19 |
| Replay em sandbox | 15, 16, 17, 19 |
| Simulador de políticas | 13, 16, 19 |
| Diff semântico | 15, 17, 19 |
| Supervisão do Agente Mestre | 15, 19 |
| Quarentena de agentes | 15, 17, 19 |
| Kill Switches | 16, 17, 19 |
| Inbox de Exceções | 16, 17, 19 |
| Post-mortem automático | 16, 17, 19 |

## AVI.14 Nota de escopo

A única antecipação imediata é a fundação mínima de observabilidade da Fase 1.

```text
logs estruturados
→ correlation_id
→ causation_id
→ execution context
→ timings
```

As interfaces, scorecards, supervisão de agentes, Shadow Mode, Replay, Safety Layer completa e mecanismos de quarentena permanecem nas fases planejadas.

O foco funcional atual continua sendo:

```text
Product
→ PostgreSQL
→ Transactional Outbox
→ Worker
→ Projection
→ API
→ testes
```

---

# Anexo VII — Customer Trust, Care e Experience Intelligence

> Complementa o Roadmap Mestre e os Anexos I, II, III, IV, V e VI.  
> Consolida o princípio de prioridade máxima ao cliente e à qualidade de atendimento, o Customer Care Watch e a inteligência de risco transacional.  
> Os itens foram distribuídos principalmente pelas Fases 6, 7, 12, 13, 14, 15, 17 e 19.

## AVII.1 Princípio máximo

A Versa deve crescer sem sacrificar confiança.

```text
segurança / legalidade
→ confiança e experiência do cliente
→ saúde sustentável da empresa
→ receita e eficiência
```

Isso não elimina disciplina financeira. Impede que uma otimização local seja tratada como sucesso quando destrói relacionamento.

## AVII.2 Customer Incident History

Ocorrências devem registrar:

- cliente;
- pedido;
- tipo;
- severidade;
- origem;
- descrição;
- responsabilidade;
- resolução;
- outcome;
- recorrência;
- timestamp.

Responsabilidade deverá distinguir:

```text
company
customer
carrier
supplier
payment_provider
unknown
```

## AVII.3 Customer Care Watch

Objetivo:

> detectar clientes que merecem acompanhamento mais próximo para impedir repetição de uma experiência ruim.

Fluxo:

```text
nova compra
→ histórico
→ risco de recorrência
→ ações preventivas
→ acompanhamento
→ entrega
→ follow-up
→ outcome
```

Níveis:

```text
normal
attention
priority_follow_up
critical_review
```

Uma marcação de acompanhamento não implica suspeita de fraude.

## AVII.4 Recuperação de Confiança

A plataforma acompanhará, quando possível:

- resolução;
- reabertura;
- satisfação posterior;
- recompra;
- experiência na compra seguinte;
- repetição do problema;
- tempo até recuperação;
- confiança restaurada.

## AVII.5 Customer Experience Risk

Pergunta central:

> Qual o risco de a própria operação decepcionar novamente este cliente?

Sinais possíveis:

- incidentes recentes;
- recorrência;
- atraso;
- produto defeituoso;
- atendimento reaberto;
- falha de transportadora;
- problema de fornecedor;
- histórico de resolução incompleta;
- sentimento negativo;
- experiência ruim após recompra.

## AVII.6 Trust & Risk Intelligence

Possíveis tentativas de golpe serão analisadas como risco probabilístico e explicável.

Sinais poderão incluir:

- tentativas múltiplas de pagamento;
- métodos de pagamento diferentes em curto período;
- chargebacks;
- pedidos repetidos/cancelados;
- divergências operacionais;
- padrão anormal de compra;
- sequência de pedidos incomum;
- sinais técnicos permitidos de relacionamento entre transações.

Estrutura:

```text
RiskCase
├── signals
├── score
├── confidence
├── recommendation
├── human_review
├── final_outcome
└── false_positive
```

## AVII.7 Proteções contra erro e discriminação

O sistema não deverá:

- transformar score em acusação;
- usar atributos sensíveis;
- usar proxies discriminatórios;
- bloquear com base exclusiva em uma inferência de LLM;
- manter marcação de risco indefinidamente;
- confundir reclamação recorrente com má-fé;
- punir o cliente por falhas da própria empresa.

## AVII.8 Trust & Risk Agent

O agente:

- explica sinais;
- contextualiza risco;
- informa confiança;
- recomenda revisão;
- acompanha outcome;
- registra falso positivo;
- sugere ajuste de política quando necessário.

Ele não declara culpa.

## AVII.9 Customer Care Agent

O agente:

- resume incidentes;
- identifica recorrência;
- separa responsabilidade;
- sugere prevenção;
- acompanha nova compra;
- sugere follow-up;
- mede recuperação;
- identifica falhas sistêmicas da empresa.

## AVII.10 Qualidade de atendimento

Métricas prioritárias:

- resolução real;
- First Contact Resolution quando aplicável;
- reabertura;
- recorrência;
- tempo até resolução;
- satisfação;
- recompra após incidente;
- recuperação de confiança;
- problemas evitados.

Quantidade de tickets fechados não é suficiente para medir qualidade.

## AVII.11 Integração com Decision Safety

A Safety Layer deverá considerar risco de dano ao cliente.

```text
mudança
→ impacto financeiro
+ impacto operacional
+ impacto de CX
→ decisão
```

## AVII.12 Integração com Outcome Tracking

O outcome deverá responder:

- a fraude foi confirmada?
- o alerta era falso positivo?
- o problema se repetiu?
- o acompanhamento evitou uma nova falha?
- o cliente voltou a comprar?
- a experiência melhorou?
- a ação financeira aumentou reclamações?

## AVII.13 Integração com Agente Mestre

O Agente Mestre poderá avaliar:

- precisão do Trust & Risk Agent;
- taxa de falsos positivos;
- taxa de revisão;
- qualidade das recomendações de cuidado;
- outcomes;
- degradação por versão;
- excesso de alertas;
- sinais de discriminação;
- necessidade de shadow, rollback ou quarentena.

## AVII.14 Interface

No pedido:

```text
Customer Care Watch
→ motivo
→ histórico relevante
→ ação preventiva
```

Separadamente:

```text
Transaction Risk
→ sinais
→ score
→ confiança
→ revisão
```

Nunca usar uma única marcação visual ambígua para as duas coisas.

## AVII.15 Distribuição por fases

| Item | Fases |
|---|---|
| Gatilhos no pedido | 6 |
| Customer Incident History | 7, 14, 19 |
| Customer Care Watch | 6, 7, 15, 17, 19 |
| Recuperação de confiança | 7, 14, 15, 17 |
| Customer Experience Risk | 7, 12, 13, 17, 19 |
| Trust & Risk Intelligence | 6, 12, 13, 15, 17, 19 |
| Trust & Risk Agent | 15 |
| Customer Care Agent | 15 |
| Outcome de RiskCase | 12, 14, 19 |
| Falsos positivos | 12, 15, 19 |
| Interface de revisão | 17 |
| Governança e retenção | 19 |
| Métricas de atendimento | 7, 9, 15, 19 |

## AVII.16 Nota de escopo

Nenhuma dessas capacidades altera a vertical slice atual.

O foco imediato continua:

```text
Product
→ PostgreSQL
→ Transactional Outbox
→ observabilidade mínima
→ Worker
→ Projection
→ API
→ testes
```

O Customer Care Watch e Trust & Risk serão construídos quando pedidos, clientes e histórico operacional existirem.

---

# Anexo VIII — Cadência de Inteligência, Scheduler e Uso Seletivo de IA Externa

> Complementa o Roadmap Mestre e os Anexos I, II, III, IV, V, VI e VII.  
> Documenta quando agentes e análises executam, como sua agenda é gerenciada pela própria plataforma e quando a Versa deve ou não recorrer a IA externa.  
> Os itens deste anexo foram distribuídos principalmente pelas Fases 15, 16, 17 e 19.

## AVIII.1 Princípio de cadência

Agentes não devem trabalhar todos ao mesmo tempo nem o tempo todo.

Cada análise deve responder:

```text
por que executar?
quando executar?
quais dados são necessários?
qual prioridade?
qual deadline?
quanto pode custar?
precisa de revisão humana?
```

## AVIII.2 Modos de acionamento

```text
event_driven
scheduled
on_demand
condition_triggered
periodic_health_check
```

### Event-driven

Executa quando um evento relevante ocorre.

Exemplos:

- nova compra;
- chargeback;
- estoque crítico;
- cliente em Customer Care Watch faz novo pedido;
- integração entra em falha.

### Scheduled / batch

Executa em janela definida.

Exemplos:

- planejamento semanal de marketing;
- fechamento financeiro diário;
- análise semanal de fornecedores;
- relatório mensal.

### On-demand

Executa por solicitação humana.

Exemplo:

```text
Analise este produto agora.
```

### Condition-triggered

Executa apenas se uma condição ultrapassar limiar.

Exemplos:

- margem abaixo de X;
- rejeição do agente acima de Y%;
- custo acima do orçamento;
- anomalia detectada.

### Periodic health check

Execução curta para decidir se uma análise profunda é necessária.

## AVIII.3 AgentSchedule

A agenda será configurável dentro da plataforma.

```text
AgentSchedule
├── id
├── tenant_id
├── agent_id
├── trigger_type
├── schedule
├── timezone
├── earliest_run
├── deadline
├── priority
├── dependencies
├── required_data_freshness
├── max_cost
├── max_concurrency
├── quiet_hours
├── requires_human_review
├── status
├── version
└── audit
```

Estados:

```text
draft
active
paused
disabled
```

A agenda não será hardcoded como única fonte de verdade.

## AVIII.4 Versionamento da agenda

Alterações devem registrar:

- versão anterior;
- versão nova;
- usuário;
- motivo;
- horário;
- diff;
- próxima execução recalculada;
- impacto;
- auditoria.

## AVIII.5 Deadline e janela de execução

Preferir janela quando a tarefa não exigir horário exato.

```text
earliest_run:
sábado 08:00

deadline:
domingo 08:00
```

O scheduler pode escolher o melhor momento dentro da janela.

## AVIII.6 Freshness

Cada análise poderá declarar o quão recentes seus dados precisam ser.

Se uma fonte estiver atrasada:

- aguardar;
- alertar;
- executar parcialmente se permitido;
- registrar cobertura;
- respeitar deadline.

## AVIII.7 Dependências

Análises poderão formar DAGs.

```text
Data Refresh
→ Performance Analysis
→ Product Analysis
→ Marketing Strategy
→ Content Plan
→ Copy
→ Human Review
```

## AVIII.8 Prioridades

Referência inicial:

```text
P0 — segurança / crítico
P1 — cliente
P2 — financeiro
P3 — operação
P4 — planejamento
P5 — exploratório
```

## AVIII.9 Quiet Hours

Execuções não urgentes podem ser adiadas durante janelas configuradas por tenant.

## AVIII.10 Exemplo — planejamento semanal de Instagram

```text
sábado
→ dados consolidados
→ análise de produtos
→ análise de estoque
→ análise de campanhas
→ análise de conteúdo
→ plano semanal
→ copys em draft

domingo
→ revisão humana

segunda
→ execução do plano aprovado
```

## AVIII.11 Agenda da Inteligência

A UI deverá mostrar:

- hoje;
- semana;
- próximas execuções;
- atrasos;
- bloqueios;
- análises puladas;
- dependências;
- freshness;
- revisão pendente;
- custo previsto;
- custo realizado;
- uso previsto de LLM;
- uso realizado de LLM.

## AVIII.12 Otimização de cadência

O Agente Mestre poderá avaliar:

- utilidade;
- novidades encontradas;
- rejeições;
- outcomes;
- custo;
- latência;
- repetição de resultados.

Ele poderá sugerir:

- aumentar frequência;
- reduzir frequência;
- trocar para event-driven;
- trocar para health check;
- pausar temporariamente;
- alterar deadline;
- alterar prioridade.

Mudanças relevantes continuam versionadas e governadas.

## AVIII.13 Princípio LLM Only When Needed

A inteligência da Versa não é equivalente a IA generativa.

Fluxo preferencial:

```text
Camada A
determinística
      ↓
Camada B
estatística / ML
      ↓
Camada C
LLM somente quando necessário
```

## AVIII.14 Agente não é LLM

Um agente poderá:

- consultar SQL;
- executar regras;
- calcular métricas;
- avaliar políticas;
- rodar modelos estatísticos;
- gerar score;
- tomar decisão determinística autorizada;
- acionar workflow;
- somente então usar LLM para explicar ou gerar linguagem.

## AVIII.15 AI Gateway

Toda chamada externa deverá passar por:

```text
Agent / Feature
→ AI Gateway
→ Necessity Policy
→ Model Router
→ Provider
```

Responsabilidades:

- verificar necessidade;
- escolher provider;
- escolher modelo;
- respeitar orçamento;
- respeitar privacidade;
- aplicar cache;
- aplicar fallback;
- registrar custo;
- registrar latência;
- registrar contexto;
- correlacionar execução;
- aplicar limites.

## AVIII.16 LLM Necessity Policy

Perguntas mínimas:

- existe solução determinística suficiente?
- existe solução estatística suficiente?
- existe resultado recente reutilizável?
- existe cache válido?
- exige linguagem natural?
- exige interpretação semântica?
- exige criatividade?
- custo é justificável?
- dado pode ser enviado?
- orçamento permite?
- provider está saudável?

## AVIII.17 Model Router

O router poderá selecionar modelo conforme:

- qualidade requerida;
- custo;
- latência;
- tamanho de contexto;
- tipo de tarefa;
- disponibilidade;
- política do tenant;
- fallback configurado.

## AVIII.18 Cache

Quando seguro e semanticamente válido, resultados poderão ser reutilizados para evitar chamadas repetidas.

Cache deve considerar:

- tenant;
- versão do prompt;
- versão da diretriz;
- contexto;
- freshness;
- modelo;
- validade;
- dados sensíveis.

## AVIII.19 Métricas

Monitorar:

```text
execuções totais
execuções sem LLM
execuções com LLM
chamadas evitadas
cache hits
fallbacks
custo total
custo evitado estimado
custo por outcome
```

## AVIII.20 Observabilidade

Cada chamada externa deverá registrar:

- motivo;
- necessidade;
- tenant;
- agente;
- schedule;
- execução;
- provider;
- modelo;
- tokens;
- custo;
- cache;
- fallback;
- latência;
- correlation_id.

## AVIII.21 Distribuição por fases

| Item | Fases |
|---|---|
| Princípio agente != LLM | transversal |
| LLM only when needed | transversal |
| AI Gateway | 15, 19 |
| LLM Necessity Policy | 15, 19 |
| Model Router | 15, 19 |
| Intelligence Scheduler | 15, 16, 17, 19 |
| AgentSchedule | 16, 17, 19 |
| Event-driven | 15, 16 |
| Scheduled/batch | 15, 16 |
| On-demand | 15, 16, 17 |
| Condition-triggered | 15, 16 |
| Health check | 15, 16, 19 |
| Deadline | 16, 17, 19 |
| Data freshness | 16, 17, 19 |
| DAG de análises | 16, 19 |
| Prioridade | 16, 17, 19 |
| Quiet hours | 16, 17, 19 |
| Agenda da Inteligência | 17 |
| Otimização de cadência | 15, 16, 19 |
| Cache de IA | 15, 19 |
| Fallback de modelo | 15, 19 |
| Métrica de uso evitado | 15, 19 |
| Custo por agenda | 16, 17, 19 |

## AVIII.22 Nota de escopo

Nenhum item deste anexo altera o foco funcional imediato da Fase 1.

A observabilidade mínima construída agora deverá, porém, preservar identificadores e metadados que futuramente permitam correlacionar:

```text
schedule
→ analysis execution
→ agent execution
→ LLM call
→ outcome
```

O foco atual continua:

```text
Product
→ PostgreSQL
→ Transactional Outbox
→ observabilidade mínima
→ Worker
→ Projection
→ API
→ testes
```

---

# Anexo IX — Strategy Workspace e Decision Profile

> Complementa o Roadmap Mestre e os Anexos I, II, III, IV, V, VI, VII e VIII.  
> Consolida a memória estratégica visual da empresa e o perfil operacional de decisão do usuário.  
> Os itens deste anexo foram distribuídos principalmente pelas Fases 10, 12, 13, 14, 15, 17 e 19.

## AIX.1 Strategy Workspace

A Versa terá uma área específica para estratégias.

A visualização principal será baseada em cards compactos, inspirados em ferramentas de notas visuais, sem reduzir a estratégia a uma simples anotação.

Cada card poderá resumir:

- título;
- status;
- tags;
- canais;
- produtos;
- agentes;
- execuções;
- período;
- outcome resumido;
- confiança.

## AIX.2 Strategy é diferente de Campaign

```text
Strategy
= hipótese, lógica, objetivo e aprendizado

Campaign
= execução específica da estratégia
```

Uma estratégia poderá possuir múltiplas campanhas.

Uma campanha poderá registrar qual Strategy/versão a originou.

## AIX.3 Estrutura da Strategy

```text
Strategy
├── id
├── tenant_id
├── title
├── objective
├── hypothesis
├── description
├── type
├── channels
├── tactics
├── audience_context
├── products
├── campaigns
├── posts
├── automations
├── agents
├── contributions
├── start_at
├── end_at
├── status
├── expected_outcomes
├── actual_outcomes
├── learnings
├── version
└── audit
```

## AIX.4 Tipos de estratégia

Exemplos:

- postagens em grupos de vendas;
- anúncios;
- Stories;
- Social Media;
- prova social;
- remarketing;
- lançamento;
- recuperação de clientes;
- giro de estoque;
- estratégia por produto;
- estratégia local;
- estratégia de conteúdo;
- estratégia de preço ligada a marketing.

O tipo não deve limitar evolução futura.

## AIX.5 Lifecycle

```text
draft
active
paused
completed
archived
```

### Pausar

Pausar significa:

- não executar novas ações derivadas;
- manter histórico;
- manter outcomes;
- manter relações;
- manter versão;
- registrar motivo e responsável.

### Reativar

Reativação:

```text
paused
→ active
```

deve preservar o passado e permitir comparar antes/depois.

## AIX.6 Versionamento

Mudanças relevantes criam nova versão.

Exemplo:

```text
v1
3 posts por semana

v2
sexta + sábado
```

Outcome Tracking deve poder avaliar cada versão separadamente.

## AIX.7 Hipótese

Toda Strategy poderá ter uma hipótese explícita.

Exemplo:

```text
Postagens em grupos locais terão CAC menor
que tráfego pago para produtos abaixo de R$ 50.
```

Resultado:

```text
confirmed
partially_confirmed
rejected
inconclusive
```

## AIX.8 Contribuições dos agentes

Uma estratégia deverá preservar quem contribuiu e como.

Exemplo:

```text
Marketing Agent
→ sugeriu canal e frequência

Copy Agent
→ criou variações

Pricing Agent
→ validou margem

Customer Intelligence
→ sugeriu público
```

Contribuição não significa autoria exclusiva do resultado.

## AIX.9 Outcomes e aprendizados

A Strategy deverá conectar:

```text
previsão
→ execução
→ resultado
→ diferença
→ aprendizado
```

Métricas dependem do tipo de estratégia.

Podem incluir:

- vendas;
- receita;
- margem;
- CPA;
- CAC;
- ROAS;
- conversão;
- alcance;
- conversas;
- recompra;
- estoque;
- qualidade de atendimento;
- impacto em CX.

## AIX.10 Busca e filtros

Filtros esperados:

- produto;
- canal;
- agente;
- status;
- resultado;
- período;
- tipo;
- tag;
- versão.

Perguntas futuras:

- quais estratégias já usamos neste produto?
- quais estratégias de Instagram deram resultado positivo?
- quais estratégias foram pausadas?
- quais estratégias foram reativadas?
- quais hipóteses foram rejeitadas?
- qual versão performou melhor?

## AIX.11 Decision Profile

A Versa terá um perfil rico de decisão do usuário.

Objetivo:

> entender como o operador costuma decidir dentro da plataforma para melhorar explicação, contexto e UX.

Não é objetivo:

> diagnosticar personalidade, saúde mental, caráter ou atributos sensíveis.

## AIX.12 Estrutura do Decision Profile

```text
DecisionProfile
├── user_id
├── period
├── declared_preferences
├── observed_patterns
├── inferred_preferences
├── contradictions
├── confidence
├── evidence_ids
├── trend_history
├── last_evaluated_at
└── version
```

## AIX.13 Decision Pattern

```text
DecisionPattern
├── dimension
├── observation
├── interpretation
├── confidence
├── sample_size
├── evidence_ids
├── valid_from
├── valid_until
└── user_feedback
```

## AIX.14 Dimensões possíveis

- tolerância a risco por domínio;
- frequência de override;
- frequência de justificativa;
- preferência por evidência;
- preferência por simulação;
- aprovação;
- rejeição;
- edição;
- adiamento;
- reação a alertas;
- aderência a políticas;
- horizonte de decisão;
- velocidade de revisão;
- margem versus crescimento em contexto específico.

## AIX.15 Fato, padrão e interpretação

Exemplo:

```text
Fato
→ rejeitou 8 descontos acima de 25%

Padrão
→ descontos altos costumam ser rejeitados

Interpretação
→ possível preferência por preservação de margem
```

A interpretação nunca deve ser exibida como fato.

## AIX.16 Explicabilidade

Ao abrir um padrão:

```text
Por que concluímos isso?
```

A plataforma mostrará:

- período;
- amostra;
- fatos;
- evidence IDs;
- decisões relacionadas;
- interpretação;
- confiança;
- limitações.

## AIX.17 Contestação e contexto

A interface deverá oferecer:

```text
[Discordo desta avaliação]
[Adicionar contexto]
[Definir preferência]
[Ver evidências]
```

Feedback não apaga evidência histórica.

Ele passa a compor a próxima avaliação.

## AIX.18 Declarado versus observado

A plataforma poderá comparar:

```text
preferência declarada
vs.
comportamento observado
```

Divergência não significa incoerência.

Pode representar:

- contexto diferente;
- mudança ao longo do tempo;
- exceção;
- fase temporária;
- dados insuficientes.

## AIX.19 Contradições

Contradições devem ser exibidas quando forem informativas.

Exemplo:

```text
evita descontos altos na maior parte do tempo,
mas aceita descontos agressivos em liquidação.
```

Isso sugere contexto, não erro.

## AIX.20 Evolução temporal

O perfil deverá preservar tendências por período.

Exemplo:

```text
Jan–Mar
→ risco de estoque baixo

Abr–Jun
→ maior experimentação em marketing

Jul–Set
→ mais uso de simulação financeira
```

## AIX.21 Uso pelos agentes

Agentes poderão adaptar:

- ordem da explicação;
- nível de detalhe;
- evidências;
- comparação histórica;
- cenários.

Não poderão:

- manipular;
- ocultar alternativa;
- reduzir guardrail;
- presumir consentimento;
- aprovar ação irreversível pelo perfil.

## AIX.22 Proteções

Não inferir ou armazenar como Decision Profile:

- diagnóstico psicológico;
- saúde mental;
- religião;
- ideologia;
- orientação sexual;
- raça/etnia;
- caráter;
- inteligência;
- honestidade presumida;
- outros atributos sensíveis.

O perfil é estritamente operacional.

## AIX.23 Integrações internas

```text
Decision Safety
        ↑
        │
Decision Profile
        │
        ↓
Agent Master

Strategy Workspace
        ↓
Outcome Tracking
        ↓
Strategic Memory
```

Strategy e Decision Profile também se conectam com:

- Product Workspace;
- Campaigns;
- Agent Registry;
- Analysis History;
- System Timeline;
- Evidence Engine.

## AIX.24 Distribuição por fases

| Item | Fases |
|---|---|
| Strategy entity | 10, 14, 17, 19 |
| Strategy Workspace | 10, 17 |
| Strategy cards | 17 |
| Lifecycle e pause/reactivate | 10, 17, 19 |
| Hipótese estratégica | 10, 14 |
| Versionamento | 10, 14, 17, 19 |
| Outcomes por Strategy | 10, 14, 17, 19 |
| Contribuições de agentes | 10, 14, 15, 17, 19 |
| Relações com Product/Campaign | 10, 14, 17 |
| Decision Pattern Intelligence | 12 |
| Decision Profile | 12, 13, 14, 15, 17, 19 |
| Declared vs observed | 14, 17 |
| Contradições | 12, 14, 17 |
| Evidence IDs | 14, 17, 19 |
| Contestação | 14, 17, 19 |
| Uso pelos agentes | 13, 15 |
| Governança e privacidade | 19 |

## AIX.25 Nota de escopo

Nenhuma dessas funções altera a vertical slice atual da Fase 1.

O foco imediato continua:

```text
Product
→ PostgreSQL
→ Transactional Outbox
→ observabilidade mínima
→ Worker
→ Projection
→ API
→ testes
```

Strategy Workspace e Decision Profile deverão ser implementados somente quando as entidades, eventos, decisões, campanhas e histórico necessários já existirem.

---

# Anexo X — Materiais Operacionais, Consumo e Previsão de Estoque

> Complementa o Roadmap Mestre e os Anexos I, II, III, IV, V, VI, VII, VIII e IX.  
> Consolida a gestão de materiais operacionais consumidos no fulfillment e sua integração com pedidos, custos, fornecedores, forecasting, Strategy Workspace e Decision Safety.  
> Os itens deste anexo foram distribuídos principalmente pelas Fases 4, 5, 6, 10, 12, 13, 14, 15, 17 e 19.

## AX.1 Princípio

Estoque não significa apenas produto vendável.

```text
Inventory
├── Sellable Products
└── Operational Supplies
```

A Versa deverá conhecer os materiais físicos necessários para completar a experiência de compra.

## AX.2 Exemplos de Operational Supplies

- cartões de agradecimento;
- sacolas;
- embalagens;
- tags;
- cartões de visita;
- etiquetas;
- fitas;
- adesivos;
- papel de seda;
- materiais de proteção;
- brindes não vendáveis;
- materiais promocionais;
- outros consumíveis de fulfillment.

## AX.3 Separação de domínio

```text
SellableProduct
≠
OperationalSupply
```

A plataforma poderá compartilhar infraestrutura de estoque e movimentação sem transformar ambos na mesma entidade de domínio.

## AX.4 OperationalSupply

```text
OperationalSupply
├── id
├── tenant_id
├── name
├── internal_code
├── category
├── unit
├── current_stock
├── minimum_stock
├── reorder_point
├── safety_stock
├── average_unit_cost
├── active
├── created_at
└── updated_at
```

## AX.5 Movimentações

```text
OperationalSupplyMovement
├── id
├── supply_id
├── type
├── quantity
├── unit_cost
├── order_id
├── reason
├── actor
├── correlation_id
└── occurred_at
```

Tipos possíveis:

- `purchase_entry`;
- `order_consumption`;
- `manual_adjustment`;
- `loss`;
- `disposal`;
- `return_to_stock`;
- `inventory_reconciliation`.

## AX.6 Consumo por pedido

Cada pedido poderá registrar o que foi realmente utilizado.

```text
Pedido #1058
Produtos → 2 blusas
Materiais → 1 sacola, 2 tags, 1 cartão, 1 embalagem
```

O consumo real deverá alimentar estoque, margem e histórico.

## AX.7 Packaging Recipes

Receitas padrão evitam preenchimento repetitivo.

```text
1 peça
→ 1 sacola
→ 1 embalagem
→ 1 tag
→ 1 cartão
```

Uma receita poderá depender de quantidade, produto, categoria, canal, campanha, estratégia ou experiência escolhida.

## AX.8 Previsto versus real

```text
Packaging Recipe
→ consumo previsto
→ fulfillment
→ ajuste humano
→ consumo real
```

O sistema deve preservar ambos para medir previsão e desperdício.

## AX.9 Custo físico real do pedido

```text
Venda                      R$ 34,90
Produto                    R$ 15,26
Sacola                     R$  0,42
Tag                        R$  0,18
Cartão                     R$  0,12
Embalagem                  R$  0,35
──────────────────────────────────
Custo físico               R$ 16,33
```

## AX.10 Forecasting

A previsão deverá combinar estoque atual, consumo médio, vendas previstas, sazonalidade, campanhas, estratégias, Packaging Recipes, lead time, estoque de segurança e lote mínimo.

## AX.11 Cobertura e ponto de reposição

```text
Sacolas
Estoque: 47
Consumo médio: 18/semana
Cobertura: 17 dias
Lead time: 8 dias
Ponto de pedido: 80
Status: reposição recomendada
```

O ponto de reposição poderá iniciar por regra determinística e evoluir estatisticamente quando houver dados suficientes.

## AX.12 Supplier Intelligence

Materiais operacionais também participam da inteligência de fornecedores, incluindo preço, histórico de preço, prazo, atraso, qualidade, lote mínimo, disponibilidade e impacto de ruptura.

## AX.13 Integração com Strategy Workspace

```text
Unboxing premium
por pedido:
→ 1 embalagem especial
→ 1 adesivo
→ 1 cartão personalizado
```

Antes da ativação, a Versa poderá comparar demanda prevista com estoque disponível.

## AX.14 Integração com Decision Safety

Sinais de risco incluem material insuficiente, cobertura menor que lead time, campanha acima da capacidade física, aumento excessivo do custo de embalagem e fornecedor degradado.

## AX.15 Integração com Outcome Tracking

A plataforma poderá responder:

- quanto uma estratégia aumentou o custo de fulfillment?
- o unboxing premium melhorou satisfação ou recompra?
- qual campanha consumiu mais material?
- qual receita gera mais desperdício?
- uma ruptura afetou vendas ou experiência?

## AX.16 Interface

Cada material poderá exibir estoque, cobertura, ponto de pedido, fornecedor, lead time, custo, consumo e histórico.

No pedido, materiais previstos poderão ser confirmados ou ajustados antes da baixa real.

## AX.17 Auditoria e idempotência

Toda movimentação deverá ser rastreável.

Um retry do mesmo processamento não poderá consumir novamente os materiais do pedido.

## AX.18 Estados

```text
active
inactive
discontinued
```

Inativação ou descontinuação não apaga histórico.

## AX.19 Distribuição por fases

| Item | Fases |
|---|---|
| OperationalSupply | 4, 5 |
| Movimentação de consumíveis | 4, 6 |
| Consumo por pedido | 6 |
| Packaging Recipes | 6, 10, 17 |
| Custo físico real | 6, 13, 14 |
| Supplier Intelligence | 5, 15, 19 |
| Forecasting | 12, 15 |
| Cobertura / reorder point | 4, 12, 17 |
| Strategy integration | 10, 13, 17 |
| Decision Safety | 13 |
| Outcome Tracking | 14 |
| Interface | 17 |
| Governança | 19 |

## AX.20 Nota de escopo

Essa capacidade não altera a vertical slice atual da Fase 1.

O foco imediato continua:

```text
Product
→ PostgreSQL
→ Transactional Outbox
→ observabilidade mínima
→ Worker
→ Projection
→ API
→ testes
```

O domínio de materiais operacionais será aberto depois que a primeira vertical slice estiver concluída, reutilizando os padrões técnicos já estabelecidos sem misturar `OperationalSupply` com `Product`.

