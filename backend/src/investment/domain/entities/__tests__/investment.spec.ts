import Decimal from 'decimal.js';
import { Investment } from '../investment';
import { DateUtils } from '../../../../common/utils/date-utils';

describe('Investment', () => {
  it('should create an investment with valid data', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    expect(investment.owner).toBe('Rafael');
    expect(investment.amount.equals(new Decimal('1000.00'))).toBe(true);
    expect(investment.createdAt.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
    expect(investment.isWithdrawn()).toBe(false);
    expect(investment.getWithdrawalDate()).toBeNull();
  });

  it('should trim owner name automatically', () => {
    const investment = Investment.create({
      owner: '  Rafael  ',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    expect(investment.owner).toBe('Rafael');
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

  it('should not create an investment with owner name containing only spaces', () => {
    expect(() =>
      Investment.create({
        owner: '   ',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ).toThrow('Owner name is required');
  });

  it('should not create an investment with a zero amount', () => {
    expect(() =>
      Investment.create({
        owner: 'Rafael',
        amount: new Decimal('0'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ).toThrow('Investment amount must be greater than zero');
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

    expect(investment.createdAt).toEqual(today);
    expect(investment.isWithdrawn()).toBe(false);
  });

  it('should withdraw an investment', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    investment.withdraw(withdrawalDate);

    expect(investment.isWithdrawn()).toBe(true);
    expect(investment.getWithdrawalDate()).toEqual(
      DateUtils.normalizeToUTC(withdrawalDate),
    );
  });

  it('should normalize withdrawal date to UTC', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    investment.withdraw(withdrawalDate);

    expect(investment.getWithdrawalDate()).toEqual(
      DateUtils.normalizeToUTC(withdrawalDate),
    );
  });

  it('should not allow withdrawal before the investment creation date', () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 2, 1),
    });

    expect(() =>
      investment.withdraw(DateUtils.createDate(2026, 1, 1)),
    ).toThrow('Withdrawal date cannot be before investment creation date');
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

    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    investment.withdraw(withdrawalDate);

    expect(() => investment.withdraw(withdrawalDate)).toThrow(
      'Investment has already been withdrawn',
    );
  });

  it('should restore an investment with withdrawal date', () => {
    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    const investment = Investment.restore({
      id: 1,
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
      withdrawalDate,
    });

    expect(investment.id).toBe(1);
    expect(investment.owner).toBe('Rafael');
    expect(investment.amount.equals(new Decimal('1000.00'))).toBe(true);
    expect(investment.createdAt).toEqual(
      DateUtils.createDate(2026, 1, 1),
    );
    expect(investment.getWithdrawalDate()).toEqual(withdrawalDate);
    expect(investment.isWithdrawn()).toBe(true);
  });

  it('should restore an active investment without withdrawal date', () => {
    const investment = Investment.restore({
      id: 1,
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
      withdrawalDate: null,
    });

    expect(investment.id).toBe(1);
    expect(investment.isWithdrawn()).toBe(false);
    expect(investment.getWithdrawalDate()).toBeNull();
  });
});
