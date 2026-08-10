import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IInvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';
import { InvestmentMapper } from '../mappers/investment.mapper';

@Injectable()
export class PrismaInvestmentRepository implements IInvestmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(investment: Investment): Promise<Investment> {
    const createdInvestment = await this.prisma.investment.create({
      data: InvestmentMapper.toPersistence(investment),
    });

    return InvestmentMapper.toDomain(createdInvestment);
  }

  async findById(id: number): Promise<Investment | null> {
    const investment = await this.prisma.investment.findUnique({
      where: {
        id,
      },
    });

    if (!investment) {
      return null;
    }

    return InvestmentMapper.toDomain(investment);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Investment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [investments, total] = await this.prisma.$transaction([
      this.prisma.investment.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.investment.count(),
    ]);

    return {
      data: investments.map((investment) =>
        InvestmentMapper.toDomain(investment),
      ),
      total,
    };
  }

  async update(investment: Investment): Promise<void> {
    if (investment.id === null) {
      throw new Error('Investment must have an id to be updated');
    }

    await this.prisma.investment.update({
      where: {
        id: investment.id,
      },
      data: InvestmentMapper.toPersistence(investment),
    });
  }
}
