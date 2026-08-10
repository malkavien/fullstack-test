export interface Investment {
  id: number;
  owner: string;
  amount: string;
  createdAt: string;
  withdrawalDate: string | null;
  currentAmount: string;
}

export interface PaginatedInvestmentResponse {
  data: Investment[];
  total: number;
  page: number;
  lastPage: number;
  balance: string;
}

export interface WithdrawalResponse extends Investment {
  finalAmount: string;
  tax: string;
  profit: string;
  months: number;
}