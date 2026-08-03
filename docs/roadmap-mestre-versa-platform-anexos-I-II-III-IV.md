# Roadmap Mestre — Versa Platform

> **Versão consolidada — Anexos I, II, III e IV incorporados**  
> **Atualização:** 2026-08-02


> **Documento de direção do projeto**
>
> Este roadmap consolida a visão original da Versa Platform com o **Anexo I — Experiência, CX e Inteligência Profunda**, o **Anexo II — Padrões Invisíveis, Canal de Atendimento e Ativos Criativos**, o **Anexo III — Inteligência Financeira Avançada** e o **Anexo IV — Segurança de Automação, Custo de IA e Nota de Integração**. Seu objetivo é preservar o foco, registrar as decisões já tomadas e organizar a evolução da plataforma por fases.

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
- Privacidade e LGPD incorporadas à arquitetura.

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

Controlar fisicamente e logicamente os produtos disponíveis.

## Tópicos

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
- relação entre ruptura e perda de venda.

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
- custo de oportunidade preliminar.

## Resultado esperado

Visibilidade confiável sobre onde cada item está, quanto existe, como mudou e quanto capital está preso no estoque.

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
- impacto financeiro de fornecedores.

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
- produto adicionado ao carrinho.

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
- jornada do cliente.

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
- grau de cobertura do histórico utilizado na análise.

## Resultado esperado

Relacionamentos mais personalizados, mensuráveis e sustentados por uma linha do tempo confiável.

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
- campanhas para produtos roteadores.

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

### Detecção de anomalias

- outliers;
- queda súbita de vendas;
- aumento inesperado de devolução;
- mudança de conversão;
- ruptura atípica;
- alteração de comportamento;
- anomalia por ausência;
- vazio comportamental.

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
- resultado financeiro.

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
- recuperação de decisões antigas.

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
- registrar o DTO financeiro enviado à Camada C.

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

O conhecimento da empresa deixa de ficar espalhado entre pessoas, conversas, planilhas e ferramentas desconectadas.

---

# Fase 15 — Agentes assistivos

## Objetivo

Criar agentes especializados que utilizam dados confiáveis, regras, contexto e memória.

## Agentes planejados

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
- vazio comportamental.

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
- diferenciar sugestão, decisão e execução.

## Resultado esperado

Assistentes especializados trabalhando sobre uma base confiável e contextualizada.

---

# Fase 16 — Automação e orquestração

## Objetivo

Executar tarefas automaticamente quando condições forem atendidas.

## Tópicos

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
- n8n;
- integrações externas;
- automações internas;
- templates;
- versionamento;
- reprocessamento;
- compensação;
- limites de segurança;
- ações 1-click;
- workflows de decisão;
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
- pausa automática.

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

Redução de trabalho manual e respostas mais rápidas, mantendo controle, simulação prévia, limites de segurança e auditoria.

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
- filtros por destino, produto, ocasião e tipo de foto.

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

Uma plataforma utilizável diariamente, sem exigir conhecimento técnico dos usuários.

---

# Fase 18 — Integrações externas

## Objetivo

Conectar a Versa aos canais e serviços usados pela operação.

## Tópicos

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
- ferramentas de atendimento;
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
- envio manual via `wa.me`;
- importação manual de conversas quando necessário;
- possível integração oficial futura;
- proibição de biblioteca não oficial para leitura automática;
- transição planejada do fechamento por WhatsApp para o site.

### Nota de referência — WhatsApp

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

A plataforma se torna o centro de inteligência mesmo quando os dados vêm de sistemas externos.

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
- monitoramento de modelos;
- monitoramento de automações;
- monitoramento de circuit breakers;
- monitoramento de cadeias;
- monitoramento de custo de IA;
- reconciliação de custo estimado e faturado.

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
- segregação de tenants.

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
- custo faturado.

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
- monitoramento de deriva.

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

Uma plataforma segura, auditável, recuperável, financeiramente observável e respeitosa com dados pessoais, automações e fontes externas.

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
Fase 16 — Automação e orquestração
Fase 17 — Interfaces e experiência do usuário
Fase 18 — Integrações externas
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
- cadeias de automação dependem de correlação, causalidade e circuit breaker.
- agentes em escala dependem de orçamento e monitoramento específico de custo de IA.
- qualquer mudança na estratégia de WhatsApp depende de integração oficial e nova decisão arquitetural.

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
- custo faturado.

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

