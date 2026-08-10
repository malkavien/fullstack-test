import { useState, useEffect } from 'react';
import { getInvestments, type GetInvestmentsParams } from '../services/investment.service';
import type { PaginatedInvestmentResponse } from '../types/investment';

export function useInvestments(initialParams: GetInvestmentsParams = { page: 1, limit: 10 }) {
  const [data, setData] = useState<PaginatedInvestmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const result = await getInvestments(initialParams);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted && err instanceof Error && err.name !== 'AbortError') {
          setError('Não foi possível carregar os investimentos.');
          console.error('Erro:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialParams.page, initialParams.limit]);

  const refetch = async (params: GetInvestmentsParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvestments(params);
      setData(result);
    } catch (err) {
      setError('Não foi possível carregar os investimentos.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}