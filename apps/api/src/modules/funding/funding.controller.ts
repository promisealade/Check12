import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireKycTier } from '../../common/decorators/kyc-tier.decorator';
import { KycGuard } from '../../common/guards/kyc.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { OnrampDto } from './dto/onramp.dto';
import { FundingService } from './funding.service';

@ApiTags('funding')
@Controller('funding')
@UseGuards(JwtAuthGuard, KycGuard)
export class FundingController {
  constructor(private readonly funding: FundingService) {}

  @Post('onramp')
  @RequireKycTier(0)
  @ApiOperation({ summary: 'Fund wallet via mock Mobile Money / bank transfer' })
  onramp(@CurrentUser() user: UserEntity, @Body() dto: OnrampDto) {
    return this.funding.onramp(user.id, dto);
  }
}
