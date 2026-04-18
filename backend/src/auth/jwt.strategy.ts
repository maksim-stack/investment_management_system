import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    console.log('🔥 JwtStrategy loaded');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'SECRET_KEY',
    });
  }

  async validate(payload: any) {
    console.log('TOKEN OK:', payload);
    console.log(payload);
    return { 
      userId: payload.sub,
       email: payload.email
      };
  }
}