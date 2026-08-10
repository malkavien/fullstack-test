import { api } from './api';
import type {
  Investment,
  PaginatedInvestmentResponse,
} from '../types/investment';

export interface GetInvestmentsParams {
  page?: number;
  limit?: number;
}

export async function getInvestments(
  params: GetInvestmentsParams = {},
): Promise<PaginatedInvestmentResponse> {
  const response = await api.get<PaginatedInvestmentResponse>('/investments', {
    params,
  });

  return response.data;
}

export async function getInvestmentById(
  id: number,
): Promise<Investment> {
  const response = await api.get<Investment>(`/investments/${id}`);

  return response.data;
}