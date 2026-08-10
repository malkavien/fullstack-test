import { Injectable } from '@nestjs/common';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';
import { PaginationInput } from '../dtos/shared/pagination.dto';
import { PaginatedResponse } from '../dtos/shared/pagination-response.dto';
import Decimal from 'decimal.js';
import { GainCalculator } from '../../domain';
import { InvestmentResponse } from '../dtos';

@Injectable()
export class GetInvestmentsUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(
    input: PaginationInput,
  ): Promise<PaginatedResponse<InvestmentResponse>> {
    const { page, limit } = input;

    const result = await this.investmentRepository.findAll(page, limit);

    const data: InvestmentResponse[] = result.data.map((investment) => {
      if (investment.id === null) {
        throw new Error('Investment retrieved from repository must have an ID');
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
        amount: investment.amount.toNumber(),
        currentAmount: currentAmount.toNumber(),
        createdAt: investment.createdAt,
        withdrawalDate: investment.getWithdrawalDate(),
      };
    });

    const balance = result.data.reduce((acc, investment) => {
      if (investment.isWithdrawn()) {
        return acc;
      }

      return acc.plus(new Decimal(investment.amount));
    }, new Decimal(0));

    return {
      data,
      total: result.total,
      page,
      lastPage: Math.ceil(result.total / limit),
      balance: balance.toNumber(),
    };
  }
}
