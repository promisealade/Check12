import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { CreateSavingsAccountDto, SavingsDepositDto, SavingsWithdrawDto } from './dto/savings.dto';
import { SavingsService } from './savings.service';

@ApiTags('savings')
@Controller('savings')
@UseGuards(JwtAuthGuard)
export class SavingsController {
  constructor(private readonly savings: SavingsService) {}

  @Get()
  @ApiOperation({ summary: 'List savings accounts with balances' })
  list(@CurrentUser() user: UserEntity) {
    return this.savings.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a savings account' })
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateSavingsAccountDto) {
    return this.savings.create(user.id, dto);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit AFRi into savings account' })
  deposit(@CurrentUser() user: UserEntity, @Body() dto: SavingsDepositDto) {
    return this.savings.deposit(user.id, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw AFRi from savings account' })
  withdraw(@CurrentUser() user: UserEntity, @Body() dto: SavingsWithdrawDto) {
    return this.savings.withdraw(user.id, dto);
  }
}
