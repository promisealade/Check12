import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SavingsAccountEntity } from '../../database/entities/savings-account.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { CreateSavingsAccountDto, SavingsDepositDto, SavingsWithdrawDto } from './dto/savings.dto';

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(SavingsAccountEntity)
    private readonly accounts: Repository<SavingsAccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
    private readonly wallet: WalletService,
  ) {}

  async create(userId: string, dto: CreateSavingsAccountDto) {
    const afriWallet = await this.wallet.getWalletByCurrency(userId, 'AFRi');
    const account = this.accounts.create({
      userId,
      walletId: afriWallet.id,
      label: dto.label,
      targetAmount: dto.targetAmount,
    });
    return this.accounts.save(account);
  }

  async list(userId: string) {
    const accts = await this.accounts.find({ where: { userId } });
    return Promise.all(
      accts.map(async (a) => ({
        ...a,
        balance: await this.computeSavingsBalance(a.id),
      })),
    );
  }

  async deposit(userId: string, dto: SavingsDepositDto) {
    const account = await this.accounts.findOne({
      where: { id: dto.savingsAccountId, userId },
    });
    if (!account) throw new NotFoundException('Savings account not found');

    const amount = parseFloat(dto.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const balance = parseFloat(await this.wallet.computeBalance(account.walletId));
    if (amount > balance) throw new BadRequestException('Insufficient wallet balance');

    const idempotencyKey = dto.idempotencyKey ?? uuidv4();

    // Debit main wallet
    await this.wallet.appendLedgerEvent(
      account.walletId,
      'debit',
      amount.toFixed(8),
      'AFRi',
      'savings_deposit',
      `save:debit:${idempotencyKey}`,
      account.id,
    );

    // Credit savings sub-account (tracked via metadata referenceId = savings account id)
    await this.wallet.appendLedgerEvent(
      account.walletId,
      'credit',
      amount.toFixed(8),
      'AFRi',
      'savings_deposit',
      `save:credit:${idempotencyKey}`,
      account.id,
      { savingsAccountId: account.id, direction: 'deposit' },
    );

    const tx = this.txns.create({
      userId,
      type: 'savings_deposit',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: 'AFRi',
      fee: '0',
      amlStatus: 'cleared',
      idempotencyKey,
      settledAt: new Date(),
      counterpartyDisplay: account.label,
    });
    await this.txns.save(tx);

    return {
      savingsAccountId: account.id,
      label: account.label,
      deposited: amount.toFixed(8),
      savingsBalance: await this.computeSavingsBalance(account.id),
    };
  }

  async withdraw(userId: string, dto: SavingsWithdrawDto) {
    const account = await this.accounts.findOne({
      where: { id: dto.savingsAccountId, userId },
    });
    if (!account) throw new NotFoundException('Savings account not found');

    const amount = parseFloat(dto.amount);
    const savingsBalance = parseFloat(await this.computeSavingsBalance(account.id));
    if (amount > savingsBalance) {
      throw new BadRequestException('Insufficient savings balance');
    }

    const idempotencyKey = dto.idempotencyKey ?? uuidv4();

    await this.wallet.appendLedgerEvent(
      account.walletId,
      'debit',
      amount.toFixed(8),
      'AFRi',
      'savings_withdrawal',
      `saveout:debit:${idempotencyKey}`,
      account.id,
      { savingsAccountId: account.id, direction: 'withdrawal' },
    );

    await this.wallet.appendLedgerEvent(
      account.walletId,
      'credit',
      amount.toFixed(8),
      'AFRi',
      'savings_withdrawal',
      `saveout:credit:${idempotencyKey}`,
      account.id,
    );

    const tx = this.txns.create({
      userId,
      type: 'savings_withdrawal',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: 'AFRi',
      fee: '0',
      amlStatus: 'cleared',
      idempotencyKey,
      settledAt: new Date(),
      counterpartyDisplay: account.label,
    });
    await this.txns.save(tx);

    return {
      savingsAccountId: account.id,
      label: account.label,
      withdrawn: amount.toFixed(8),
      savingsBalance: await this.computeSavingsBalance(account.id),
    };
  }

  // Savings balance = credits with savingsAccountId metadata minus debits
  private async computeSavingsBalance(savingsAccountId: string): Promise<string> {
    const events = await this.wallet['ledger'].find({
      where: { referenceId: savingsAccountId },
    });
    const balance = events.reduce((sum, e) => {
      const amt = parseFloat(e.amount);
      return e.type === 'credit' ? sum + amt : sum - amt;
    }, 0);
    return Math.max(0, balance).toFixed(8);
  }
}
