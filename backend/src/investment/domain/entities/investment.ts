import Decimal from 'decimal.js';
import { DateUtils } from '../../../common/utils/date-utils';

const MONTHLY_INTEREST_RATE = new Decimal('0.0052');

interface CreateInvestmentData {
  owner: string;
  amount: Decimal;
  createdAt: Date;
  withdrawalDate?: Date | null;
}

export class Investment {
  private constructor(
    public readonly owner: string,
    public readonly amount: Decimal,
    public readonly createdAt: Date,
    public readonly withdrawalDate?: Date | null,
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

    return new Investment(data.owner.trim(), data.amount, createdAt, data.withdrawalDate);
  }

  public calculateBalance(date: Date): Decimal {
    const months = this.calculateCompleteMonths(date);
    const factor = new Decimal(1).add(MONTHLY_INTEREST_RATE).pow(months);
    const balance = this.amount.mul(factor);
    return balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  withdraw(date: Date): Date {
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

    return normalizedDate;
  }

  private calculateCompleteMonths(date: Date): number {
    const createdAtYear = this.createdAt.getUTCFullYear();
    const createdAtMonth = this.createdAt.getUTCMonth();
    const createdAtDay = this.createdAt.getUTCDate();

    const targetYear = date.getUTCFullYear();
    const targetMonth = date.getUTCMonth();
    const targetDay = date.getUTCDate();

    let months =
      (targetYear - createdAtYear) * 12 + (targetMonth - createdAtMonth);

    if (targetDay < createdAtDay) {
      months--;
    }

    return Math.max(0, months);
  }

  isWithdrawn(): boolean {
    return this.withdrawalDate !== null;
  }

  getWithdrawalDate(): Date | null | undefined {
    return this.withdrawalDate;
  }
}
