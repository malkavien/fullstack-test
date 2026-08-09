import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InvestmentRepository } from '../interfaces/investment-repository.interface'; 
import { WithdrawalInput } from '../dtos/withdrawal/withdrawal.dto';
import { DateUtils } from '../../../common/utils/date-utils';
import { WithdrawalResponse } from '../dtos/withdrawal/withdrawal-response.dto';

@Injectable()
export class WithdrawalInvestmentUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(input: WithdrawalInput): Promise<WithdrawalResponse> {
    const investment = await this.investmentRepository.findById(
      input.investmentId,
    );

    if (!investment) {
      throw new NotFoundException(
        `Investment with ID ${input.investmentId} not found`,
      );
    }

    const withdrawalDate = DateUtils.normalizeToUTC(input.date);
    const now = DateUtils.normalizeToUTC(new Date());

    if (withdrawalDate > now) {
      throw new BadRequestException('Withdrawal date cannot be in the future');
    }

    const withdrawal = investment.withdraw(withdrawalDate);

    await this.investmentRepository.save(investment);

    return {
      amount: withdrawal.amount.toNumber(),
      gain: withdrawal.gain.toNumber(),
      tax: withdrawal.tax.toNumber(),
      finalAmount: withdrawal.finalAmount.toNumber(),
      date: withdrawal.date,
    };
  }
}
