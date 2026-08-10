import { IInvestmentRepository } from '../interfaces/investment-repository.interface';

export class MockInvestmentRepository implements IInvestmentRepository {
  save = jest.fn().mockResolvedValue(undefined);
  findById = jest.fn().mockResolvedValue(null);
  findAll = jest.fn().mockResolvedValue([]);
  count = jest.fn().mockResolvedValue(0);
  update = jest.fn().mockResolvedValue(undefined);
}
