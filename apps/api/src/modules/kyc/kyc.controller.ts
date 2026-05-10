import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { SubmitKybDto, SubmitKycDto } from './dto/submit-kyc.dto';
import { KycService } from './kyc.service';

@ApiTags('kyc')
@Controller()
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  // ─── Individual KYC ────────────────────────────────────────────────────────

  @Post('kyc/submit')
  @ApiOperation({ summary: 'Submit KYC document (mock auto-approval)' })
  submitKyc(@CurrentUser() user: UserEntity, @Body() dto: SubmitKycDto) {
    return this.kyc.submitKyc(user.id, dto);
  }

  @Get('kyc/status')
  @ApiOperation({ summary: 'Get KYC tier status and submitted documents' })
  getKycStatus(@CurrentUser() user: UserEntity) {
    return this.kyc.getKycStatus(user.id);
  }

  // ─── Business KYB ──────────────────────────────────────────────────────────

  @Post('kyb/submit')
  @ApiOperation({ summary: 'Submit KYB document for business account (mock auto-approval)' })
  submitKyb(@CurrentUser() user: UserEntity, @Body() dto: SubmitKybDto) {
    return this.kyc.submitKyb(user.id, dto);
  }

  @Get('kyb/status')
  @ApiOperation({ summary: 'Get KYB status and submitted documents' })
  getKybStatus(@CurrentUser() user: UserEntity) {
    return this.kyc.getKybStatus(user.id);
  }
}
