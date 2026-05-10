import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IsNull, Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tier: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findOne({
      where: { id: payload.sub, deletedAt: IsNull() },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
