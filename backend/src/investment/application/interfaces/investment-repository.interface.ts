import { Investment } from '../../domain/entities/investment';

export abstract class IInvestmentRepository {
  abstract save(investment: Investment): Promise<void>;
  abstract findById(id: number): Promise<Investment | null>;
  abstract findAll(page: number, limit: number): Promise<Investment[]>;
  abstract count(): Promise<number>;
}