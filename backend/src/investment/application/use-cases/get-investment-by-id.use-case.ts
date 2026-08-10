import { Injectable, NotFoundException } from '@nestjs/common';
import { Investment } from '../../domain/entities/investment';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';

@Injectable()
export class GetInvestmentByIdUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(id: number): Promise<Investment> {
    const investment = await this.investmentRepository.findById(id);

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    return investment;
  }
}
