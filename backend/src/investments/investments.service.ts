// investments.service.ts - бизнес-логика для работы с инвестициями
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { dot } from 'node:test/reporters';

/*
 * InvestmentsService - бизнес-логика для работы с инвестициями
 */
@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentsRepository: Repository<Investment>,
  ) {}

  /*
   * Создать новую инвестицию
   */
  async create(dto: CreateInvestmentDto, userId: number): Promise<Investment> {
    const investment = this.investmentsRepository.create({
      ...dto,
      userId,
      purchaseDate: new Date(), // Устанавливаем текущую дату покупки
      // Если currentPrice не указана, берём purchasePrice
      currentPrice: dto.currentPrice || dto.purchasePrice,
    });

    if (!dto.asset || dto.asset.trim() === '') {
      throw new BadRequestException('Asset is required');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }

    return await this.investmentsRepository.save(investment);
  }

  /*
   * Получить все инвестиции
   * SQL: SELECT * FROM investments;
   */
  async findAll(): Promise<Investment[]> {
    return await this.investmentsRepository.find({
    relations: ['user'],
    order: { purchaseDate: 'DESC' },
    });
  }

  /*
   * Получить одну инвестицию по ID
   * SQL: SELECT * FROM investments WHERE id = $1 LIMIT 1;
   */
  async findOne(id: number, userId: number) {
    const investment = await this.investmentsRepository.findOne({
      where: { id },
    });

    if (!investment) {
      throw new NotFoundException(`Investment not found`);
    }

    if (investment.userId !== userId) {
      throw new ForbiddenException(`Access denied`);
    }

    return investment;
  }

  /*
   * Получить все инвестиции конкретного пользователя
   * SQL: SELECT * FROM investments WHERE userId = $1;
   */
  async findByUser(userId: number): Promise<Investment[]> {
    return await this.investmentsRepository.find({
      where: { userId },
      order: { purchaseDate: 'DESC' }, // Сортировка: новые вверху
    });
  }

  /*
   * Обновить инвестицию
   */
  async update(id: number, dto: UpdateInvestmentDto, userId: number) {
    const investment = await this.findOne(id, userId);

    if (!investment) {
      throw new NotFoundException(`Investment not found`);
    }

    if (investment.userId !== userId) {
      throw new ForbiddenException(`Access denied`);
    }

    await this.investmentsRepository.update(id, dto);

    // Сохраняем в БД
    // SQL: UPDATE investments SET ... WHERE id = $1;
    return this.findOne(id, userId);
  }

  /*
   * Удалить инвестицию
   * SQL: DELETE FROM investments WHERE id = $1;
   */
  async remove(id: number, userId: number) {
    const investment = await this.findOne(id, userId);
    
    if (!investment) {
      throw new NotFoundException(`Investment not found`);
    }

    if (investment.userId !== userId) {
      throw new NotFoundException(`Access denied`);
    }

    return this.investmentsRepository.delete(id);
  }

  /*
   * Получить сводку по портфелю пользователя
   */
  async getPortfolioSummary(userId: number) {
    const investments = await this.findByUser(userId);

    // Если у пользователя нет инвестиций
    if (investments.length === 0) {
      return {
        userId,
        totalInvested: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercent: 0,
        totalAssets: 0,
      };
    }

    // Расчёт общей суммы инвестиций
    const totalInvested = investments.reduce((sum, inv) => {
      return sum + Number(inv.quantity) * Number(inv.purchasePrice);
    }, 0);

    // Расчёт текущей стоимости портфеля
    const currentValue = investments.reduce((sum, inv) => {
      return sum + Number(inv.currentPrice) * Number(inv.quantity);
    }, 0);

    // Расчёт прибыли/убытка
    const profitLoss = currentValue - totalInvested;

    // Расчёт прибыли/убытка в процентах
    const profitLossPercent = totalInvested > 0 
      ? (profitLoss / totalInvested) * 100 
      : 0;

    return {
      userId,
      totalInvested: Number(totalInvested.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      profitLoss: Number(profitLoss.toFixed(2)),
      profitLossPercent: Number(profitLossPercent.toFixed(2)),
      totalAssets: investments.length,
    };
  }

  /*
   * ДОПОЛНИТЕЛЬНЫЙ МЕТОД: Обновить текущую цену актива
   * Полезно для обновления рыночных цен
   */
  async updateCurrentPrice(id: number, newPrice: number, userId: number): Promise<Investment> {
    const investment = await this.findOne(id, userId);
    investment.currentPrice = newPrice;
    return await this.investmentsRepository.save(investment);
  }

  /*
   * ДОПОЛНИТЕЛЬНЫЙ МЕТОД: Получить инвестиции по типу
   * Например, все криптовалюты или все акции
   */
  async findByType(type: string): Promise<Investment[]> {
    return await this.investmentsRepository.find({
      where: { type },
      order: { purchaseDate: 'DESC' },
    });
  }

  /*
   * ДОПОЛНИТЕЛЬНЫЙ МЕТОД: Получить инвестиции по типу для конкретного пользователя
   */
  async findByUserAndType(userId: number, type: string): Promise<Investment[]> {
    return await this.investmentsRepository.find({
      where: { userId, type },
      order: { purchaseDate: 'DESC' },
    });
  }
}