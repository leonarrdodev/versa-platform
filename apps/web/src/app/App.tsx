import {
  useEffect,
  useState,
} from 'react';

import {
  AuthApiError,
  getSession,
  login,
  logout,
} from '../features/auth/api/auth-api';

import {
  LoginPage,
} from '../features/auth/components/LoginPage';

import type {
  AuthSession,
} from '../features/auth/types/auth';

import {
  CreateProductPanel,
} from '../features/products/components/CreateProductPanel';

import {
  useProducts,
} from '../features/products/hooks/use-products';

import styles from './App.module.css';

type AuthenticationState =
  | {
      readonly status:
        'loading';
    }
  | {
      readonly status:
        'unauthenticated';
    }
  | {
      readonly status:
        'authenticated';

      readonly session:
        AuthSession;
    };

export function App() {
  const [
    authentication,
    setAuthentication,
  ] =
    useState<
      AuthenticationState
    >({
      status:
        'loading',
    });

  useEffect(
    () => {
      let active =
        true;

      async function restoreSession():
      Promise<void> {
        try {
          const session =
            await getSession();

          if (
            !active
          ) {
            return;
          }

          setAuthentication({
            status:
              'authenticated',

            session,
          });
        } catch (error) {
          if (
            !active
          ) {
            return;
          }

          if (
            error instanceof
              AuthApiError
            &&
            error.status ===
              401
          ) {
            setAuthentication({
              status:
                'unauthenticated',
            });

            return;
          }

          /*
           * Neste estágio, uma falha
           * para restaurar sessão deixa
           * o usuário na tela de login.
           *
           * Depois podemos adicionar uma
           * tela específica para API
           * indisponível.
           */
          setAuthentication({
            status:
              'unauthenticated',
          });
        }
      }

      void restoreSession();

      return () => {
        active =
          false;
      };
    },
    [],
  );

  async function handleLogin(
    email:
      string,

    password:
      string,
  ): Promise<void> {
    await login({
      email,
      password,
    });

    /*
     * Não confiamos em estado local
     * derivado do POST /login.
     *
     * Consultamos a fonte canônica:
     * GET /auth/session.
     */
    const session =
      await getSession();

    setAuthentication({
      status:
        'authenticated',

      session,
    });
  }

  async function handleLogout():
  Promise<void> {
    try {
      await logout();
    } finally {
      setAuthentication({
        status:
          'unauthenticated',
      });
    }
  }

  if (
    authentication.status ===
    'loading'
  ) {
    return (
      <div
        className={
          styles.authLoading
        }
      >
        <div
          className={
            styles.authLoadingBrand
          }
        >
          V
        </div>

        <span>
          Carregando Versa...
        </span>
      </div>
    );
  }

  if (
    authentication.status ===
    'unauthenticated'
  ) {
    return (
      <LoginPage
        onLogin={
          handleLogin
        }
      />
    );
  }

  return (
    <AuthenticatedApp
      session={
        authentication.session
      }
      onLogout={
        handleLogout
      }
    />
  );
}

interface AuthenticatedAppProps {
  readonly session:
    AuthSession;

  readonly onLogout:
    () => Promise<void>;
}

function AuthenticatedApp({
  session,
  onLogout,
}: AuthenticatedAppProps) {
  const {
    products,

    loading:
      productsLoading,

    error:
      productsError,

    reload:
      reloadProducts,
  } =
    useProducts();

  const [
    createProductOpen,
    setCreateProductOpen,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const displayName =
    session.user
      .displayName;

  const firstName =
    displayName
      .trim()
      .split(/\s+/)[0]
      ?? displayName;

  const userInitial =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase()
      || '?';

  const roleLabel =
    session.activeTenant
      ?.role ===
        'owner'
      ? 'Proprietário'
      : session.activeTenant
          ?.role ===
            'admin'
        ? 'Administrador'
        : session.activeTenant
            ?.role ===
              'member'
          ? 'Membro'
          : 'Sem empresa ativa';

  async function handleLogoutClick():
  Promise<void> {
    setLoggingOut(
      true,
    );

    try {
      await onLogout();
    } finally {
      setLoggingOut(
        false,
      );
    }
  }

  return (
    <div
      className={
        styles.app
      }
    >
      <aside
        className={
          styles.sidebar
        }
      >
        <div
          className={
            styles.brand
          }
        >
          <div
            className={
              styles.brandMark
            }
          >
            V
          </div>

          <div
            className={
              styles.brandText
            }
          >
            <strong>
              VERSA
            </strong>

            <span>
              PLATFORM
            </span>
          </div>
        </div>

        <nav
          className={
            styles.navigation
          }
          aria-label="Navegação principal"
        >
          <a
            className={
              styles.activeNavigationItem
            }
            href="#overview"
          >
            <span
              className={
                styles.navigationIcon
              }
            >
              ⌂
            </span>

            Início
          </a>

          <div
            className={
              styles.navigationGroup
            }
          >
            <span
              className={
                styles.navigationGroupTitle
              }
            >
              Workspaces
            </span>

            <a
              className={
                styles.navigationItem
              }
              href="#products"
            >
              <span
                className={`${styles.workspaceIcon} ${styles.productIcon}`}
              >
                P
              </span>

              Produto
            </a>

            <span
              className={
                styles.disabledNavigationItem
              }
            >
              <span
                className={`${styles.workspaceIcon} ${styles.customerIcon}`}
              >
                C
              </span>

              Cliente
            </span>

            <span
              className={
                styles.disabledNavigationItem
              }
            >
              <span
                className={`${styles.workspaceIcon} ${styles.campaignIcon}`}
              >
                M
              </span>

              Campanhas
            </span>

            <span
              className={
                styles.disabledNavigationItem
              }
            >
              <span
                className={`${styles.workspaceIcon} ${styles.supplierIcon}`}
              >
                F
              </span>

              Fornecedor
            </span>
          </div>

          <div
            className={
              styles.navigationGroup
            }
          >
            <span
              className={
                styles.navigationGroupTitle
              }
            >
              Inteligência
            </span>

            <span
              className={
                styles.disabledNavigationItem
              }
            >
              <span
                className={
                  styles.navigationIcon
                }
              >
                ◇
              </span>

              Insights
            </span>

            <span
              className={
                styles.disabledNavigationItem
              }
            >
              <span
                className={
                  styles.navigationIcon
                }
              >
                ⚙
              </span>

              Automações
            </span>
          </div>
        </nav>

        <div
          className={
            styles.sidebarFooter
          }
        >
          <div
            className={
              styles.user
            }
          >
            <div
              className={
                styles.avatar
              }
            >
              {userInitial}
            </div>

            <div
              className={
                styles.userText
              }
            >
              <strong>
                {displayName}
              </strong>

              <span>
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            className={
              styles.tenantButton
            }
            type="button"
            disabled={
              session.activeTenant ===
              null
            }
          >
            <span>
              {session.activeTenant ===
              null
                ? 'Selecionar empresa'
                : session.activeTenant.name}
            </span>

            <span>
              ⌄
            </span>
          </button>

          <button
            className={
              styles.logoutButton
            }
            type="button"
            disabled={
              loggingOut
            }
            onClick={() => {
              void handleLogoutClick();
            }}
          >
            {loggingOut
              ? 'Saindo...'
              : 'Sair'}
          </button>
        </div>
      </aside>

      <div
        className={
          styles.workspace
        }
      >
        <header
          className={
            styles.topbar
          }
        >
          <div
            className={
              styles.mobileBrand
            }
          >
            <div
              className={
                styles.mobileBrandMark
              }
            >
              V
            </div>

            <strong>
              VERSA
            </strong>
          </div>

          <div
            className={
              styles.topbarActions
            }
          >
            <div
              className={
                styles.search
              }
            >
              <span
                aria-hidden="true"
              >
                ⌕
              </span>

              <span>
                Buscar...
              </span>

              <kbd>
                ⌘ K
              </kbd>
            </div>

            <button
              className={
                styles.iconButton
              }
              type="button"
              aria-label="Notificações"
            >
              ♢
            </button>

            <button
              className={
                styles.iconButton
              }
              type="button"
              aria-label="Ajuda"
            >
              ?
            </button>

            <button
              className={
                styles.topbarAvatar
              }
              type="button"
              aria-label="Perfil"
            >
              {userInitial}
            </button>

            <button
              className={
                styles.mobileLogoutButton
              }
              type="button"
              disabled={
                loggingOut
              }
              onClick={() => {
                void handleLogoutClick();
              }}
            >
              Sair
            </button>

            <button
              className={
                styles.mobileMenuButton
              }
              type="button"
              aria-label="Abrir menu"
            >
              ☰
            </button>
          </div>
        </header>

        <main
          className={
            styles.main
          }
        >
          <section
            className={
              styles.pageHeader
            }
            id="overview"
          >
            <div>
              <h1>
                Olá, {firstName}! 👋
              </h1>

              <p>
                Aqui está o seu ambiente
                operacional Versa.
              </p>
            </div>

            <button
              className={
                styles.dateButton
              }
              type="button"
            >
              Hoje

              <span>
                ⌄
              </span>
            </button>
          </section>

          <section
            className={
              styles.metrics
            }
            aria-label="Resumo operacional"
          >
            <article
              className={
                styles.metricCard
              }
            >
              <div>
                <span
                  className={
                    styles.metricLabel
                  }
                >
                  Produtos
                </span>

                <strong>
                  {productsLoading
                    ? '...'
                    : products.length}
                </strong>
              </div>

              <span
                className={`${styles.metricIcon} ${styles.metricPurple}`}
              >
                P
              </span>

              <small>
                {productsError === null
                  ? 'Catálogo atual'
                  : 'Falha ao carregar'}
              </small>
            </article>

            <article
              className={
                styles.metricCard
              }
            >
              <div>
                <span
                  className={
                    styles.metricLabel
                  }
                >
                  Estoque
                </span>

                <strong>
                  —
                </strong>
              </div>

              <span
                className={`${styles.metricIcon} ${styles.metricGreen}`}
              >
                E
              </span>

              <small>
                Em breve
              </small>
            </article>

            <article
              className={
                styles.metricCard
              }
            >
              <div>
                <span
                  className={
                    styles.metricLabel
                  }
                >
                  Vendas
                </span>

                <strong>
                  —
                </strong>
              </div>

              <span
                className={`${styles.metricIcon} ${styles.metricBlue}`}
              >
                V
              </span>

              <small>
                Em breve
              </small>
            </article>

            <article
              className={
                styles.metricCard
              }
            >
              <div>
                <span
                  className={
                    styles.metricLabel
                  }
                >
                  Alertas
                </span>

                <strong>
                  —
                </strong>
              </div>

              <span
                className={`${styles.metricIcon} ${styles.metricOrange}`}
              >
                !
              </span>

              <small>
                Nenhum agora
              </small>
            </article>
          </section>

          <section
            className={
              styles.dashboardGrid
            }
          >
            <article
              className={
                styles.productsPanel
              }
              id="products"
            >
              <div
                className={
                  styles.panelHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.panelEyebrow
                    }
                  >
                    Workspace
                  </span>

                  <h2>
                    Produtos
                  </h2>

                  <p>
                    Gerencie o catálogo
                    da empresa ativa.
                  </p>
                </div>

                <button
                  className={
                    styles.primaryButton
                  }
                  type="button"
                  onClick={() => {
                    setCreateProductOpen(
                      true,
                    );
                  }}
                >
                  <span>
                    +
                  </span>

                  Novo produto
                </button>
              </div>

              {productsLoading ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <div
                    className={
                      styles.loadingIndicator
                    }
                  >
                    Carregando...
                  </div>

                  <p>
                    Buscando produtos
                    do catálogo.
                  </p>
                </div>
              ) : productsError !==
                null ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <div
                    className={
                      styles.errorIcon
                    }
                  >
                    !
                  </div>

                  <h3>
                    Não foi possível
                    carregar
                  </h3>

                  <p>
                    {productsError}
                  </p>
                </div>
              ) : products.length ===
                0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <div
                    className={
                      styles.emptyIcon
                    }
                  >
                    P
                  </div>

                  <h3>
                    Seu catálogo começa
                    aqui
                  </h3>

                  <p>
                    Cadastre seu primeiro
                    produto para começar
                    a construir o catálogo.
                  </p>

                  <button
                    className={
                      styles.secondaryButton
                    }
                    type="button"
                    onClick={() => {
                      setCreateProductOpen(
                        true,
                      );
                    }}
                  >
                    Cadastrar primeiro
                    produto
                  </button>
                </div>
              ) : (
                <div
                  className={
                    styles.productList
                  }
                >
                  {products.map(
                    (
                      product,
                    ) => (
                      <article
                        className={
                          styles.productRow
                        }
                        key={
                          product.id
                        }
                      >
                        <div
                          className={
                            styles.productIdentity
                          }
                        >
                          <div
                            className={
                              styles.productAvatar
                            }
                          >
                            {product.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span>
                              {
                                product.sku
                              }
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            styles.productStatus
                          }
                        >
                          {
                            product.status
                          }
                        </span>
                      </article>
                    ),
                  )}
                </div>
              )}
            </article>

            <aside
              className={
                styles.insightsPanel
              }
            >
              <div
                className={
                  styles.insightsHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.insightsEyebrow
                    }
                  >
                    Versa
                  </span>

                  <h2>
                    Visão operacional
                  </h2>
                </div>

                <span
                  className={
                    styles.newBadge
                  }
                >
                  Fase 2
                </span>
              </div>

              <div
                className={
                  styles.statusItem
                }
              >
                <span
                  className={
                    styles.statusIcon
                  }
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Sessão autenticada
                  </strong>

                  <p>
                    Identidade e empresa
                    resolvidas pelo backend.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.statusItem
                }
              >
                <span
                  className={
                    styles.statusIcon
                  }
                >
                  ✓
                </span>

                <div>
                  <strong>
                    API operacional
                  </strong>

                  <p>
                    Catálogo isolado por
                    tenant autenticado.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.statusItem
                }
              >
                <span
                  className={
                    styles.statusIcon
                  }
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Worker operacional
                  </strong>

                  <p>
                    Outbox, retry e
                    dead-letter.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>

      <CreateProductPanel
        open={
          createProductOpen
        }
        onClose={() => {
          setCreateProductOpen(
            false,
          );
        }}
        onCreated={
          reloadProducts
        }
      />
    </div>
  );
}