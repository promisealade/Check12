import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireKycTier } from '../../common/decorators/kyc-tier.decorator';
import { KycGuard } from '../../common/guards/kyc.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { CreateTransferDto, LookupRecipientDto } from './dto/transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@Controller('transfers')
@UseGuards(JwtAuthGuard, KycGuard)
@RequireKycTier(1)
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post('lookup')
  @ApiOperation({ summary: 'Look up recipient by phone or email' })
  lookup(@Body() dto: LookupRecipientDto) {
    return this.transfers.lookupRecipient(dto.identifier);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send AFRi or xGHS to another user (Tier 1+)' })
  send(@CurrentUser() user: UserEntity, @Body() dto: CreateTransferDto) {
    return this.transfers.send(user.id, dto);
  }
}
