import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

type User = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
    private users: User[] = [];
    private idCounter = 1;

    findOne(id: number) {
        const user = this.users.find(u => u.id === id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    create(userData: Omit<User, 'id'>) {
        const newUser: User = {
            id: this.idCounter++,
            ...userData
        };

        this.users.push(newUser);
        return newUser;
    }

    findAll() {
        return this.users;
    }

    update(id: number, dto: UpdateUserDto) {
        const user = this.findOne(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, dto);
        return user;
    }

    remove(id: number) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new NotFoundException('User not found');
        }
        this.users.splice(index, 1);
        return index;
    }
}
