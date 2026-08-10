export interface InvestmentResponse {
  id: string;
  owner: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  withdrawalDate: Date | null;
}
