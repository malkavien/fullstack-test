import { Test, TestingModule } from '@nestjs/testing';
import { GetInvestmentsUseCase } from '../get-investments.use-case';
import { IInvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';
import { DateUtils } from '../../../../common/utils/date-utils';
import Decimal from 'decimal.js';

const mockRepository = {
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
};

describe('GetInvestmentsUseCase', () => {
  let useCase: GetInvestmentsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetInvestmentsUseCase,
        {
          provide: IInvestmentRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetInvestmentsUseCase>(GetInvestmentsUseCase);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated investments', async () => {
    const investments = [
      Investment.create({
        owner: 'Rafael',
        amount: new Decimal('1000.00'),
        createdAt: DateUtils.createDate(2026, 1, 1),
      }),
    ];

    mockRepository.findAll.mockResolvedValue({
      data: investments,
      total: 1,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(1);
    expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should return empty list when no investments', async () => {
    mockRepository.findAll.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(0);
  });
});
