export class CreateInvestmentDto {
  userId: number;
  asset: string;
  type: 'stock' | 'bond' | 'crypto' | 'real_estate' | 'etf';
  amount: number;
  purchasePrice: number;
  quantity: number;
  purchaseDate: string;
  notes?: string;
}