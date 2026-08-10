import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class WithdrawInvestmentDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'Investment withdrawal date',
  })
  @IsDateString()
  withdrawalDate!: string;
}
