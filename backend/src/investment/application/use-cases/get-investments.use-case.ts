import { Injectable } from '@nestjs/common';
import { Investment } from '../../domain/entities/investment';
import { InvestmentRepository } from '../interfaces/investment-repository.interface';
import { PaginationInput } from '../dtos/shared/pagination.dto';
import { PaginatedResponse } from '../dtos/shared/pagination-response.dto';

@Injectable()
export class GetInvestmentsUseCase {
  constructor(
    private readonly investmentRepository: InvestmentRepository,
  ) {}

  async execute(input: PaginationInput): Promise<PaginatedResponse<Investment>> {
    const { page, limit } = input;

    const [data, total] = await Promise.all([
      this.investmentRepository.findAll(page, limit),
      this.investmentRepository.count(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}