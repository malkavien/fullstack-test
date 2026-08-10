import Decimal from 'decimal.js';

const TAX_RATE_LESS_THAN_1_YEAR = new Decimal('0.225');
const TAX_RATE_BETWEEN_1_AND_2_YEARS = new Decimal('0.185');
const TAX_RATE_MORE_THAN_2_YEARS = new Decimal('0.15');

export interface TaxCalculationParams {
  gain: Decimal;
  balance: Decimal;
  months: number;
}

export interface TaxCalculationResult {
  taxRate: Decimal;
  tax: Decimal;
  finalAmount: Decimal;
}

export class TaxCalculator {
  static getTaxRate(months: number): Decimal {
    const years = months / 12;

    if (years < 1) {
      return TAX_RATE_LESS_THAN_1_YEAR;
    } else if (years <= 2) {
      return TAX_RATE_BETWEEN_1_AND_2_YEARS;
    } else {
      return TAX_RATE_MORE_THAN_2_YEARS;
    }
  }

  static calculateTax(params: TaxCalculationParams): Decimal {
    const taxRate = this.getTaxRate(params.months);
    const tax = params.gain.mul(taxRate);
    return tax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  static calculateFull(params: TaxCalculationParams): TaxCalculationResult {
    const taxRate = this.getTaxRate(params.months);

    const tax = params.gain
      .mul(taxRate)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const finalAmount = params.balance
      .minus(tax)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      taxRate,
      tax,
      finalAmount,
    };
  }

  static getTaxDescription(months: number): string {
    const years = months / 12;

    if (years < 1) {
      return 'Menos de 1 ano - 22.5%';
    } else if (years <= 2) {
      return 'Entre 1 e 2 anos - 18.5%';
    } else {
      return 'Mais de 2 anos - 15%';
    }
  }
}
