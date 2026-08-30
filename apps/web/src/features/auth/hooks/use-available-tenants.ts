import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getAvailableTenants,
} from '../api/auth-api';

import type {
  AvailableTenant,
} from '../types/auth';

export function useAvailableTenants(
  enabled:
    boolean,
) {
  const [
    tenants,
    setTenants,
  ] =
    useState<
      readonly AvailableTenant[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const reload =
    useCallback(
      async (): Promise<void> => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const result =
            await getAvailableTenants();

          setTenants(
            result,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar as empresas.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        !enabled
      ) {
        return;
      }

      void reload();
    },
    [
      enabled,
      reload,
    ],
  );

  return {
    tenants,
    loading,
    error,
    reload,
  };
}