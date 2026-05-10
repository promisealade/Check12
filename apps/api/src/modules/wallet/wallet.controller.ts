import { Controller, Get, Param, ParseIntPipe, Query, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wallets with event-sourced balances' })
  getWallets(@CurrentUser() user: UserEntity) {
    return this.wallet.getWalletsWithBalances(user.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Wallet dashboard: balances + recent transactions' })
  getDashboard(@CurrentUser() user: UserEntity) {
    return this.wallet.getDashboard(user.id);
  }

  @Get(':walletId/events')
  @ApiOperation({ summary: 'Paginated ledger events for a wallet' })
  getLedgerEvents(
    @CurrentUser() user: UserEntity,
    @Param('walletId') walletId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.wallet.getLedgerEvents(user.id, walletId, page, Math.min(limit, 100));
  }
}
