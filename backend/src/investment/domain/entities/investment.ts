import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';
import { Withdrawal } from './withdrawal';
import { DateUtils } from '../../../common/utils/date-utils';

const MONTHLY_INTEREST_RATE = new Decimal('0.0052');
const TAX_RATE_LESS_THAN_1_YEAR = new Decimal('0.225');
const TAX_RATE_BETWEEN_1_AND_2_YEARS = new Decimal('0.185');
const TAX_RATE_MORE_THAN_2_YEARS = new Decimal('0.15');

interface CreateInvestmentData {
  owner: string;
  amount: Decimal;
  createdAt: Date;
  id?: string;
}

export class Investment {
  private withdrawalDate: Date | null = null;
  private _id: string;

  private constructor(
    public readonly owner: string,
    public readonly amount: Decimal,
    public readonly createdAt: Date,
    id?: string,
  ) {
    this._id = id || randomUUID();
  }

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

    return new Investment(data.owner.trim(), data.amount, createdAt, data.id);
  }

  get id(): string {
    return this._id;
  }

  public calculateBalance(date: Date): Decimal {
    const months = this.calculateCompleteMonths(date);
    const factor = new Decimal(1).add(MONTHLY_INTEREST_RATE).pow(months);
    const balance = this.amount.mul(factor);
    return balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  withdraw(date: Date): Withdrawal {
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

    const balance = this.calculateBalance(normalizedDate);
    const gain = balance.minus(this.amount);
    const months = this.calculateCompleteMonths(normalizedDate);
    const years = months / 12;

    let taxRate: Decimal;
    if (years < 1) {
      taxRate = TAX_RATE_LESS_THAN_1_YEAR;
    } else if (years <= 2) {
      taxRate = TAX_RATE_BETWEEN_1_AND_2_YEARS;
    } else {
      taxRate = TAX_RATE_MORE_THAN_2_YEARS;
    }

    const tax = gain.mul(taxRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const finalAmount = balance
      .minus(tax)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    this.withdrawalDate = normalizedDate;

    return Withdrawal.create({
      investmentId: this._id,
      amount: balance,
      gain: gain.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      tax,
      finalAmount,
      date: normalizedDate,
    });
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

  getWithdrawalDate(): Date | null {
    return this.withdrawalDate;
  }
}
