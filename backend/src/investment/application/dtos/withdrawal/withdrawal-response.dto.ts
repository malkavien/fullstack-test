export interface WithdrawalResponse {
  amount: number;
  gain: number;
  tax: number;
  finalAmount: number;
  date: Date;
}