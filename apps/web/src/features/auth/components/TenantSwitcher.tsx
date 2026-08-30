import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useAvailableTenants,
} from '../hooks/use-available-tenants';

import type {
  ActiveTenant,
  AvailableTenant,
} from '../types/auth';

import styles from './TenantSwitcher.module.css';

interface TenantSwitcherProps {
  readonly activeTenant:
    ActiveTenant;

  readonly onSelectTenant:
    (
      tenantId:
        string,
    ) => Promise<void>;

  readonly variant:
    'sidebar'
    | 'mobile';
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

export function TenantSwitcher({
  activeTenant,
  onSelectTenant,
  variant,
}: TenantSwitcherProps) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    switchingTenantId,
    setSwitchingTenantId,
  ] =
    useState<
      string | null
    >(null);

  const [
    actionError,
    setActionError,
  ] =
    useState<
      string | null
    >(null);

  const rootRef =
    useRef<
      HTMLDivElement
    >(null);

  const {
    tenants,
    loading,
    error,
    reload,
  } =
    useAvailableTenants(
      open,
    );

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      function handlePointerDown(
        event:
          MouseEvent,
      ): void {
        const target =
          event.target;

        if (
          !(target instanceof Node)
        ) {
          return;
        }

        if (
          rootRef.current
            ?.contains(
              target,
            )
        ) {
          return;
        }

        setOpen(
          false,
        );
      }

      document.addEventListener(
        'mousedown',
        handlePointerDown,
      );

      return () => {
        document.removeEventListener(
          'mousedown',
          handlePointerDown,
        );
      };
    },
    [
      open,
    ],
  );

  async function handleSelect(
    tenantId:
      string,
  ): Promise<void> {
    if (
      tenantId ===
      activeTenant.id
    ) {
      setOpen(
        false,
      );

      return;
    }

    setSwitchingTenantId(
      tenantId,
    );

    setActionError(
      null,
    );

    try {
      /*
       * O estado visual atual só muda
       * depois que o backend confirmar
       * a nova sessão.
       */
      await onSelectTenant(
        tenantId,
      );

      setOpen(
        false,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível trocar de empresa.',
      );
    } finally {
      setSwitchingTenantId(
        null,
      );
    }
  }

  const rootClassName =
    variant ===
      'sidebar'
      ? styles.sidebarRoot
      : styles.mobileRoot;

  const buttonClassName =
    variant ===
      'sidebar'
      ? styles.sidebarButton
      : styles.mobileButton;

  const menuClassName =
    variant ===
      'sidebar'
      ? styles.sidebarMenu
      : styles.mobileMenu;

  return (
    <div
      className={
        rootClassName
      }
      ref={
        rootRef
      }
    >
      <button
        className={
          buttonClassName
        }
        type="button"
        aria-haspopup="menu"
        aria-expanded={
          open
        }
        onClick={() => {
          setOpen(
            (
              current,
            ) =>
              !current,
          );

          setActionError(
            null,
          );
        }}
      >
        {variant ===
        'sidebar' ? (
          <>
            <span
              className={
                styles.buttonTenantName
              }
            >
              {activeTenant.name}
            </span>

            <span
              aria-hidden="true"
            >
              ⌄
            </span>
          </>
        ) : (
          <>
            <span
              className={
                styles.mobileTenantMark
              }
            >
              {activeTenant.name
                .trim()
                .charAt(0)
                .toUpperCase()
                || 'E'}
            </span>

            <span
              className={
                styles.mobileTenantName
              }
            >
              {activeTenant.name}
            </span>

            <span
              aria-hidden="true"
            >
              ⌄
            </span>
          </>
        )}
      </button>

      {open ? (
        <div
          className={
            menuClassName
          }
          role="menu"
        >
          <div
            className={
              styles.menuHeader
            }
          >
            <strong>
              Empresas
            </strong>

            <span>
              Trocar contexto
            </span>
          </div>

          {loading ? (
            <div
              className={
                styles.menuState
              }
            >
              Carregando...
            </div>
          ) : error !== null ? (
            <div
              className={
                styles.menuError
              }
            >
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() => {
                  void reload();
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div
              className={
                styles.options
              }
            >
              {tenants.map(
                (
                  tenant,
                ) => {
                  const selected =
                    tenant.id ===
                    activeTenant.id;

                  const switching =
                    tenant.id ===
                    switchingTenantId;

                  return (
                    <button
                      className={
                        selected
                          ? styles.selectedOption
                          : styles.option
                      }
                      type="button"
                      role="menuitem"
                      key={
                        tenant.id
                      }
                      disabled={
                        switchingTenantId !==
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
                          styles.optionMark
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
                          styles.optionText
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
                          styles.optionStatus
                        }
                      >
                        {switching
                          ? '...'
                          : selected
                            ? '✓'
                            : ''}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {actionError !==
          null ? (
            <div
              className={
                styles.actionError
              }
              role="alert"
            >
              {actionError}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}