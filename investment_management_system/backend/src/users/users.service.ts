import { Injectable } from '@nestjs/common';

type User = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
    private users: User[] = [];
    private idCounter = 1;

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
}
