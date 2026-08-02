# Bounded Contexts

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
> **Objetivo:** Definir os Bounded Contexts da plataforma, suas responsabilidades, fronteiras e interações.
>
> **Documentos relacionados:**
>
> - Domain Landscape
> - Ubiquitous Language
> - Architecture Overview

## Introdução

Os Bounded Contexts representam fronteiras claras dentro da plataforma.

Cada contexto possui linguagem própria, regras de negócio específicas e responsabilidades bem definidas.

A comunicação entre contextos deve ocorrer através de contratos explícitos, eventos de domínio ou APIs internas, evitando acoplamento excessivo.

Os contextos foram definidos com base nas necessidades do negócio e não na tecnologia utilizada.

## Identity

### Objetivo

Gerenciar a identidade dos usuários da plataforma.

### Responsabilidades

- Autenticação
- Sessões
- Recuperação de senha
- MFA (futuro)
- Provedores externos de login

### Não é responsabilidade

- Permissões
- Empresas
- Configurações

## Organization

### Objetivo

Gerenciar a estrutura organizacional da plataforma.

### Responsabilidades

- Empresas
- Lojas
- Filiais
- Dados cadastrais
- Planos (SaaS futuro)

### Não é responsabilidade

- Usuários
- Estoque
- Pedidos

## Access Control

### Objetivo

Controlar o que cada usuário pode visualizar ou executar.

### Responsabilidades

- Papéis
- Permissões
- Políticas
- Auditoria de acesso

### Não é responsabilidade

- Login
- Cadastro de usuários

## Settings

### Objetivo

Centralizar todas as configurações da empresa.

### Responsabilidades

- Preferências
- Configurações fiscais
- Idioma
- Integrações
- Personalização

### Não é responsabilidade

- Regras de negócio dos módulos