import {
  useEffect,
  useState,
} from 'react';

import {
  CategoriesApiError,
  categoryExists,
  createCategory,
} from '../../categories/api/categories-api';

import {
  useCategories,
} from '../../categories/hooks/use-categories';

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
  const {
    categories,

    loading:
      categoriesLoading,

    error:
      categoriesError,

    reload:
      reloadCategories,
  } =
    useCategories(
      open,
    );

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
    newCategoryOpen,
    setNewCategoryOpen,
  ] =
    useState(false);

  const [
    newCategoryName,
    setNewCategoryName,
  ] =
    useState('');

  const [
    categorySubmitting,
    setCategorySubmitting,
  ] =
    useState(false);

  const [
    categoryCreationError,
    setCategoryCreationError,
  ] =
    useState<
      string | null
    >(null);

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

  useEffect(
    () => {
      if (
        categoriesLoading
        ||
        categoriesError !==
          null
      ) {
        return;
      }

      if (
        categoryExists(
          categories,
          categoryId,
        )
      ) {
        return;
      }

      if (
        categories.length ===
        1
      ) {
        const onlyCategory =
          categories[0];

        if (
          onlyCategory !==
          undefined
        ) {
          setCategoryId(
            onlyCategory.id,
          );

          return;
        }
      }

      setCategoryId('');
    },
    [
      categories,
      categoriesError,
      categoriesLoading,
      categoryId,
    ],
  );

  if (
    !open
  ) {
    return null;
  }

  const hasCategories =
    categories.length >
    0;

  const busy =
    submitting
    ||
    categorySubmitting;

  const canSubmit =
    !busy
    &&
    !newCategoryOpen
    &&
    !categoriesLoading
    &&
    categoriesError ===
      null
    &&
    hasCategories
    &&
    categoryId !== '';

  function openNewCategory():
  void {
    setNewCategoryName('');

    setCategoryCreationError(
      null,
    );

    setNewCategoryOpen(
      true,
    );
  }

  function closeNewCategory():
  void {
    if (
      categorySubmitting
    ) {
      return;
    }

    setNewCategoryOpen(
      false,
    );

    setNewCategoryName('');

    setCategoryCreationError(
      null,
    );
  }

  function handleClose():
  void {
    if (
      busy
    ) {
      return;
    }

    setNewCategoryOpen(
      false,
    );

    setNewCategoryName('');

    setCategoryCreationError(
      null,
    );

    setError(
      null,
    );

    setStatus(
      null,
    );

    onClose();
  }

  async function handleCreateCategory():
  Promise<void> {
    if (
      categorySubmitting
    ) {
      return;
    }

    if (
      newCategoryName
        .trim()
        .length ===
        0
    ) {
      setCategoryCreationError(
        'Informe um nome para a categoria.',
      );

      return;
    }

    setCategorySubmitting(
      true,
    );

    setCategoryCreationError(
      null,
    );

    try {
      const created =
        await createCategory({
          name:
            newCategoryName,
        });

      const refreshedCategories =
        await reloadCategories();

      if (
        categoryExists(
          refreshedCategories,
          created.id,
        )
      ) {
        setCategoryId(
          created.id,
        );

        setNewCategoryName('');

        setNewCategoryOpen(
          false,
        );

        return;
      }

      setNewCategoryOpen(
        false,
      );

      setNewCategoryName('');

      setError(
        'A categoria foi criada, mas não foi possível atualizar a lista. Tente abrir o cadastro novamente.',
      );
    } catch (error) {
      if (
        error instanceof
        CategoriesApiError
      ) {
        if (
          error.code ===
          'CATEGORY_NAME_ALREADY_EXISTS'
        ) {
          setCategoryCreationError(
            'Já existe uma categoria com este nome.',
          );

          return;
        }

        if (
          error.code ===
          'INVALID_INPUT'
        ) {
          setCategoryCreationError(
            'Informe um nome válido para a categoria.',
          );

          return;
        }
      }

      setCategoryCreationError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a categoria.',
      );
    } finally {
      setCategorySubmitting(
        false,
      );
    }
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      !canSubmit
    ) {
      return;
    }

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

      /*
       * Mantemos o painel aberto
       * para cadastro sequencial.
       *
       * Nome e SKU são limpos,
       * mas Category permanece
       * selecionada.
       */
      setSku('');

      setName('');

      setNewCategoryOpen(
        false,
      );

      setNewCategoryName('');

      setError(
        null,
      );

      setStatus(
        'Produto cadastrado com sucesso. Você pode cadastrar o próximo.',
      );
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
          'PRODUCT_CATEGORY_NOT_AVAILABLE'
        ) {
          /*
           * A Category pode ter sido
           * arquivada ou removida
           * depois que o formulário
           * carregou.
           *
           * Recarregamos a fonte de
           * verdade e deixamos o
           * useEffect corrigir uma
           * seleção que não exista
           * mais.
           */
          await reloadCategories();

          setCategoryId('');

          setError(
            'A categoria selecionada não está mais disponível. Selecione outra categoria e tente novamente.',
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
    <div
      className={
        styles.overlay
      }
    >
      <section
        className={
          styles.panel
        }
        aria-labelledby="create-product-title"
      >
        <header
          className={
            styles.header
          }
        >
          <div>
            <span>
              Produto
            </span>

            <h2
              id="create-product-title"
            >
              Novo produto
            </h2>

            <p>
              Cadastre as informações
              básicas do produto.
            </p>
          </div>

          <button
            className={
              styles.closeButton
            }
            type="button"
            aria-label="Fechar"
            onClick={
              handleClose
            }
            disabled={
              busy
            }
          >
            ×
          </button>
        </header>

        <form
          className={
            styles.form
          }
          onSubmit={(event) => {
            void handleSubmit(
              event,
            );
          }}
        >
          <label
            className={
              styles.field
            }
          >
            <span>
              Nome
            </span>

            <input
              value={
                name
              }
              onChange={(event) => {
                setName(
                  event.target.value,
                );
              }}
              placeholder="Ex.: Blusa Canelada Feminina"
              autoFocus
              disabled={
                busy
              }
              required
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              SKU
            </span>

            <input
              value={
                sku
              }
              onChange={(event) => {
                setSku(
                  event.target.value,
                );
              }}
              placeholder="Ex.: BLUSA-PRETA-P"
              disabled={
                busy
              }
              required
            />

            <small>
              Identificador único dentro
              da empresa.
            </small>
          </label>

          <div
            className={
              styles.field
            }
          >
            <div
              className={
                styles.fieldHeader
              }
            >
              <label
                htmlFor="product-category"
              >
                Categoria
              </label>

              {!categoriesLoading
              &&
              categoriesError ===
                null
              &&
              hasCategories
              &&
              !newCategoryOpen ? (
                <button
                  className={
                    styles.newCategoryLink
                  }
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={
                    openNewCategory
                  }
                >
                  + Nova
                </button>
              ) : null}
            </div>

            <select
              id="product-category"
              value={
                categoryId
              }
              onChange={(event) => {
                setCategoryId(
                  event.target.value,
                );

                setError(
                  null,
                );
              }}
              disabled={
                busy
                ||
                categoriesLoading
                ||
                categoriesError !==
                  null
                ||
                !hasCategories
              }
              required
            >
              <option
                value=""
                disabled
              >
                {categoriesLoading
                  ? 'Carregando categorias...'
                  : hasCategories
                    ? 'Selecione uma categoria'
                    : 'Nenhuma categoria disponível'}
              </option>

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>

            {categoriesLoading ? (
              <small>
                Buscando categorias da
                empresa ativa...
              </small>
            ) : categoriesError !==
              null ? (
              <div
                className={
                  styles.categoryMessage
                }
              >
                <span>
                  Não foi possível
                  carregar as categorias.
                </span>

                <button
                  className={
                    styles.retryButton
                  }
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() => {
                    void reloadCategories();
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            ) : !hasCategories
            &&
            !newCategoryOpen ? (
              <div
                className={
                  styles.categoryEmpty
                }
              >
                <div
                  className={
                    styles.categoryEmptyText
                  }
                >
                  <strong>
                    Nenhuma categoria
                    cadastrada
                  </strong>

                  <span>
                    Crie a primeira
                    categoria sem sair
                    deste cadastro.
                  </span>
                </div>

                <button
                  className={
                    styles.createCategoryButton
                  }
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={
                    openNewCategory
                  }
                >
                  <span
                    aria-hidden="true"
                  >
                    +
                  </span>

                  Nova categoria
                </button>
              </div>
            ) : !newCategoryOpen ? (
              <small>
                O produto será vinculado
                à categoria selecionada.
              </small>
            ) : null}

            {newCategoryOpen ? (
              <div
                className={
                  styles.newCategoryForm
                }
              >
                <div
                  className={
                    styles.newCategoryHeader
                  }
                >
                  <div>
                    <strong>
                      Nova categoria
                    </strong>

                    <span>
                      Ela ficará disponível
                      imediatamente para este
                      produto.
                    </span>
                  </div>

                  <button
                    className={
                      styles.newCategoryCloseButton
                    }
                    type="button"
                    aria-label="Cancelar nova categoria"
                    disabled={
                      categorySubmitting
                    }
                    onClick={
                      closeNewCategory
                    }
                  >
                    ×
                  </button>
                </div>

                <label
                  className={
                    styles.newCategoryField
                  }
                  htmlFor="new-category-name"
                >
                  <span>
                    Nome da categoria
                  </span>

                  <input
                    id="new-category-name"
                    value={
                      newCategoryName
                    }
                    onChange={(event) => {
                      setNewCategoryName(
                        event.target.value,
                      );
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        'Enter'
                      ) {
                        event.preventDefault();

                        void handleCreateCategory();
                      }
                    }}
                    placeholder="Ex.: Blusas"
                    disabled={
                      categorySubmitting
                    }
                    autoFocus
                  />
                </label>

                {categoryCreationError !==
                null ? (
                  <div
                    className={
                      styles.categoryCreationError
                    }
                    role="alert"
                  >
                    {
                      categoryCreationError
                    }
                  </div>
                ) : null}

                <div
                  className={
                    styles.newCategoryActions
                  }
                >
                  <button
                    className={
                      styles.categoryCancelButton
                    }
                    type="button"
                    disabled={
                      categorySubmitting
                    }
                    onClick={
                      closeNewCategory
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className={
                      styles.categorySubmitButton
                    }
                    type="button"
                    disabled={
                      categorySubmitting
                      ||
                      newCategoryName
                        .trim()
                        .length ===
                        0
                    }
                    onClick={() => {
                      void handleCreateCategory();
                    }}
                  >
                    {categorySubmitting
                      ? 'Criando...'
                      : 'Criar categoria'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {error !== null ? (
            <div
              className={
                styles.error
              }
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {status !== null ? (
            <div
              className={
                styles.status
              }
              aria-live="polite"
            >
              {status}
            </div>
          ) : null}

          <footer
            className={
              styles.footer
            }
          >
            <button
              className={
                styles.cancelButton
              }
              type="button"
              onClick={
                handleClose
              }
              disabled={
                busy
              }
            >
              Cancelar
            </button>

            <button
              className={
                styles.submitButton
              }
              type="submit"
              disabled={
                !canSubmit
              }
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