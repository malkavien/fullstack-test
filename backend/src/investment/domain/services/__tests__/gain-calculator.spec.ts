import Decimal from 'decimal.js';
import { GainCalculator } from '../gain-calculator.service';
import { DateUtils } from '../../../../common/utils/date-utils';

describe('GainCalculator', () => {
  const amount = new Decimal('1000.00');
  const createdAt = DateUtils.createDate(2026, 1, 1);

  describe('calculateBalance', () => {
    it('should calculate balance after one complete month', () => {
      const balance = GainCalculator.calculateBalance({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 2, 1),
      });

      expect(balance.toFixed(2)).toBe('1005.20');
    });

    it('should calculate compound gains after multiple months', () => {
      const balance = GainCalculator.calculateBalance({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 3, 1),
      });

      expect(balance.toFixed(2)).toBe('1010.43');
    });

    it('should not calculate gain before a complete month', () => {
      const balance = GainCalculator.calculateBalance({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 1, 31),
      });

      expect(balance.toFixed(2)).toBe('1000.00');
    });

    it('should return original amount if no complete months have passed', () => {
      const balance = GainCalculator.calculateBalance({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 1, 15),
      });

      expect(balance.toFixed(2)).toBe('1000.00');
    });

    it('should handle investments created on February 29 (leap year)', () => {
      const balance = GainCalculator.calculateBalance({
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2024, 2, 29),
        calculationDate: DateUtils.createDate(2025, 2, 28),
      });

      expect(balance.greaterThan(new Decimal('1000.00'))).toBe(true);
    });
  });

  describe('calculateGain', () => {
    it('should calculate gain after one month', () => {
      const gain = GainCalculator.calculateGain({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 2, 1),
      });

      expect(gain.toFixed(2)).toBe('5.20');
    });

    it('should calculate gain after multiple months', () => {
      const gain = GainCalculator.calculateGain({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 3, 1),
      });

      expect(gain.toFixed(2)).toBe('10.43');
    });
  });

  describe('calculateFull', () => {
    it('should return months, balance and gain', () => {
      const result = GainCalculator.calculateFull({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 2, 1),
      });

      expect(result.months).toBe(1);
      expect(result.balance.toFixed(2)).toBe('1005.20');
      expect(result.gain.toFixed(2)).toBe('5.20');
    });

    it('should return zero months for no complete months', () => {
      const result = GainCalculator.calculateFull({
        amount,
        createdAt,
        calculationDate: DateUtils.createDate(2026, 1, 15),
      });

      expect(result.months).toBe(0);
      expect(result.balance.toFixed(2)).toBe('1000.00');
      expect(result.gain.toFixed(2)).toBe('0.00');
    });
  });
});
