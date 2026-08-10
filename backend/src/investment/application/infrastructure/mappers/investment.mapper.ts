import { Investment as PrismaInvestment } from '@prisma/client';
import { Investment } from '../../../domain/entities/investment'; 

export class InvestmentMapper {
  static toDomain(prismaInvestment: PrismaInvestment): Investment {
    return new Investment({
      id: prismaInvestment.id,
      userId: prismaInvestment.userId,
      amount: Number(prismaInvestment.amount),
      type: prismaInvestment.type,
      status: prismaInvestment.status,
      startDate: prismaInvestment.startDate,
      endDate: prismaInvestment.endDate,
      expectedReturn: Number(prismaInvestment.expectedReturn),
      actualReturn: prismaInvestment.actualReturn ? Number(prismaInvestment.actualReturn) : undefined,
      createdAt: prismaInvestment.createdAt,
      updatedAt: prismaInvestment.updatedAt,
    });
  }

  static toPrisma(investment: Investment): any {
    return {
      id: investment.id,
      userId: investment.userId,
      amount: investment.amount,
      type: investment.type,
      status: investment.status,
      startDate: investment.startDate,
      endDate: investment.endDate,
      expectedReturn: investment.expectedReturn,
      actualReturn: investment.actualReturn,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
    };
  }
}