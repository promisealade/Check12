import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireKycTier } from '../../common/decorators/kyc-tier.decorator';
import { KycGuard } from '../../common/guards/kyc.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { ConversionDto, ConversionPreviewDto } from './dto/conversion.dto';
import { StablecoinService } from './stablecoin.service';

@ApiTags('stablecoin')
@Controller('stablecoin')
@UseGuards(JwtAuthGuard)
export class StablecoinController {
  constructor(private readonly stablecoin: StablecoinService) {}

  @Get('rate')
  @ApiOperation({ summary: 'Get current AFRi/xGHS exchange rate (mock oracle)' })
  getRate() {
    return this.stablecoin.getRate();
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview conversion without executing' })
  preview(@Body() dto: ConversionPreviewDto) {
    return this.stablecoin.previewConversion(dto.direction, dto.amount);
  }

  @Post('convert')
  @UseGuards(KycGuard)
  @RequireKycTier(1)
  @ApiOperation({ summary: 'Execute stablecoin conversion (Tier 1+)' })
  convert(@CurrentUser() user: UserEntity, @Body() dto: ConversionDto) {
    return this.stablecoin.convert(user.id, dto);
  }
}
