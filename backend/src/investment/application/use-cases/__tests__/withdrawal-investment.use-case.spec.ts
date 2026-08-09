import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WithdrawalInvestmentUseCase } from '../withdrawal-investment.use-case';
import { InvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';
import { DateUtils } from '../../../../common/utils/date-utils';
import Decimal from 'decimal.js';

const createMockRepository = () => ({
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
});


describe('WithdrawalInvestmentUseCase', () => {
  let useCase: WithdrawalInvestmentUseCase;
  let mockRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalInvestmentUseCase,
        {
          provide: InvestmentRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<WithdrawalInvestmentUseCase>(WithdrawalInvestmentUseCase);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should withdraw an investment successfully', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 2, 1),
      };

      const result = await useCase.execute(input);

      expect(result.amount).toBe(1005.20);
      expect(result.gain).toBe(5.20);
      expect(result.tax).toBe(1.17);
      expect(result.finalAmount).toBe(1004.03);
      expect(result.date).toEqual(DateUtils.createDate(2026, 2, 1));
      expect(mockRepository.save).toHaveBeenCalledWith(investment);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should withdraw an investment with correct tax for less than 1 year', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 6, 1),
      };

      const result = await useCase.execute(input);

      expect(result.tax).toBeCloseTo(5.91, 2);
      expect(result.finalAmount).toBeCloseTo(1020.36, 2);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should withdraw an investment with correct tax for between 1 and 2 years', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2025, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 6, 1), // 17 meses
      };

      const result = await useCase.execute(input);

      const balance = new Decimal('1000.00').mul(new Decimal('1.0052').pow(17));
      const gain = balance.minus(new Decimal('1000.00'));
      const expectedTax = gain.mul(new Decimal('0.185'));
      const expectedFinal = balance.minus(expectedTax);

      expect(result.tax).toBeCloseTo(expectedTax.toNumber(), 2);
      expect(result.finalAmount).toBeCloseTo(expectedFinal.toNumber(), 2);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should withdraw an investment with correct tax for more than 2 years', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2023, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 6, 1), // 41 meses
      };

      const result = await useCase.execute(input);

      const balance = new Decimal('1000.00').mul(new Decimal('1.0052').pow(41));
      const gain = balance.minus(new Decimal('1000.00'));
      const expectedTax = gain.mul(new Decimal('0.15'));
      const expectedFinal = balance.minus(expectedTax);

      expect(result.tax).toBeCloseTo(expectedTax.toNumber(), 2);
      expect(result.finalAmount).toBeCloseTo(expectedFinal.toNumber(), 2);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should withdraw on the anniversary day', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 15),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 2, 15), // Dia do aniversário
      };

      const result = await useCase.execute(input);

      expect(result.gain).toBe(5.20);
      expect(result.tax).toBe(1.17);
      expect(result.finalAmount).toBe(1004.03);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('Error cases', () => {
    it('should throw error when investment not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const input = {
        investmentId: 'invalid-id',
        date: DateUtils.createDate(2026, 2, 1),
      };

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(input)).rejects.toThrow(
        `Investment with ID ${input.investmentId} not found`
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when withdrawal date is in the future', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2027, 1, 1), // Data futura
      };

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      await expect(useCase.execute(input)).rejects.toThrow(
        'Withdrawal date cannot be in the future'
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when withdrawal date is before creation date', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 2, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 1, 1), // Antes da criação
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Withdrawal date cannot be before investment creation date'
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when investment has already been withdrawn', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      investment.withdraw(DateUtils.createDate(2026, 2, 1));

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 3, 1),
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Investment has already been withdrawn'
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when repository findById fails', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database connection error'));

      const input = {
        investmentId: 'some-id',
        date: DateUtils.createDate(2026, 2, 1),
      };

      await expect(useCase.execute(input)).rejects.toThrow('Database connection error');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when repository save fails', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);
      mockRepository.save.mockRejectedValue(new Error('Database save error'));

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 2, 1),
      };

      await expect(useCase.execute(input)).rejects.toThrow('Database save error');
    });
  });

  describe('Edge cases', () => {
    it('should handle leap year correctly', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2024, 2, 29),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2025, 2, 28),
      };

      const result = await useCase.execute(input);

      const balance = new Decimal('1000.00').mul(new Decimal('1.0052').pow(11));
      const gain = balance.minus(new Decimal('1000.00'));
      const tax = gain.mul(new Decimal('0.225'));

      expect(result.gain).toBeCloseTo(gain.toNumber(), 2);
      expect(result.tax).toBeCloseTo(tax.toNumber(), 2);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle withdrawal on the same day as creation', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 1, 1), // Mesmo dia da criação
      };

      const result = await useCase.execute(input);

      expect(result.amount).toBe(1000.00);
      expect(result.gain).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.finalAmount).toBe(1000.00);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle withdrawal with large amounts', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('999999.99'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 2, 1),
      };

      const result = await useCase.execute(input);

      expect(result.amount).toBe(1005199.99);
      expect(result.gain).toBe(5200.00);
      expect(result.tax).toBe(1170.00);
      expect(result.finalAmount).toBe(1004029.99);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should preserve UTC date', async () => {
      const investment = Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      });

      mockRepository.findById.mockResolvedValue(investment);

      const input = {
        investmentId: investment.id,
        date: DateUtils.createDate(2026, 2, 1),
      };

      const result = await useCase.execute(input);

      expect(result.date.getUTCHours()).toBe(0);
      expect(result.date.getUTCMinutes()).toBe(0);
      expect(result.date.getUTCSeconds()).toBe(0);
      expect(result.date.getUTCMilliseconds()).toBe(0);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});