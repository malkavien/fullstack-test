import { Injectable, NotFoundException } from '@nestjs/common';
import { Investment } from '../../domain/entities/investment';
import { InvestmentRepository } from '../interfaces/investment-repository.interface';

@Injectable()
export class GetInvestmentByIdUseCase {
  constructor(
    private readonly investmentRepository: InvestmentRepository,
  ) {}

  async execute(id: string): Promise<Investment> {
    const investment = await this.investmentRepository.findById(id);

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    return investment;
  }
}