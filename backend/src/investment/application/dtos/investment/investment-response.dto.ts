export interface InvestmentResponse {
  id: string;
  owner: string;
  amount: number;
  currentAmount: number;
  createdAt: Date;
  withdrawalDate: Date | null;
}
