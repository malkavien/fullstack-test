import { Investment } from '../../domain/entities/investment';

export abstract class IInvestmentRepository {
  abstract save(investment: Investment): Promise<void>;
  abstract findById(id: number): Promise<Investment | null>;
  abstract findAll(page: number, limit: number): Promise<{ data: Investment[]; total: number; }>;
  abstract count(): Promise<number>;
  abstract update(investment: Investment): Promise<void>;
}