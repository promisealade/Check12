import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly txns: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated transaction history with optional filters' })
  list(
    @CurrentUser() user: UserEntity,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('currency') currency?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.txns.list(user.id, {
      page,
      limit: Math.min(limit, 100),
      currency,
      type,
      from,
      to,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transaction history as CSV' })
  async exportCsv(
    @CurrentUser() user: UserEntity,
    @Query('currency') currency: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.txns.exportCsv(user.id, { currency, from, to });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="afrione-statement-${Date.now()}.csv"`,
    );
    res.send(csv);
  }
}
