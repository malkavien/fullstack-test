import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { Investment } from '../../domain/entities/investment';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';
import { CreateInvestmentInput } from '../dtos/investment/create-investment.dto';

@Injectable()
export class CreateInvestmentUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(input: CreateInvestmentInput): Promise<Investment> {
    const investment = Investment.create({
      owner: input.owner,
      amount: new Decimal(input.amount),
      createdAt: input.createdAt,
    });

    return this.investmentRepository.save(investment);
  }
}
