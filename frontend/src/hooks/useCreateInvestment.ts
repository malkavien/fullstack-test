import { useState } from 'react';
import {
  createInvestment,
  type CreateInvestmentParams,
} from '../services/investment.service';

export function useCreateInvestment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    params: CreateInvestmentParams,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const investment = await createInvestment(params);

      return investment;
    } catch (err) {
      console.error('Failed to create investment:', err);

      setError(
        'Failed to create investment.',
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
  };
}