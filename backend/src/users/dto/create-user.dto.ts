// users/dto/create-user.dto.ts
// DTO (Data Transfer Object) для создания пользователя
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(RiskProfile)
  riskProfile: RiskProfile;
}