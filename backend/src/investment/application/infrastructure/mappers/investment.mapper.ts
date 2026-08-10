import { Investment as PrismaInvestment } from '@prisma/client';
import { Investment } from '../../../domain/entities/investment'; 

export class InvestmentMapper {
  static toDomain(prismaInvestment: PrismaInvestment): Investment {
    return new Investment({
      owner: prismaInvestment.owner,
      amount: Number(prismaInvestment.amount),
      createdAt: prismaInvestment.createdAt,
      updatedAt: prismaInvestment.updatedAt,
      withdrawalDate: prismaInvestment.withdrawalDate,
      id: prismaInvestment.id,
    });
  }

  static toPrisma(investment: Investment): any {
    return {
      id: investment.id,
      owner: investment.owner,
      amount: investment.amount,
      withdrawalDate: investment.withdrawalDate,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
    };
  }
}