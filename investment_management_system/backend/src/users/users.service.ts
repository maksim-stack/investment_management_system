import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

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
  ) {}

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
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['investments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ 
      where: { email } 
    });
  }

  /*
   * Обновить данные пользователя
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Сначала проверяем, существует ли пользователь
    const user = await this.findOne(id);

    // Обновляем поля (merge)
    Object.assign(user, updateUserDto);

    // Сохраняем изменения в БД
    // save() выполнит: UPDATE users SET name=$1, email=$2 WHERE id=$3;
    return await this.usersRepository.save(user);
  }

  /**
   * Удалить пользователя
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
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
