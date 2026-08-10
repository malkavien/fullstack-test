import Decimal from 'decimal.js';
import { DateUtils } from '../../../common/utils/date-utils';

export interface CreateInvestmentData {
  owner: string;
  amount: Decimal;
  createdAt: Date;
}

export interface InvestmentData {
  id: number;
  owner: string;
  amount: Decimal;
  createdAt: Date;
  withdrawalDate: Date | null;
}

export class Investment {
  private constructor(
    public readonly id: number | null,
    public readonly owner: string,
    public readonly amount: Decimal,
    public readonly createdAt: Date,
    private withdrawalDate: Date | null,
  ) {}

  static create(data: CreateInvestmentData): Investment {
    if (!data.owner || data.owner.trim().length === 0) {
      throw new Error('Owner name is required');
    }

    if (data.amount.isZero()) {
      throw new Error('Investment amount must be greater than zero');
    }

    if (data.amount.isNegative()) {
      throw new Error('Investment amount cannot be negative');
    }

    const createdAt = DateUtils.normalizeToUTC(data.createdAt);

    const now = DateUtils.normalizeToUTC(new Date());

    if (createdAt > now) {
      throw new Error('Investment creation date cannot be in the future');
    }

    return new Investment(null, data.owner.trim(), data.amount, createdAt, null);
  }

  static restore(data: InvestmentData): Investment {
    return new Investment(
      data.id,
      data.owner,
      data.amount,
      data.createdAt,
      data.withdrawalDate,
    );
  }

  withdraw(date: Date): void {
    if (this.withdrawalDate !== null) {
      throw new Error('Investment has already been withdrawn');
    }

    const normalizedDate = DateUtils.normalizeToUTC(date);

    const createdAt = DateUtils.normalizeToUTC(this.createdAt);

    if (normalizedDate < createdAt) {
      throw new Error(
        'Withdrawal date cannot be before investment creation date',
      );
    }

    const now = DateUtils.normalizeToUTC(new Date());

    if (normalizedDate > now) {
      throw new Error('Withdrawal date cannot be in the future');
    }

    this.withdrawalDate = normalizedDate;
  }

  isWithdrawn(): boolean {
    return this.withdrawalDate !== null;
  }

  getWithdrawalDate(): Date | null {
    return this.withdrawalDate;
  }
}
