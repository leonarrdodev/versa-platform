# Event Catalog

> Versão: 1.0.0
> Status: 🟧 Em elaboração
> Última atualização: 29/07/2026

---

# Objetivo

O Event Catalog define todos os Eventos de Domínio oficiais da plataforma.

Os eventos representam fatos que já ocorreram dentro do sistema e são a principal forma de comunicação entre os Bounded Contexts.

Este documento padroniza a criação, publicação, versionamento e consumo dos eventos.

---

# O que é um Evento de Domínio?

Um Evento de Domínio representa algo que aconteceu e que não pode ser alterado.

Exemplos:

- Produto criado
- Pedido pago
- Estoque recebido
- Campanha iniciada

Eventos descrevem fatos do passado.

Sempre utilizar nomes no passado.

✅ ProductCreated

✅ OrderPaid

✅ CampaignFinished

❌ CreateProduct

❌ PayOrder

---

# Princípios

## Imutabilidade

Depois de publicado, um evento nunca pode ser alterado.

---

## Versionamento

Eventos possuem versão própria.

Exemplo:

OrderPaid.v1

OrderPaid.v2

---

## Idempotência

Consumir o mesmo evento duas vezes deve produzir exatamente o mesmo resultado.

---

## Ownership

Cada evento pertence ao contexto que o publicou.

Somente esse contexto pode alterar sua estrutura.

---

## Comunicação

Toda comunicação assíncrona entre Contextos deve ocorrer através de Eventos.

Chamadas síncronas devem ser utilizadas apenas quando realmente necessárias.

---

# Estrutura Padrão

Todos os eventos da plataforma seguirão a mesma estrutura.

```ts
interface DomainEvent {

    id: string;

    name: string;

    version: number;

    occurredAt: Date;

    aggregateId: string;

    aggregateType: string;

    context: string;

    payload: unknown;

    metadata: {

        correlationId: string;

        causationId: string;

        userId?: string;

        organizationId: string;

    };

}
```

---

# Convenções de Nome

Formato

Objeto + Verbo + Passado

Exemplos

ProductCreated

ProductUpdated

ProductArchived

StockReceived

StockAdjusted

OrderPaid

OrderCancelled

SupplierRated

RecommendationAccepted

ActionCompleted

---

# Ciclo de Vida

Evento ocorre

↓

Publicado

↓

Persistido

↓

Consumido

↓

Processado

↓

Arquivado

---

# Categorias

A plataforma possui cinco categorias de eventos.

## Operacionais

Relacionados ao funcionamento diário.

Exemplos

- ProductCreated
- OrderPaid
- StockReceived

---

## Financeiros

Relacionados ao dinheiro.

Exemplos

- PaymentReceived
- ExpenseCreated

---

## Analíticos

Gerados pelos motores determinísticos.

Exemplos

- KPICalculated
- InventoryTurnoverUpdated

---

## Inteligência

Produzidos pela camada de Inteligência.

Exemplos

- ForecastGenerated
- EvidenceBundleCreated

---

## Decisão

Produzidos pela Decision Layer.

Exemplos

- RecommendationCreated
- RecommendationAccepted
- RecommendationRejected
- ActionCreated

---

# Estrutura da Documentação

Cada evento será documentado utilizando o padrão abaixo.

## Nome

OrderPaid

### Contexto

Sales

### Objetivo

Representa a confirmação do pagamento de um pedido.

### Publicado por

Sales

### Consumido por

Inventory

Finance

Analytics

Strategic Memory

### Payload

```ts
{
    orderId: string;
    customerId: string;
    total: number;
    paymentMethod: string;
    paidAt: Date;
}
```

### Garantias

- Imutável
- Idempotente
- Versionado

### Impacto

Inventory

↓

Reserva removida

Finance

↓

Receita registrada

Analytics

↓

KPIs atualizados

Strategic Memory

↓

Histórico atualizado

---

# Índice

## Catalog

(em construção)

## Inventory

(em construção)

## Supply Chain

(em construção)

## Sales

(em construção)

## Customers

(em construção)

## Finance

(em construção)

## Marketing

(em construção)

## Intelligence

(em construção)

## Decision Layer

(em construção)

## Automation

(em construção)

---

# Catalog Events

O contexto **Catalog** é responsável por gerenciar o ciclo de vida dos produtos e suas informações comerciais.

## ProductCreated

### Contexto

Catalog

### Objetivo

Representa a criação de um novo produto no catálogo.

### Publicado por

Catalog

### Consumido por

- Inventory
- Marketing
- Analytics
- Strategic Memory

### Payload

```ts
{
  productId: string;
  sku: string;
  name: string;
  categoryId: string;
  createdAt: Date;
}
```

### Regras

- Disparado apenas uma vez.
- O SKU deve ser único.
- O produto ainda pode estar indisponível para venda.

---

## ProductUpdated

### Contexto

Catalog

### Objetivo

Indica que informações relevantes do produto foram alteradas.

### Consumido por

- Marketing
- Analytics
- Strategic Memory

### Payload

```ts
{
  productId: string;
  changes: string[];
  updatedAt: Date;
}
```

---

## ProductActivated

### Objetivo

Indica que o produto passou a estar disponível para venda.

### Consumido por

- Sales
- Marketing
- Analytics

---

## ProductDeactivated

### Objetivo

Produto removido da comercialização.

Não significa exclusão.

---

## ProductArchived

### Objetivo

Produto arquivado definitivamente.

Mantém histórico para auditoria.

---

## ProductPriceChanged

### Objetivo

Preço de venda alterado.

### Consumido por

- Sales
- Marketing
- Analytics
- Evidence Engine

---

## ProductCostChanged

### Objetivo

Custo do produto alterado.

### Consumido por

- Finance
- Analytics
- Evidence Engine

---

## ProductCategoryChanged

### Objetivo

Produto movido para outra categoria.

---

## ProductVariantCreated

### Objetivo

Nova variante criada.

Exemplo:

- Cor
- Tamanho
- Modelo

---

## ProductVariantUpdated

Atualização de variante.

---

## ProductVariantRemoved

Remoção de variante.

---

## ProductTagAdded

Etiqueta adicionada.

Exemplo

- Verão
- Premium
- Promoção

---

## ProductTagRemoved

Etiqueta removida.

---

## ProductImageAdded

Imagem adicionada ao catálogo.

---

## ProductImageRemoved

Imagem removida.

---

## ProductCollectionChanged

Produto associado a uma coleção diferente.

Exemplo:

- Inverno 2026
- Dia das Mães
- Básicos

---

## ProductRecommendationChanged

Alteração manual na prioridade de recomendação do produto.

Utilizado pelo Marketing e pela Decision Layer.

---

## Resumo do Contexto Catalog

| Evento | Tipo |
|---------|------|
| ProductCreated | Operacional |
| ProductUpdated | Operacional |
| ProductActivated | Operacional |
| ProductDeactivated | Operacional |
| ProductArchived | Operacional |
| ProductPriceChanged | Comercial |
| ProductCostChanged | Financeiro |
| ProductCategoryChanged | Operacional |
| ProductVariantCreated | Operacional |
| ProductVariantUpdated | Operacional |
| ProductVariantRemoved | Operacional |
| ProductTagAdded | Comercial |
| ProductTagRemoved | Comercial |
| ProductImageAdded | Operacional |
| ProductImageRemoved | Operacional |
| ProductCollectionChanged | Comercial |
| ProductRecommendationChanged | Inteligência |