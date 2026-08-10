export interface Investment {
  id: number;
  owner: string;
  amount: string;
  createdAt: string;
  withdrawalDate: string | null;
}

export interface PaginatedInvestmentResponse {
  data: Investment[];
  total: number;
  page: number;
  lastPage: number;
}

export interface WithdrawalResponse extends Investment {
  finalAmount: string;
  tax: string;
  profit: string;
  months: number;
}