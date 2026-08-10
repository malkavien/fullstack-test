import { useCallback, useEffect, useState } from 'react';
import {
  getInvestments,
  type GetInvestmentsParams,
} from '../services/investment.service';
import type { PaginatedInvestmentResponse } from '../types/investment';

interface UseInvestmentsResult {
  data: PaginatedInvestmentResponse | null;
  loading: boolean;
  error: string | null;
  fetchInvestments: (params?: GetInvestmentsParams) => Promise<void>;
}

export function useInvestments(
  initialParams: GetInvestmentsParams = {
    page: 1,
    limit: 10,
  },
): UseInvestmentsResult {
  const [data, setData] = useState<PaginatedInvestmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = useCallback(
    async (params: GetInvestmentsParams = initialParams) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getInvestments(params);

        setData(result);
      } catch {
        setError('Não foi possível carregar os investimentos.');
      } finally {
        setLoading(false);
      }
    },
    [initialParams],
  );

  useEffect(() => {
    void fetchInvestments();
  }, [fetchInvestments]);

  return {
    data,
    loading,
    error,
    fetchInvestments,
  };
}