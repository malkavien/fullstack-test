import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateInvestmentUseCase } from '../../application/use-cases/create-investment.use-case';
import { GetInvestmentByIdUseCase } from '../../application/use-cases/get-investment-by-id.use-case';
import { GetInvestmentsUseCase } from '../../application/use-cases/get-investments.use-case';
import { WithdrawInvestmentUseCase } from '../../application/use-cases/withdraw-investment.use-case';
import { CreateInvestmentDto } from '../infrastructure/http/dtos/create-investment.dto';
import { WithdrawInvestmentDto } from '../infrastructure/http/dtos/withdraw-investment.dto';
import { PaginationDto } from '../infrastructure/http/dtos/pagination.dto';

@Controller('investments')
export class InvestmentController {
  constructor(
    private readonly createInvestmentUseCase: CreateInvestmentUseCase,
    private readonly getInvestmentByIdUseCase: GetInvestmentByIdUseCase,
    private readonly getInvestmentsUseCase: GetInvestmentsUseCase,
    private readonly withdrawInvestmentUseCase: WithdrawInvestmentUseCase,
  ) {}

  @Post()
  async create(@Body() input: CreateInvestmentDto) {
    return this.createInvestmentUseCase.execute({
      owner: input.owner,
      amount: input.amount,
      createdAt: new Date(input.createdAt),
    });
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.getInvestmentsUseCase.execute({
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getInvestmentByIdUseCase.execute(id);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: WithdrawInvestmentDto,
  ) {
    return this.withdrawInvestmentUseCase.execute({
      id,
      withdrawalDate: new Date(input.withdrawalDate),
    });
  }
}
