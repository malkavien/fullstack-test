import { api } from './api';
import type {
  Investment,
  PaginatedInvestmentResponse,
} from '../types/investment';

export interface GetInvestmentsParams {
  page?: number;
  limit?: number;
}

let abortController: AbortController | null = null;

export async function getInvestments(
  params: GetInvestmentsParams = {},
): Promise<PaginatedInvestmentResponse> {
  if (abortController) {
    abortController.abort();
  }
  
  abortController = new AbortController();
  
  const response = await api.get<PaginatedInvestmentResponse>('/investments', {
    params,
    signal: abortController.signal,
  });

  return response.data;
}

export async function getInvestmentById(
  id: number,
): Promise<Investment> {
  const response = await api.get<Investment>(`/investments/${id}`);

  return response.data;
}