import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  private investments = [
    { id: 1, userId: 1, asset: 'Apple Inc.', type: 'stock', amount: 5000, purchasePrice: 150.25, currentPrice: 178.5, quantity: 33, purchaseDate: '2024-01-15', notes: 'Long-term hold' },
    { id: 2, userId: 1, asset: 'Bitcoin', type: 'crypto', amount: 3000, purchasePrice: 42000, currentPrice: 68000, quantity: 0.071, purchaseDate: '2024-02-01' },
    { id: 3, userId: 2, asset: 'S&P 500 ETF', type: 'etf', amount: 10000, purchasePrice: 480, currentPrice: 512, quantity: 20, purchaseDate: '2023-11-10' },
  ];
  private nextId = 4;

  findAll() { return this.investments; }

  findOne(id: number) {
    const inv = this.investments.find(i => i.id === id);
    if (!inv) throw new NotFoundException(`Investment ${id} not found`);
    return inv;
  }

  findByUser(userId: number) {
    return this.investments.filter(i => i.userId === userId);
  }

  create(dto: CreateInvestmentDto) {
    const inv = { id: this.nextId++, ...dto, currentPrice: dto.purchasePrice };
    this.investments.push(inv);
    return inv;
  }

  remove(id: number) {
    const index = this.investments.findIndex(i => i.id === id);
    if (index === -1) throw new NotFoundException(`Investment ${id} not found`);
    this.investments.splice(index, 1);
    return { message: `Investment ${id} deleted` };
  }

  getPortfolioSummary(userId: number) {
    const list = this.findByUser(userId);
    const totalInvested = list.reduce((s, i) => s + i.amount, 0);
    const currentValue = list.reduce((s, i) => s + i.currentPrice * i.quantity, 0);
    const profitLoss = currentValue - totalInvested;
    return {
      userId,
      totalInvested: +totalInvested.toFixed(2),
      currentValue: +currentValue.toFixed(2),
      profitLoss: +profitLoss.toFixed(2),
      profitLossPercent: +(totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0).toFixed(2),
      totalAssets: list.length,
    };
  }
}