import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreatePaymentLinkDto, GuestPayDto } from './dto/collections.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  // ─── Merchant endpoints (auth required) ─────────────────────────────────────

  @Post('links')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create payment link' })
  createLink(@CurrentUser() user: UserEntity, @Body() dto: CreatePaymentLinkDto) {
    return this.collections.createLink(user.id, dto);
  }

  @Get('links')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List my payment links' })
  getMyLinks(@CurrentUser() user: UserEntity) {
    return this.collections.getMyLinks(user.id);
  }

  // ─── Public (guest) endpoints ────────────────────────────────────────────────

  @Get('links/:shortCode')
  @ApiOperation({ summary: 'Get public payment link info (no auth required)' })
  getPublicLink(@Param('shortCode') shortCode: string) {
    return this.collections.getPublicLink(shortCode);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Guest pay via MoMo (no auth required)' })
  guestPay(@Body() dto: GuestPayDto) {
    return this.collections.guestPay(dto);
  }
}
