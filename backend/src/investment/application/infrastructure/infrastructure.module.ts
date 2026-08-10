import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PrismaInvestmentRepository } from './repositories/prisma-investment.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IInvestmentRepository',
      useClass: PrismaInvestmentRepository,
    },
  ],
  exports: ['IInvestmentRepository'],
})
export class InfrastructureModule {}