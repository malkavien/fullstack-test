import { Module } from '@nestjs/common';
import { PrismaInvestmentRepository } from './repositories/prisma-investment.repository';
import { PrismaModule } from '../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IInvestmentRepository',
      useClass: PrismaInvestmentRepository,
    },
  ],
  exports: ['IInvestmentRepository'],
})
export class InfrastructureModule {}