import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { OnrampDto } from './dto/onramp.dto';

// Fee: 0.5% of funded amount, minimum 0.01
const ONRAMP_FEE_RATE = 0.005;
const ONRAMP_FEE_MIN = '0.01000000';

@Injectable()
export class FundingService {
  private readonly logger = new Logger(FundingService.name);

  constructor(
    private readonly wallet: WalletService,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
  ) {}

  async onramp(userId: string, dto: OnrampDto) {
    const amount = parseFloat(dto.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const fee = Math.max(
      parseFloat(ONRAMP_FEE_MIN),
      parseFloat((amount * ONRAMP_FEE_RATE).toFixed(8)),
    );

    const walletObj = await this.wallet.getWalletByCurrency(
      userId,
      dto.currency as 'AFRi' | 'xGHS',
    );

    const idempotencyKey = dto.idempotencyKey ?? uuidv4();
    const ledgerKey = `onramp:ledger:${idempotencyKey}`;
    const txKey = `onramp:tx:${idempotencyKey}`;

    // Mock provider: log and succeed
    this.logger.log(
      `[MOCK ONRAMP] Provider=${dto.provider} Phone=${dto.momoPhone ?? 'n/a'} ` +
        `Amount=${amount} ${dto.currency} Fee=${fee}`,
    );

    // Append ledger credit
    await this.wallet.appendLedgerEvent(
      walletObj.id,
      'credit',
      amount.toFixed(8),
      dto.currency,
      'funding',
      ledgerKey,
      undefined,
      { provider: dto.provider, momoPhone: dto.momoPhone },
    );

    // Record transaction
    const tx = this.txns.create({
      userId,
      type: 'funding',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: dto.currency,
      fee: fee.toFixed(8),
      amlStatus: 'cleared',
      idempotencyKey: txKey,
      settledAt: new Date(),
      counterpartyDisplay: dto.provider.toUpperCase(),
      metadata: { provider: dto.provider, momoPhone: dto.momoPhone },
    });

    const saved = await this.txns.save(tx);
    const newBalance = await this.wallet.computeBalance(walletObj.id);

    return {
      transactionId: saved.id,
      currency: dto.currency,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      net: (amount - fee).toFixed(8),
      newBalance,
      status: 'completed',
      message: `${dto.currency} wallet funded successfully via ${dto.provider}`,
    };
  }
}
