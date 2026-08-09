import { Investment } from '../../domain/entities/investment';

export abstract class InvestmentRepository {
  abstract save(investment: Investment): Promise<void>;
  abstract findById(id: string): Promise<Investment | null>;
  abstract findAll(page: number, limit: number): Promise<Investment[]>;
  abstract count(): Promise<number>;
}