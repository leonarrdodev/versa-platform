import {
  useState,
} from 'react';

import {
  useAvailableTenants,
} from '../hooks/use-available-tenants';

import type {
  AvailableTenant,
} from '../types/auth';

import styles from './TenantSelectionPage.module.css';

interface TenantSelectionPageProps {
  readonly displayName:
    string;

  readonly onSelectTenant:
    (
      tenantId:
        string,
    ) => Promise<void>;

  readonly onLogout:
    () => Promise<void>;
}

function getRoleLabel(
  role:
    AvailableTenant['role'],
): string {
  switch (
    role
  ) {
    case 'owner':
      return 'Proprietário';

    case 'admin':
      return 'Administrador';

    case 'member':
      return 'Membro';
  }
}

export function TenantSelectionPage({
  displayName,
  onSelectTenant,
  onLogout,
}: TenantSelectionPageProps) {
  const {
    tenants,
    loading,
    error,
    reload,
  } =
    useAvailableTenants(
      true,
    );

  const [
    selectingTenantId,
    setSelectingTenantId,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectionError,
    setSelectionError,
  ] =
    useState<
      string | null
    >(null);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  async function handleSelect(
    tenantId:
      string,
  ): Promise<void> {
    setSelectingTenantId(
      tenantId,
    );

    setSelectionError(
      null,
    );

    try {
      await onSelectTenant(
        tenantId,
      );
    } catch (error) {
      setSelectionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível selecionar a empresa.',
      );
    } finally {
      setSelectingTenantId(
        null,
      );
    }
  }

  async function handleLogout():
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
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.presentation
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

          <div>
            <strong>
              VERSA
            </strong>

            <span>
              PLATFORM
            </span>
          </div>
        </div>

        <div
          className={
            styles.presentationContent
          }
        >
          <span
            className={
              styles.eyebrow
            }
          >
            Contexto operacional
          </span>

          <h1>
            Escolha onde você quer
            trabalhar agora.
          </h1>

          <p>
            Cada empresa possui seu
            próprio catálogo, dados e
            contexto dentro da Versa.
          </p>
        </div>

        <span
          className={
            styles.presentationFooter
          }
        >
          Isolamento multiempresa
        </span>
      </section>

      <section
        className={
          styles.selectionArea
        }
      >
        <div
          className={
            styles.selectionCard
          }
        >
          <header
            className={
              styles.header
            }
          >
            <span>
              Olá, {displayName}
            </span>

            <h2>
              Selecione uma empresa
            </h2>

            <p>
              Você poderá trocar de
              empresa novamente dentro
              da plataforma.
            </p>
          </header>

          {loading ? (
            <div
              className={
                styles.state
              }
            >
              <div
                className={
                  styles.loadingBadge
                }
              >
                Carregando...
              </div>

              <p>
                Buscando suas empresas.
              </p>
            </div>
          ) : error !== null ? (
            <div
              className={
                styles.state
              }
            >
              <div
                className={
                  styles.errorBadge
                }
              >
                !
              </div>

              <strong>
                Não foi possível carregar
              </strong>

              <p>
                {error}
              </p>

              <button
                className={
                  styles.retryButton
                }
                type="button"
                onClick={() => {
                  void reload();
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : tenants.length ===
            0 ? (
            <div
              className={
                styles.state
              }
            >
              <div
                className={
                  styles.emptyBadge
                }
              >
                V
              </div>

              <strong>
                Nenhuma empresa disponível
              </strong>

              <p>
                Sua conta está autenticada,
                mas não possui uma empresa
                ativa disponível.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.tenantList
              }
            >
              {tenants.map(
                (
                  tenant,
                ) => {
                  const selecting =
                    selectingTenantId ===
                    tenant.id;

                  return (
                    <button
                      className={
                        styles.tenantCard
                      }
                      type="button"
                      key={
                        tenant.id
                      }
                      disabled={
                        selectingTenantId !==
                        null
                      }
                      onClick={() => {
                        void handleSelect(
                          tenant.id,
                        );
                      }}
                    >
                      <span
                        className={
                          styles.tenantMark
                        }
                      >
                        {tenant.name
                          .trim()
                          .charAt(0)
                          .toUpperCase()
                          || 'E'}
                      </span>

                      <span
                        className={
                          styles.tenantText
                        }
                      >
                        <strong>
                          {tenant.name}
                        </strong>

                        <small>
                          {getRoleLabel(
                            tenant.role,
                          )}
                        </small>
                      </span>

                      <span
                        className={
                          styles.tenantAction
                        }
                      >
                        {selecting
                          ? 'Entrando...'
                          : 'Acessar →'}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {selectionError !==
          null ? (
            <div
              className={
                styles.selectionError
              }
              role="alert"
            >
              {selectionError}
            </div>
          ) : null}

          <footer
            className={
              styles.footer
            }
          >
            <span>
              Sessão autenticada
            </span>

            <button
              type="button"
              disabled={
                loggingOut
              }
              onClick={() => {
                void handleLogout();
              }}
            >
              {loggingOut
                ? 'Saindo...'
                : 'Sair da conta'}
            </button>
          </footer>
        </div>
      </section>
    </main>
  );
}