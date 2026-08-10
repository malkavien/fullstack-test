import { useState } from 'react';
import {
  withdrawInvestment,
  type WithdrawInvestmentParams,
  type WithdrawInvestmentResponse,
} from '../services/investment.service';

export function useWithdrawInvestment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    id: number,
    params: WithdrawInvestmentParams,
  ): Promise<WithdrawInvestmentResponse> => {
    setLoading(true);
    setError(null);

    try {
      return await withdrawInvestment(id, params);
    } catch (err) {
      console.error(
        'Erro ao sacar investimento:',
        err,
      );

      setError(
        'Não foi possível realizar o saque.',
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