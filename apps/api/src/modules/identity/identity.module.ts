import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { WalletEntity } from '../../database/entities/wallet.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from './users.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets passed per-call so both access + refresh work
    TypeOrmModule.forFeature([UserEntity, WalletEntity]),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtAuthGuard, PassportModule],
})
export class IdentityModule {}
