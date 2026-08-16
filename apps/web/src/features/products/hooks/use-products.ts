import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getProducts,
} from '../api/products-api';

import type {
  Product,
} from '../types/product';

interface UseProductsResult {
  readonly products:
    readonly Product[];

  readonly loading:
    boolean;

  readonly error:
    string | null;

  readonly reload:
    () => Promise<void>;
}

export function useProducts():
UseProductsResult {
  const [
    products,
    setProducts,
  ] =
    useState<
      readonly Product[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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
        try {
          setLoading(
            true,
          );

          setError(
            null,
          );

          const page =
            await getProducts();

          setProducts(
            page.items,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Erro inesperado.',
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
      void reload();
    },
    [
      reload,
    ],
  );

  return {
    products,
    loading,
    error,
    reload,
  };
}