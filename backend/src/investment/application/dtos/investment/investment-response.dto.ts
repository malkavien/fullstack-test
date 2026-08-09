export interface InvestmentResponse {
  id: string;
  owner: string;
  amount: number;
  createdAt: Date;
  balance: number;
  isWithdrawn: boolean;
  withdrawalDate: Date | null;
}