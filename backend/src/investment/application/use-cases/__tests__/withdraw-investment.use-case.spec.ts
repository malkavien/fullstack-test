import Decimal from 'decimal.js';
import { WithdrawInvestmentUseCase } from '../withdraw-investment.use-case';
import { IInvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';
import { DateUtils } from '../../../../common/utils/date-utils';

describe('WithdrawInvestmentUseCase', () => {
  let useCase: WithdrawInvestmentUseCase;
  let investmentRepository: jest.Mocked<IInvestmentRepository>;

  beforeEach(() => {
    investmentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };

    useCase = new WithdrawInvestmentUseCase(investmentRepository);
  });

  it('should withdraw an investment and return the withdrawal result', async () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    investmentRepository.findById.mockResolvedValue(investment);
    investmentRepository.update.mockResolvedValue(undefined);

    const result = await useCase.execute({
      id: 1,
      withdrawalDate,
    });

    expect(investmentRepository.findById).toHaveBeenCalledWith(1);
    expect(investmentRepository.update).toHaveBeenCalledWith(investment);

    expect(result.withdrawalDate).toEqual(withdrawalDate);
    expect(result.months).toBe(5);

    expect(result.withdrawalDate).toEqual(withdrawalDate);
    expect(result.months).toBe(5);
    expect(result.balance.toFixed(2)).toBe('1026.27');
    expect(result.gain.toFixed(2)).toBe('26.27');
    expect(result.taxRate.toFixed(3)).toBe('0.225');
    expect(result.tax.toFixed(2)).toBe('5.91');
    expect(result.finalAmount.toFixed(2)).toBe('1020.36');

    expect(result.gain).toBeInstanceOf(Decimal);
    expect(result.taxRate).toBeInstanceOf(Decimal);
    expect(result.tax).toBeInstanceOf(Decimal);
    expect(result.finalAmount).toBeInstanceOf(Decimal);
  });

  it('should throw an error when the investment does not exist', async () => {
    investmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 999,
        withdrawalDate: DateUtils.createDate(2026, 6, 1),
      }),
    ).rejects.toThrow('Investment not found');

    expect(investmentRepository.findById).toHaveBeenCalledWith(999);
    expect(investmentRepository.update).not.toHaveBeenCalled();
  });

  it('should mark the investment as withdrawn', async () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    const withdrawalDate = DateUtils.createDate(2026, 6, 1);

    investmentRepository.findById.mockResolvedValue(investment);
    investmentRepository.update.mockResolvedValue(undefined);

    await useCase.execute({
      id: 1,
      withdrawalDate,
    });

    expect(investment.getWithdrawalDate()).toEqual(withdrawalDate);
  });

  it('should persist the investment after withdrawal', async () => {
    const investment = Investment.create({
      owner: 'Rafael',
      amount: new Decimal('1000.00'),
      createdAt: DateUtils.createDate(2026, 1, 1),
    });

    investmentRepository.findById.mockResolvedValue(investment);
    investmentRepository.update.mockResolvedValue(undefined);

    await useCase.execute({
      id: 1,
      withdrawalDate: DateUtils.createDate(2026, 6, 1),
    });

    expect(investmentRepository.update).toHaveBeenCalledTimes(1);
    expect(investmentRepository.update).toHaveBeenCalledWith(investment);
  });
});
