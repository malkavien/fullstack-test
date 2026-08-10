import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { GainCalculator } from '../../domain/services/gain-calculator.service';
import { TaxCalculator } from '../../domain/services/tax-calculator.service';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';

export interface WithdrawInvestmentParams {
  id: number;
  withdrawalDate: Date;
}

export interface WithdrawalResult {
  withdrawalDate: Date;
  months: number;
  balance: Decimal;
  gain: Decimal;
  taxRate: Decimal;
  tax: Decimal;
  finalAmount: Decimal;
}

@Injectable()
export class WithdrawInvestmentUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(params: WithdrawInvestmentParams): Promise<WithdrawalResult> {
    const investment = await this.investmentRepository.findById(params.id);

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    investment.withdraw(params.withdrawalDate);

    const gainResult = GainCalculator.calculateFull({
      amount: investment.amount,
      createdAt: investment.createdAt,
      calculationDate: params.withdrawalDate,
    });

    const taxResult = TaxCalculator.calculateFull({
      gain: gainResult.gain,
      balance: gainResult.balance,
      months: gainResult.months,
    });

    await this.investmentRepository.update(investment);

    return {
      withdrawalDate: investment.getWithdrawalDate()!,
      months: gainResult.months,
      balance: gainResult.balance,
      gain: gainResult.gain,
      taxRate: taxResult.taxRate,
      tax: taxResult.tax,
      finalAmount: taxResult.finalAmount,
    };
  }
}
