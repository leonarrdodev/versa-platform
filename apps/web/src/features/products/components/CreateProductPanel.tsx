import {
  useState,
} from 'react';

import {
  createProduct,
  ProductsApiError,
  waitForProductProjection,
} from '../api/products-api';

import styles from './CreateProductPanel.module.css';

interface CreateProductPanelProps {
  readonly open:
    boolean;

  readonly onClose:
    () => void;

  readonly onCreated:
    () => Promise<void>;
}

export function CreateProductPanel({
  open,
  onClose,
  onCreated,
}: CreateProductPanelProps) {
  const [
    sku,
    setSku,
  ] =
    useState('');

  const [
    name,
    setName,
  ] =
    useState('');

  const [
    categoryId,
    setCategoryId,
  ] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState<
      string | null
    >(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setStatus(
      null,
    );

    try {
      const created =
        await createProduct({
          sku,
          name,
          categoryId,
        });

      setStatus(
        'Produto criado. Atualizando catálogo...',
      );

      await waitForProductProjection(
        created.id,
      );

      await onCreated();

      setSku('');
      setName('');
      setCategoryId('');

      onClose();
    } catch (error) {
      if (
        error instanceof
        ProductsApiError
      ) {
        if (
          error.code ===
          'PRODUCT_SKU_ALREADY_EXISTS'
        ) {
          setError(
            'Já existe um produto com este SKU.',
          );

          return;
        }

        if (
          error.code ===
          'INVALID_INPUT'
        ) {
          setError(
            'Confira os dados informados.',
          );

          return;
        }
      }

      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o produto.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        aria-labelledby="create-product-title"
      >
        <header className={styles.header}>
          <div>
            <span>
              Produto
            </span>

            <h2 id="create-product-title">
              Novo produto
            </h2>

            <p>
              Cadastre as informações
              básicas do produto.
            </p>
          </div>

          <button
            className={styles.closeButton}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </header>

        <form
          className={styles.form}
          onSubmit={(event) => {
            void handleSubmit(
              event,
            );
          }}
        >
          <label className={styles.field}>
            <span>
              Nome
            </span>

            <input
              value={name}
              onChange={(event) => {
                setName(
                  event.target.value,
                );
              }}
              placeholder="Ex.: Blusa Canelada Feminina"
              autoFocus
              disabled={submitting}
              required
            />
          </label>

          <label className={styles.field}>
            <span>
              SKU
            </span>

            <input
              value={sku}
              onChange={(event) => {
                setSku(
                  event.target.value,
                );
              }}
              placeholder="Ex.: BLUSA-PRETA-P"
              disabled={submitting}
              required
            />

            <small>
              Identificador único dentro
              da empresa.
            </small>
          </label>

          <label className={styles.field}>
            <span>
              Categoria ID
            </span>

            <input
              value={categoryId}
              onChange={(event) => {
                setCategoryId(
                  event.target.value,
                );
              }}
              placeholder="UUID da categoria"
              disabled={submitting}
              required
            />

            <small>
              Campo temporário da Fase 1.
              Depois será substituído por
              seleção de categoria.
            </small>
          </label>

          {error !== null ? (
            <div className={styles.error}>
              {error}
            </div>
          ) : null}

          {status !== null ? (
            <div className={styles.status}>
              {status}
            </div>
          ) : null}

          <footer className={styles.footer}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Salvando...'
                : 'Cadastrar produto'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}