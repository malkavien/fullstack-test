import Decimal from 'decimal.js';
import { TaxCalculator } from '../tax-calculator.service';

describe('TaxCalculator', () => {
  describe('getTaxRate', () => {
    it('should return 22.5% for investments less than 1 year', () => {
      const rate = TaxCalculator.getTaxRate(6);
      expect(rate.toNumber()).toBe(0.225);
    });

    it('should return 18.5% for investments between 1 and 2 years', () => {
      const rate = TaxCalculator.getTaxRate(18);
      expect(rate.toNumber()).toBe(0.185);
    });

    it('should return 15% for investments older than 2 years', () => {
      const rate = TaxCalculator.getTaxRate(30);
      expect(rate.toNumber()).toBe(0.15);
    });

    it('should return 18.5% for exactly 2 years', () => {
      const rate = TaxCalculator.getTaxRate(24);
      expect(rate.toNumber()).toBe(0.185);
    });

    it('should return 18.5% for exactly 1 year', () => {
      const rate = TaxCalculator.getTaxRate(12);
      expect(rate.toNumber()).toBe(0.185);
    });

    it('should return 15% for 25 months (more than 2 years)', () => {
      const rate = TaxCalculator.getTaxRate(25);
      expect(rate.toNumber()).toBe(0.15);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly for less than 1 year', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('100.00'),
        months: 6,
      });

      expect(tax.toFixed(2)).toBe('22.50');
    });

    it('should calculate tax correctly for between 1 and 2 years', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('100.00'),
        months: 18,
      });

      expect(tax.toFixed(2)).toBe('18.50');
    });

    it('should calculate tax correctly for more than 2 years', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('100.00'),
        months: 30,
      });

      expect(tax.toFixed(2)).toBe('15.00');
    });

    it('should calculate tax as zero when gain is zero', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('0.00'),
        months: 6,
      });

      expect(tax.toFixed(2)).toBe('0.00');
    });
  });

  describe('calculateFull', () => {
    it('should return tax rate, tax and final amount for less than 1 year', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('5.20'),
        months: 1,
      });

      expect(result.taxRate.toNumber()).toBe(0.225);
      expect(result.tax.toFixed(2)).toBe('1.17');
      expect(result.finalAmount.toFixed(2)).toBe('4.03');
    });

    it('should return tax rate, tax and final amount for between 1 and 2 years', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('100.00'),
        months: 18,
      });

      expect(result.taxRate.toNumber()).toBe(0.185);
      expect(result.tax.toFixed(2)).toBe('18.50');
      expect(result.finalAmount.toFixed(2)).toBe('81.50');
    });

    it('should return tax rate, tax and final amount for more than 2 years', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('100.00'),
        months: 30,
      });

      expect(result.taxRate.toNumber()).toBe(0.15);
      expect(result.tax.toFixed(2)).toBe('15.00');
      expect(result.finalAmount.toFixed(2)).toBe('85.00');
    });
  });

  describe('getTaxDescription', () => {
    it('should return correct description for less than 1 year', () => {
      expect(TaxCalculator.getTaxDescription(6)).toBe('Menos de 1 ano - 22.5%');
    });

    it('should return correct description for between 1 and 2 years', () => {
      expect(TaxCalculator.getTaxDescription(18)).toBe('Entre 1 e 2 anos - 18.5%');
    });

    it('should return correct description for more than 2 years', () => {
      expect(TaxCalculator.getTaxDescription(30)).toBe('Mais de 2 anos - 15%');
    });

    it('should return correct description for exactly 2 years', () => {
      expect(TaxCalculator.getTaxDescription(24)).toBe('Entre 1 e 2 anos - 18.5%');
    });
  });
});