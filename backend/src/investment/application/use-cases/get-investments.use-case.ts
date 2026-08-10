import { Injectable } from '@nestjs/common';
import { Investment } from '../../domain/entities/investment';
import { IInvestmentRepository } from '../interfaces/investment-repository.interface';
import { PaginationInput } from '../dtos/shared/pagination.dto';
import { PaginatedResponse } from '../dtos/shared/pagination-response.dto';

@Injectable()
export class GetInvestmentsUseCase {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async execute(
    input: PaginationInput,
  ): Promise<PaginatedResponse<Investment>> {
    const { page, limit } = input;

    const result = await this.investmentRepository.findAll(page, limit);

    return {
      data: result.data,
      total: result.total,
      page,
      lastPage: Math.ceil(result.total / limit),
    };
  }
}
