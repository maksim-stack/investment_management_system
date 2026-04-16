// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req) {
        return this.usersService.getProfileWithStats(req.user.userId);
    }

    @Post('register')
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
        return this.usersService.updateAndGetProfile(req.user.userId, dto);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    removeProfile(@Req() req) {
        return this.usersService.remove(req.user.userId);
    }
}
