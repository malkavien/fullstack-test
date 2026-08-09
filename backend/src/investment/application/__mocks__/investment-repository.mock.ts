import { InvestmentRepository } from '../interfaces/investment-repository.interface';

export class MockInvestmentRepository implements InvestmentRepository {
  save = jest.fn().mockResolvedValue(undefined);
  findById = jest.fn().mockResolvedValue(null);
  findAll = jest.fn().mockResolvedValue([]);
  count = jest.fn().mockResolvedValue(0);
}