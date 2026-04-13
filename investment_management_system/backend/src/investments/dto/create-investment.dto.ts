import {
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export enum InvestmentType {
  STOCK = 'stock',
  BOND = 'bond',
  CRYPTO = 'crypto',
  REAL_ESTATE = 'real_estate',
  ETF = 'etf',
}

export class CreateInvestmentDto {
  @IsNumber()
  userId: number;

  @IsString()
  asset: string;

  @IsEnum(InvestmentType)
  type: InvestmentType;

  @IsNumber()
  amount: number;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  currentPrice: number;

  @IsNumber()
  quantity: number;

  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}