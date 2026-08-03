# ADR-001 — Tenancy e ciclo de vida inicial de Product

## Status

Aceita.

## Data

2026-08-02.

## Contexto

A documentação funcional define que ProductCreated contém:

- productId;
- sku;
- name;
- categoryId;
- createdAt.

Também define que:

- o SKU deve ser único;
- o produto pode ainda não estar disponível para venda;
- a disponibilização comercial ocorre posteriormente.

A documentação anterior não definia o modelo de tenancy nem o estado inicial do produto.

## Decisão

Todo produto pertence obrigatoriamente a um tenant.

O identificador do tenant será armazenado como tenant_id.

A unicidade do SKU será garantida dentro do tenant:

```text
UNIQUE (tenant_id, sku)