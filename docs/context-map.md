# Context Map

> **Status:** Em elaboração
>
> **Versão:** 0.1.0
>
> **Criado em:** 2026-07-28
>
> **Última atualização:** 2026-07-28
>
> **Responsável:** Leonardo
>
> **Objetivo:** Definir a comunicação entre os Bounded Contexts da plataforma.
>
> **Documentos relacionados:**
>
> - Domain Landscape
> - Bounded Contexts
> - Event Catalog
> - Dependency Rules

## Introdução

O Context Map descreve como os Bounded Contexts da plataforma se comunicam.

Seu objetivo é definir dependências permitidas, fluxos de informação, eventos publicados e consumidos e responsabilidades de integração.

Nenhum contexto deve acessar diretamente os dados internos de outro contexto.

Toda comunicação deve ocorrer através de contratos, eventos ou APIs internas.

