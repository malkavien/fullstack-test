import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { envValidationSchema } from './config/env.validation';
import { InvestmentModule } from './investment/investment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    InvestmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
