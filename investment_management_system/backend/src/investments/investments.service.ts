import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

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
  async create(createInvestmentDto: CreateInvestmentDto): Promise<Investment> {
    const investment = this.investmentsRepository.create({
      ...createInvestmentDto,
      // Если currentPrice не указана, берём purchasePrice
      currentPrice: createInvestmentDto.currentPrice || createInvestmentDto.purchasePrice,
    });

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
  async findOne(id: number): Promise<Investment> {
    const investment = await this.investmentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
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
  async update(id: number, updateInvestmentDto: UpdateInvestmentDto): Promise<Investment> {
    const investment = await this.findOne(id);

    // Обновляем поля
    Object.assign(investment, updateInvestmentDto);

    // Сохраняем в БД
    // SQL: UPDATE investments SET ... WHERE id = $1;
    return await this.investmentsRepository.save(investment);
  }

  /*
   * Удалить инвестицию
   * SQL: DELETE FROM investments WHERE id = $1;
   */
  async remove(id: number): Promise<void> {
    const investment = await this.findOne(id);
    await this.investmentsRepository.remove(investment);
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
      return sum + Number(inv.amount);
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
  async updateCurrentPrice(id: number, newPrice: number): Promise<Investment> {
    const investment = await this.findOne(id);
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