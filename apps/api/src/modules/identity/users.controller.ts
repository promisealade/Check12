import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getMe(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      type: user.type,
      role: user.role,
      tier: user.tier,
      kycStatus: user.kycStatus,
      kybStatus: user.kybStatus,
      businessName: user.businessName,
      phoneVerified: user.phoneVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    };
  }
}
