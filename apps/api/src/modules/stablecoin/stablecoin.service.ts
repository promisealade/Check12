import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { ConversionDirection, ConversionDto } from './dto/conversion.dto';

// Mock oracle rates: 1 AFRi = 13.85 xGHS
const MOCK_RATE_AFRI_TO_XGHS = 13.85;
const CONVERSION_FEE_RATE = 0.008; // 0.8%

@Injectable()
export class StablecoinService {
  private readonly logger = new Logger(StablecoinService.name);

  constructor(
    private readonly wallet: WalletService,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
  ) {}

  getRate() {
    // Mock oracle — in production: Chainlink + Celo SortedOracles with circuit breaker
    const rateAFRiToXGHS = MOCK_RATE_AFRI_TO_XGHS + (Math.random() * 0.1 - 0.05); // ±0.05 spread
    return {
      AFRi_to_xGHS: parseFloat(rateAFRiToXGHS.toFixed(4)),
      xGHS_to_AFRi: parseFloat((1 / rateAFRiToXGHS).toFixed(8)),
      updatedAt: new Date().toISOString(),
      source: 'MOCK_ORACLE',
    };
  }

  previewConversion(direction: ConversionDirection, amount: string) {
    const rates = this.getRate();
    const amountNum = parseFloat(amount);

    const rate =
      direction === ConversionDirection.AFRI_TO_XGHS
        ? rates.AFRi_to_xGHS
        : rates.xGHS_to_AFRi;

    const gross = amountNum * rate;
    const fee = gross * CONVERSION_FEE_RATE;
    const net = gross - fee;

    const [fromCurrency, toCurrency] =
      direction === ConversionDirection.AFRI_TO_XGHS
        ? ['AFRi', 'xGHS']
        : ['xGHS', 'AFRi'];

    return {
      direction,
      from: { amount: amountNum.toFixed(8), currency: fromCurrency },
      to: { amount: net.toFixed(8), currency: toCurrency },
      rate: rate.toFixed(8),
      fee: fee.toFixed(8),
      feeCurrency: toCurrency,
      rateSource: 'MOCK_ORACLE',
    };
  }

  async convert(userId: string, dto: ConversionDto) {
    const amount = parseFloat(dto.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const preview = this.previewConversion(dto.direction, dto.amount);

    const [fromCurrency, toCurrency] = dto.direction === ConversionDirection.AFRI_TO_XGHS
      ? (['AFRi', 'xGHS'] as const)
      : (['xGHS', 'AFRi'] as const);

    const fromWallet = await this.wallet.getWalletByCurrency(userId, fromCurrency);
    const toWallet = await this.wallet.getWalletByCurrency(userId, toCurrency);

    // Check sufficient balance
    const balance = parseFloat(await this.wallet.computeBalance(fromWallet.id));
    if (amount > balance) {
      throw new BadRequestException(
        `Insufficient ${fromCurrency} balance. Available: ${balance.toFixed(8)}`,
      );
    }

    const idempotencyKey = dto.idempotencyKey ?? uuidv4();

    // Debit source
    await this.wallet.appendLedgerEvent(
      fromWallet.id,
      'debit',
      amount.toFixed(8),
      fromCurrency,
      'conversion',
      `conv:debit:${idempotencyKey}`,
    );

    // Credit destination (net of fee)
    const netAmount = parseFloat(preview.to.amount);
    await this.wallet.appendLedgerEvent(
      toWallet.id,
      'credit',
      netAmount.toFixed(8),
      toCurrency,
      'conversion',
      `conv:credit:${idempotencyKey}`,
    );

    // Record transaction
    const tx = this.txns.create({
      userId,
      type: 'conversion',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: fromCurrency,
      fee: preview.fee,
      exchangeRate: preview.rate,
      amlStatus: 'cleared',
      idempotencyKey,
      settledAt: new Date(),
      counterpartyDisplay: `${fromCurrency} → ${toCurrency}`,
    });

    const saved = await this.txns.save(tx);

    this.logger.log(
      `[CONVERSION] ${userId} converted ${amount} ${fromCurrency} → ${netAmount} ${toCurrency}`,
    );

    return {
      transactionId: saved.id,
      ...preview,
      status: 'completed',
    };
  }
}
