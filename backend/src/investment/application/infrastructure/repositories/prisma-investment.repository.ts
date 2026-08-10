import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IInvestmentRepository } from '../../interfaces/investment-repository.interface';
import { Investment } from '../../../domain/entities/investment';

@Injectable()
export class PrismaInvestmentRepository implements IInvestmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(investment: Investment): Promise<Investment> {
    // Implementar
  }

  async findById(id: string): Promise<Investment | null> {
    // Implementar
  }

  async findAll(page: number, limit: number): Promise<{ data: Investment[]; total: number }> {
    // Implementar
  }

  async update(investment: Investment): Promise<Investment> {
    // Implementar
  }

}