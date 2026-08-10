import { Test, TestingModule } from '@nestjs/testing';
import Decimal from 'decimal.js';
import { CreateInvestmentUseCase } from '../create-investment.use-case';
import { IInvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';
import { DateUtils } from '../../../../common/utils/date-utils';

const mockRepository = {
  save: jest.fn((investment: Investment) => Promise.resolve(investment)),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
};

describe('CreateInvestmentUseCase', () => {
  let useCase: CreateInvestmentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvestmentUseCase,
        {
          provide: IInvestmentRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateInvestmentUseCase>(CreateInvestmentUseCase);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an investment successfully', async () => {
    const input = {
      owner: 'Rafael',
      amount: 1000.0,
      createdAt: DateUtils.createDate(2026, 1, 1),
    };

    const result = await useCase.execute(input);

    expect(result).toBeInstanceOf(Investment);
    expect(result.owner).toBe('Rafael');
    expect(result.amount.equals(new Decimal('1000.00'))).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledWith(result);
  });

  it('should throw error when owner is empty', async () => {
    const input = {
      owner: '',
      amount: 1000.0,
      createdAt: DateUtils.createDate(2026, 1, 1),
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Owner name is required',
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when amount is negative', async () => {
    const input = {
      owner: 'Rafael',
      amount: -100.0,
      createdAt: DateUtils.createDate(2026, 1, 1),
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Investment amount cannot be negative',
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
