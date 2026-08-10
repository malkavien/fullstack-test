import { Investment as PrismaInvestment } from '../../../../generated/prisma/client';
import { Investment } from '../../../domain/entities/investment';
import Decimal from 'decimal.js';

export class InvestmentMapper {
  static toDomain(prismaInvestment: PrismaInvestment): Investment {
    return Investment.restore({
      id: prismaInvestment.id,
      owner: prismaInvestment.owner,
      amount: new Decimal(prismaInvestment.amount.toString()),
      createdAt: prismaInvestment.createdAt,
      withdrawalDate: prismaInvestment.withdrawalDate,
    });
  }

  static toPersistence(investment: Investment) {
    return {
      owner: investment.owner,
      amount: investment.amount.toFixed(2),
      createdAt: investment.createdAt,
      withdrawalDate: investment.getWithdrawalDate(),
    };
  }
}
