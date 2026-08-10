import { api } from './api';
import type {
  Investment,
  PaginatedInvestmentResponse,
} from '../types/investment';

export interface GetInvestmentsParams {
  page?: number;
  limit?: number;
}

export interface CreateInvestmentParams {
  owner: string;
  amount: number;
  createdAt: string;
}

export interface WithdrawInvestmentParams {
  withdrawalDate: string;
}

export interface WithdrawInvestmentResponse {
  investmentId: number;
  amount: string;
  tax: string;
  finalAmount: string;
}

export async function getInvestments(
  params: GetInvestmentsParams = {},
  signal?: AbortSignal,
): Promise<PaginatedInvestmentResponse> {
  const response = await api.get<PaginatedInvestmentResponse>(
    '/investments',
    {
      params,
      signal,
    },
  );

  return response.data;
}

export async function getInvestmentById(
  id: number,
): Promise<Investment> {
  const response = await api.get<Investment>(
    `/investments/${id}`,
  );

  return response.data;
}

export async function createInvestment(
  params: CreateInvestmentParams,
): Promise<Investment> {
  const response = await api.post<Investment>(
    '/investments',
    params,
  );

  return response.data;
}

export async function withdrawInvestment(
  id: number,
  params: WithdrawInvestmentParams,
): Promise<WithdrawInvestmentResponse> {
  const response = await api.post<WithdrawInvestmentResponse>(
    `/investments/${id}/withdraw`,
    params,
  );

  return response.data;
}