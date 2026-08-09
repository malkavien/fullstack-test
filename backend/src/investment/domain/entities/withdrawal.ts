import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';

interface CreateWithdrawalData {
  investmentId: string;
  amount: Decimal;
  gain: Decimal;
  tax: Decimal;
  finalAmount: Decimal;
  date: Date;
  id?: string;
}

export class Withdrawal {
  private readonly _id: string;

  private constructor(
    public readonly investmentId: string,
    public readonly amount: Decimal,
    public readonly gain: Decimal,
    public readonly tax: Decimal,
    public readonly finalAmount: Decimal,
    public readonly date: Date,
    id?: string,
  ) {
    this._id = id || randomUUID();
  }

  static create(data: CreateWithdrawalData): Withdrawal {
    if (!data.investmentId || data.investmentId.trim().length === 0) {
      throw new Error('Investment ID is required');
    }

    if (data.amount.isNegative() || data.amount.isZero()) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    if (data.gain.isNegative()) {
      throw new Error('Gain cannot be negative');
    }

    if (data.tax.isNegative()) {
      throw new Error('Tax cannot be negative');
    }

    if (data.finalAmount.isNegative()) {
      throw new Error('Final amount cannot be negative');
    }

    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    return new Withdrawal(
      data.investmentId.trim(),
      data.amount,
      data.gain,
      data.tax,
      data.finalAmount,
      date,
      data.id,
    );
  }

  get id(): string {
    return this._id;
  }
}