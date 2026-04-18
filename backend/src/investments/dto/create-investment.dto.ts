import {
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export enum InvestmentType {
  STOCK = 'stock',
  BOND = 'bond',
  CRYPTO = 'crypto',
  REAL_ESTATE = 'real_estate',
  ETF = 'etf',
}

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  asset: string;

  @IsEnum(InvestmentType)
  @IsNotEmpty()
  type: InvestmentType;

  @IsNumber()
  @Min(0.01)
  purchasePrice: number;

  @IsNumber()
  @Min(0.01)
  currentPrice: number;

  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}