import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  CategoriesApiError,
  getCategories,
} from '../api/categories-api';

import type {
  Category,
} from '../types/category';

interface UseCategoriesResult {
  readonly categories:
    readonly Category[];

  readonly loading:
    boolean;

  readonly error:
    string | null;

  readonly reload:
    () => Promise<
      readonly Category[]
    >;
}

export function useCategories(
  enabled:
    boolean,
): UseCategoriesResult {
  const [
    categories,
    setCategories,
  ] =
    useState<
      readonly Category[]
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

  const loadCategories =
    useCallback(
      async (): Promise<
        readonly Category[]
      > => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const result =
            await getCategories();

          setCategories(
            result.items,
          );

          return result.items;
        } catch (error) {
          setCategories([]);

          if (
            error instanceof
            CategoriesApiError
          ) {
            setError(
              error.message,
            );
          } else {
            setError(
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar as categorias.',
            );
          }

          return [];
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

      void loadCategories();
    },
    [
      enabled,
      loadCategories,
    ],
  );

  return {
    categories,
    loading,
    error,
    reload:
      loadCategories,
  };
}