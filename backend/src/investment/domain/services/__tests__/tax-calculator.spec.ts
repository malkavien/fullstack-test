import Decimal from 'decimal.js';
import { TaxCalculator } from '../tax-calculator.service';

describe('TaxCalculator', () => {
  describe('getTaxRate', () => {
    it('should return 22.5% for investments younger than one year', () => {
      const taxRate = TaxCalculator.getTaxRate(5);

      expect(taxRate.toFixed(3)).toBe('0.225');
    });

    it('should return 18.5% for investments between one and two years', () => {
      const taxRate = TaxCalculator.getTaxRate(17);

      expect(taxRate.toFixed(3)).toBe('0.185');
    });

    it('should return 18.5% for exactly two years', () => {
      const taxRate = TaxCalculator.getTaxRate(24);

      expect(taxRate.toFixed(3)).toBe('0.185');
    });

    it('should return 15% for investments older than two years', () => {
      const taxRate = TaxCalculator.getTaxRate(25);

      expect(taxRate.toFixed(2)).toBe('0.15');
    });
  });

  describe('calculateTax', () => {
    it('should calculate 22.5% tax for less than one year', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('26.27'),
        balance: new Decimal('1026.27'),
        months: 5,
      });

      expect(tax.toFixed(2)).toBe('5.91');
    });

    it('should calculate 18.5% tax between one and two years', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('100.00'),
        balance: new Decimal('1100.00'),
        months: 17,
      });

      expect(tax.toFixed(2)).toBe('18.50');
    });

    it('should calculate 15% tax for more than two years', () => {
      const tax = TaxCalculator.calculateTax({
        gain: new Decimal('100.00'),
        balance: new Decimal('1100.00'),
        months: 25,
      });

      expect(tax.toFixed(2)).toBe('15.00');
    });
  });

  describe('calculateFull', () => {
    it('should return tax rate, tax and final amount for less than 1 year', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('26.27'),
        balance: new Decimal('1026.27'),
        months: 5,
      });

      expect(result.taxRate.toFixed(3)).toBe('0.225');
      expect(result.tax.toFixed(2)).toBe('5.91');
      expect(result.finalAmount.toFixed(2)).toBe('1020.36');
    });

    it('should return tax rate, tax and final amount for between 1 and 2 years', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('100.00'),
        balance: new Decimal('1100.00'),
        months: 17,
      });

      expect(result.taxRate.toFixed(3)).toBe('0.185');
      expect(result.tax.toFixed(2)).toBe('18.50');
      expect(result.finalAmount.toFixed(2)).toBe('1081.50');
    });

    it('should return tax rate, tax and final amount for more than 2 years', () => {
      const result = TaxCalculator.calculateFull({
        gain: new Decimal('100.00'),
        balance: new Decimal('1100.00'),
        months: 25,
      });

      expect(result.taxRate.toFixed(2)).toBe('0.15');
      expect(result.tax.toFixed(2)).toBe('15.00');
      expect(result.finalAmount.toFixed(2)).toBe('1085.00');
    });
  });

  describe('getTaxDescription', () => {
    it('should return the description for less than one year', () => {
      expect(TaxCalculator.getTaxDescription(5)).toBe('Menos de 1 ano - 22.5%');
    });

    it('should return the description for between one and two years', () => {
      expect(TaxCalculator.getTaxDescription(17)).toBe(
        'Entre 1 e 2 anos - 18.5%',
      );
    });

    it('should return the description for exactly two years', () => {
      expect(TaxCalculator.getTaxDescription(24)).toBe(
        'Entre 1 e 2 anos - 18.5%',
      );
    });

    it('should return the description for more than two years', () => {
      expect(TaxCalculator.getTaxDescription(25)).toBe('Mais de 2 anos - 15%');
    });
  });
});
