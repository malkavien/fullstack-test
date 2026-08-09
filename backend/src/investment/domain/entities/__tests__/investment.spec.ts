import Decimal from 'decimal.js';
import { Investment } from '../investment';
import { DateUtils } from '../../../../common/utils/data-utils';

describe('Investment', () => {
  it('should create an investment with valid data', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    expect(investment.owner).toBe('Rafael');
    expect(investment.amount.equals(new Decimal('1000.00'))).toBe(true);
    expect(investment.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(investment.isWithdrawn()).toBe(false);
  });

  it('should not create an investment with an empty owner', () => {
    expect(() =>
      Investment.create({
        owner: '',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ).toThrow('Owner name is required');
  });
  it('should create an investment with valid data', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    expect(investment.owner).toBe('Rafael');
    expect(investment.amount.equals(new Decimal('1000.00'))).toBe(true);
    expect(investment.createdAt).toEqual(DateUtils.createDate(2026, 1, 1));
  });

  it('should not create an investment with a negative amount', () => {
    expect(() =>
      Investment.create({
        owner: 'Rafael',
        amount: new Decimal('-100.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ).toThrow('Investment amount cannot be negative');
  });

  it('should not create an investment with zero amount', () => {
    expect(() =>
      Investment.create({
        owner: 'Rafael',
        amount: new Decimal('0'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ).toThrow('Investment amount must be greater than zero');
  });

  it('should not create an investment with a future creation date', () => {
    const futureDate = DateUtils.createDate(2027, 1, 1);

    expect(() =>
      Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: futureDate,
      }),
    ).toThrow('Investment creation date cannot be in the future');
  });

  it('should allow an investment created today', () => {
    const today = DateUtils.normalizeToUTC(new Date());

    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: today,
    });

    expect(investment.createdAt.toDateString()).toBe(today.toDateString());
  });

  it('should calculate 0.52% gain after one complete month', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2026, 2, 1),
    );

    expect(balance.toFixed(2)).toBe('1005.20');
  });

  it('should calculate compound gains after multiple complete months', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2026, 3, 1),
    );

    expect(balance.toFixed(2)).toBe('1010.43');
  });

  it('should not calculate gain before a complete month', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2026, 1, 31),
    );

    expect(balance.toFixed(2)).toBe('1000.00');
  });

  it('should not calculate gain before the investment anniversary day', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 15),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2026, 2, 14),
    );

    expect(balance.toFixed(2)).toBe('1000.00');
  });

  it('should calculate gain on the investment anniversary day', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 15),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2026, 2, 15),
    );

    expect(balance.toFixed(2)).toBe('1005.20');
  });

  it('should return withdrawal details', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawal = investment.withdraw(DateUtils.createDate(2026, 2, 1));

    expect(withdrawal.amount.toFixed(2)).toBe('1005.20');
    expect(withdrawal.gain.toFixed(2)).toBe('5.20');
    expect(withdrawal.tax.toFixed(2)).toBe('1.17');
    expect(withdrawal.finalAmount.toFixed(2)).toBe('1004.03');
  });

  it('should withdraw the investment with its current balance', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawal = investment.withdraw(DateUtils.createDate(2026, 2, 1));

    expect(withdrawal.amount.toFixed(2)).toBe('1005.20');
  });

  it('should not allow withdrawal before the investment creation date', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 2, 1),
    });

    expect(() => investment.withdraw(DateUtils.createDate(2026, 1, 1))).toThrow(
      'Withdrawal date cannot be before investment creation date',
    );
  });

  it('should not allow withdrawal in the future', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const futureDate = DateUtils.createDate(2027, 1, 1);

    expect(() => investment.withdraw(futureDate)).toThrow(
      'Withdrawal date cannot be in the future',
    );
  });

  it('should not allow withdrawing an investment more than once', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawalDate = DateUtils.createDate(2026, 2, 1);

    investment.withdraw(withdrawalDate);

    expect(() => investment.withdraw(withdrawalDate)).toThrow(
      'Investment has already been withdrawn',
    );
  });

  it('should apply 22.5% tax to gains when withdrawing an investment younger than one year', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawal = investment.withdraw(DateUtils.createDate(2026, 6, 1));

    expect(withdrawal.finalAmount.toFixed(2)).toBe('1020.36');
  });

  it('should apply 18.5% tax to gains when withdrawing an investment between one and two years old', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2025, 1, 1),
    });

    const withdrawal = investment.withdraw(DateUtils.createDate(2026, 6, 1));

    const balance = new Decimal('1000.00').mul(new Decimal('1.0052').pow(17));

    const gain = balance.minus(new Decimal('1000.00'));
    const tax = gain.mul(new Decimal('0.185'));
    const expectedFinalAmount = balance.minus(tax);

    expect(withdrawal.finalAmount.toFixed(2)).toBe(
      expectedFinalAmount.toFixed(2),
    );
  });

  it('should apply 15% tax to gains when withdrawing an investment older than two years', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2023, 1, 1),
    });

    const withdrawal = investment.withdraw(DateUtils.createDate(2026, 6, 1));

    const balance = new Decimal('1000.00').mul(new Decimal('1.0052').pow(41));

    const gain = balance.minus(new Decimal('1000.00'));
    const tax = gain.mul(new Decimal('0.15'));
    const expectedFinalAmount = balance.minus(tax);

    expect(withdrawal.finalAmount.toFixed(2)).toBe(
      expectedFinalAmount.toFixed(2),
    );
  });

  it('should handle investments created on February 29 (leap year)', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2024, 2, 29),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2025, 2, 28),
    );

    expect(balance).toBeDefined();
  });

  it('should handle large amounts with decimal precision', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('999999.99'),
      createdAt: DateUtils.createDate(2024, 1, 1),
    });

    const balance = investment.calculateBalance(
      DateUtils.createDate(2025, 1, 1),
    );

    expect(balance.decimalPlaces()).toBe(2);
  });

  it('should not create an investment with owner name only spaces', () => {
    expect(() =>
      Investment.create({
        owner: '   ',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2024, 1, 1),
      }),
    ).toThrow('Owner name is required');
  });

  it('should trim owner name automatically', () => {
    const investment = Investment.create({
      owner: '  Rafael  ',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2024, 1, 1),
    });

    expect(investment.owner).toBe('Rafael');
  });

  it('should handle complete investment lifecycle', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('5000.00'),
      createdAt: DateUtils.createDate(2024, 1, 1),
    });

    const balance6Months = investment.calculateBalance(
      DateUtils.createDate(2024, 7, 1),
    );
    expect(balance6Months.greaterThan(new Decimal('5000.00'))).toBe(true);

    const withdrawal = investment.withdraw(DateUtils.createDate(2025, 7, 1));

    expect(withdrawal.tax.greaterThan(new Decimal('0'))).toBe(true);
    expect(withdrawal.finalAmount.lessThan(withdrawal.amount)).toBe(true);

    expect(() => investment.withdraw(DateUtils.createDate(2025, 8, 1))).toThrow(
      'Investment has already been withdrawn',
    );
  });
});
