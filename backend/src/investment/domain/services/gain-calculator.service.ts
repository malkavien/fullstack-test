import Decimal from 'decimal.js';
import { DateUtils } from '../../../common/utils/data-utils';

const MONTHLY_INTEREST_RATE = new Decimal('0.0052');

export interface GainCalculationParams {
  amount: Decimal;
  createdAt: Date;
  calculationDate: Date;
}

export interface GainCalculationResult {
  months: number;
  balance: Decimal;
  gain: Decimal;
}

export class GainCalculator {
  static calculateBalance(params: GainCalculationParams): Decimal {
    const months = this.calculateCompleteMonths(
      params.createdAt,
      params.calculationDate
    );

    if (months === 0) {
      return params.amount;
    }

    const factor = new Decimal(1).add(MONTHLY_INTEREST_RATE).pow(months);
    const balance = params.amount.mul(factor);

    return balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  static calculateGain(params: GainCalculationParams): Decimal {
    const balance = this.calculateBalance(params);
    const gain = balance.minus(params.amount);
    return gain.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  static calculateFull(params: GainCalculationParams): GainCalculationResult {
    const months = this.calculateCompleteMonths(
      params.createdAt,
      params.calculationDate
    );

    const balance = this.calculateBalance(params);
    const gain = balance.minus(params.amount);

    return {
      months,
      balance: balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      gain: gain.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    };
  }

  private static calculateCompleteMonths(
    createdAt: Date,
    calculationDate: Date,
  ): number {
    const createdAtUTC = DateUtils.normalizeToUTC(createdAt);
    const calculationDateUTC = DateUtils.normalizeToUTC(calculationDate);

    const createdAtYear = createdAtUTC.getUTCFullYear();
    const createdAtMonth = createdAtUTC.getUTCMonth();
    const createdAtDay = createdAtUTC.getUTCDate();

    const targetYear = calculationDateUTC.getUTCFullYear();
    const targetMonth = calculationDateUTC.getUTCMonth();
    const targetDay = calculationDateUTC.getUTCDate();

    let months =
      (targetYear - createdAtYear) * 12 + (targetMonth - createdAtMonth);

    if (targetDay < createdAtDay) {
      months--;
    }

    return Math.max(0, months);
  }
}