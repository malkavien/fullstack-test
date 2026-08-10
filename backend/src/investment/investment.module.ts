import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';

import { InvestmentController } from './application/controllers/investment.controller';

import { CreateInvestmentUseCase } from './application/use-cases/create-investment.use-case';
import { GetInvestmentByIdUseCase } from './application/use-cases/get-investment-by-id.use-case';
import { GetInvestmentsUseCase } from './application/use-cases/get-investments.use-case';
import { WithdrawInvestmentUseCase } from './application/use-cases/withdraw-investment.use-case';

import { IInvestmentRepository } from './application/interfaces/investment-repository.interface';
import { PrismaInvestmentRepository } from './application/infrastructure/repositories/prisma-investment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InvestmentController],
  providers: [
    CreateInvestmentUseCase,
    GetInvestmentByIdUseCase,
    GetInvestmentsUseCase,
    WithdrawInvestmentUseCase,
    {
      provide: IInvestmentRepository,
      useClass: PrismaInvestmentRepository,
    },
  ],
})
export class InvestmentModule {}
