import { useEffect, useState } from 'react';
import { getInvestmentById } from '../services/investment.service';
import type { Investment } from '../types/investment';

export function useInvestment(id: number | undefined) {
  const [data, setData] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();

    const fetchInvestment = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getInvestmentById(id);

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(
            'Failed to load investment:',
            err,
          );

          setError(
            'Failed to load investment.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInvestment();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (!id) {
    return {
      data: null,
      loading: false,
      error: 'Invalid Investment',
    };
  }

  return {
    data,
    loading,
    error,
  };
}