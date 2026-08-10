import { useEffect, useState } from 'react';
import {
  getInvestments,
  type GetInvestmentsParams,
} from '../services/investment.service';
import type { PaginatedInvestmentResponse } from '../types/investment';

export function useInvestments(
  initialParams: GetInvestmentsParams = {
    page: 1,
    limit: 10,
  },
) {
  const [data, setData] =
    useState<PaginatedInvestmentResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getInvestments(
          initialParams,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (
          !controller.signal.aborted &&
          err instanceof Error
        ) {
          setError(
            'Não foi possível carregar os investimentos.',
          );

          console.error('Erro:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [initialParams.page, initialParams.limit]);

  return {
    data,
    loading,
    error,
  };
}