import { Injectable, NotFoundException } from '@nestjs/common';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';
import Decimal from 'decimal.js';
import { GainCalculator } from '../../domain';

export interface InvestmentDetailsResponse {
  id: number | null;
  owner: string;
  amount: Decimal;
  createdAt: Date;
  withdrawalDate: Date | null;
  currentAmount: Decimal;
}
@Injectable()
export class GetInvestmentByIdUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(id: number): Promise<InvestmentDetailsResponse> {
    const investment = await this.investmentRepository.findById(id);

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    const currentAmount = investment.isWithdrawn()
      ? new Decimal(0)
      : GainCalculator.calculateBalance({
          amount: investment.amount,
          createdAt: investment.createdAt,
          calculationDate: new Date(),
        });

    return {
      id: investment.id,
      owner: investment.owner,
      amount: investment.amount,
      createdAt: investment.createdAt,
      withdrawalDate: investment.getWithdrawalDate(),
      currentAmount,
    };
  }
}
