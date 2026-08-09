import Decimal from 'decimal.js';
import { Withdrawal } from '../withdrawal';

describe('Withdrawal', () => {
  it('should create a valid withdrawal', () => {
    const withdrawal = Withdrawal.create({
      investmentId: '123e4567-e89b-12d3-a456-426614174000',
      amount: new Decimal('1005.20'),
      gain: new Decimal('5.20'),
      tax: new Decimal('1.17'),
      finalAmount: new Decimal('1004.03'),
      date: new Date('2026-02-01T00:00:00.000Z'),
    });

    expect(withdrawal.id).toBeDefined();
    expect(withdrawal.investmentId).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(withdrawal.amount.equals(new Decimal('1005.20'))).toBe(true);
  });

  it('should not create a withdrawal with negative final amount', () => {
    expect(() =>
      Withdrawal.create({
        investmentId: '123',
        amount: new Decimal('1000'),
        gain: new Decimal('-100'),
        tax: new Decimal('0'),
        finalAmount: new Decimal('900'),
        date: new Date(),
      }),
    ).toThrow('Gain cannot be negative');
  });
});
