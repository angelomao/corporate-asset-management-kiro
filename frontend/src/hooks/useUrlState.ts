import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing state in URL search parameters
 * @returns Object with current params, update function, and clear function
 */
export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current parameters as an object
  const params = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  // Update specific parameters
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      
      return newParams;
    });
  }, [setSearchParams]);

  // Clear all parameters
  const clearParams = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Get a specific parameter value
  const getParam = useCallback((key: string, defaultValue: string = '') => {
    return searchParams.get(key) || defaultValue;
  }, [searchParams]);

  return {
    params,
    updateParams,
    clearParams,
    getParam,
  };
}