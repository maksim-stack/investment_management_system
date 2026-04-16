// users/users.service.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, RiskProfile } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/*
 * UsersService - бизнес-логика для работы с пользователями
 */
@Injectable()
export class UsersService {
  /*
   * Конструктор с Dependency Injection
   * 
   * @InjectRepository(User) - внедряет репозиторий для работы с таблицей users
   * Repository<User> - TypeORM класс для CRUD операций
   * 
   * Репозиторий - это как "менеджер таблицы", который умеет:
   * - .find() - найти все записи
   * - .findOne() - найти одну запись
   * - .save() - сохранить запись
   * - .remove() - удалить запись
   * - и многое другое
   */
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache,
  ) {}

  private getProfileCacheKey(userId: number) {
    return `user:profile:${userId}`;
  }

  private getRiskDescription(type: RiskProfile): string {
    switch (type) {
      case RiskProfile.CONSERVATIVE:
        return 'Low risk, stable income';
      case RiskProfile.MODERATE:
        return 'Average risk, balance of returns';
      case RiskProfile.AGGRESSIVE:
        return 'High risk, high potential';
      default:
        return 'Undefined';
    }
  }

  /*
   * Создать нового пользователя
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // create() - создаёт объект User, но НЕ сохраняет в БД
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({ 
      ...createUserDto, 
      password: hashedPassword 
    });
    
    // save() - сохраняет в БД и возвращает объект с присвоенным ID
    // PostgreSQL автоматически присвоит ID благодаря @PrimaryGeneratedColumn()
    return await this.usersRepository.save(user);
  }


  async updateAndGetProfile(id: number, dto: UpdateUserDto) {
    // Сначала обновляем данные
    await this.usersRepository.update(id, dto);

    // удаляем кеш, чтобы при следующем запросе профиль пересчитался
    await this.cacheManager.del(this.getProfileCacheKey(id));

    // Затем возвращаем обновлённый профиль с stats
    return this.getProfileWithStats(id);
  }



  /*
   * Получить всех пользователей
   * find() - выполняет SQL запрос: SELECT * FROM users;
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      // relations: ['investments'] - если нужно загрузить инвестиции пользователя
      // order: { createdAt: 'DESC' } - сортировка по дате создания
    });
  }

  /*
   * Получить одного пользователя по ID
   * findOne() - выполняет SQL: SELECT * FROM users WHERE id = $1 LIMIT 1;
   */
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['investments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  /*
   * Собираем информацию для профиля пользователя. 
   */
  async getProfileWithStats(id: number) {
    const key = this.getProfileCacheKey(id);

    // 1. Проверяем кеш
    const cached = await this.cacheManager.get<any>(key);

    // 2. Если есть в кеше, возвращаем
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['investments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const base = {
      id: user.id,
      name: user.name,
      email: user.email,
      riskProfile: {
        type: user.riskProfile,
        description: this.getRiskDescription(user.riskProfile),
      },
    };

    // 3. если кеш есть - используем его
    if (cached) {

      return {
        ...base,
        ...cached,
      };
    }
    
    // 4. считаем stats (дорого)
    const investments = user.investments;

    let totalInvested = 0;
    let currentValue = 0;

    for (const inv of investments) {
      totalInvested += inv.purchasePrice * inv.quantity;
      currentValue += inv.currentPrice * inv.quantity;
    }

    const profit = currentValue - totalInvested;

    const stats = { 
      totalInvested,
      currentValue,
      profit,
      profitPercent: totalInvested > 0 ? (profit / totalInvested) * 100 : 0,
      investmentsCount: investments.length,
    };

    const recentInvestments = [...investments]
      .sort(
        (a, b) => 
          new Date(b.purchaseDate).getTime() - 
          new Date(a.purchaseDate).getTime()
      )
      .slice(0, 5);

    const computed = {
      stats,
      recentInvestments,
    };

    // 5. кладём в кеш
    await this.cacheManager.set( key, computed, 300 ); // 5 минут

    return {
      ...base,
      ...computed,
    };
  }

  /*
   * Обновить данные пользователя
   */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    // Сначала проверяем, существует ли пользователь
    const user = await this.findById(id);

    // Обновляем поля (merge)
    Object.assign(user, dto);

    // Сохраняем изменения в БД
    // save() выполнит: UPDATE users SET name=$1, email=$2 WHERE id=$3;
    return await this.usersRepository.save(user);
  }

  /**
   * Удалить пользователя
   */
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  /**
   * Альтернативный метод удаления (более быстрый)
   * Не загружает объект из БД, просто удаляет по ID
   */
  async removeById(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
