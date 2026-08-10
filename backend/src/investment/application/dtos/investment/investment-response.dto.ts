export interface InvestmentResponse {
  id: number;
  owner: string;
  amount: number;
  currentAmount: number;
  createdAt: Date;
  withdrawalDate: Date | null;
}
