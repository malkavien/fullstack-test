import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateInvestmentDto {
  @ApiProperty({ example: 'Rafael', description: 'Investment owner name' })
  @IsString()
  owner!: string;
  @ApiProperty({ example: 1000.0, description: 'Investment amount' })
  @IsNumber()
  @IsPositive()
  amount!: number;
  @ApiProperty({
    example: '2026-01-01',
    description: 'Investment creation date',
  })
  @IsDateString()
  createdAt!: string;
}
