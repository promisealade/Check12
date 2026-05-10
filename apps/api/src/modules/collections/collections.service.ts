import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentLinkEntity } from '../../database/entities/payment-link.entity';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { CreatePaymentLinkDto, GuestPayDto } from './dto/collections.dto';

const SHORT_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(PaymentLinkEntity)
    private readonly links: Repository<PaymentLinkEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
    private readonly wallet: WalletService,
  ) {}

  async createLink(merchantUserId: string, dto: CreatePaymentLinkDto) {
    const merchantWallet = await this.wallet.getWalletByCurrency(
      merchantUserId,
      dto.currency as 'AFRi' | 'xGHS',
    );

    const shortCode = this.generateShortCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (dto.expiresInHours ?? 72));

    const link = this.links.create({
      shortCode,
      merchantWalletId: merchantWallet.id,
      merchantUserId,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      status: 'active',
      expiresAt,
    });

    const saved = await this.links.save(link);
    return {
      ...saved,
      paymentUrl: `/pay/${shortCode}`,
    };
  }

  async getMyLinks(merchantUserId: string) {
    return this.links.find({
      where: { merchantUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicLink(shortCode: string) {
    const link = await this.links.findOne({ where: { shortCode } });
    if (!link) throw new NotFoundException('Payment link not found');
    if (link.status === 'paid') throw new BadRequestException('Payment link already used');
    if (link.status === 'expired' || link.expiresAt < new Date()) {
      throw new BadRequestException('Payment link has expired');
    }
    return {
      shortCode: link.shortCode,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      expiresAt: link.expiresAt,
    };
  }

  async guestPay(dto: GuestPayDto) {
    const link = await this.links.findOne({ where: { shortCode: dto.shortCode } });
    if (!link) throw new NotFoundException('Payment link not found');
    if (link.status !== 'active' || link.expiresAt < new Date()) {
      throw new BadRequestException('Payment link is no longer active');
    }

    const idempotencyKey = `collection:${link.id}:${uuidv4()}`;

    // Credit merchant wallet
    await this.wallet.appendLedgerEvent(
      link.merchantWalletId,
      'credit',
      link.amount,
      link.currency,
      'collection',
      `${idempotencyKey}:ledger`,
      link.id,
      { source: 'guest_pay', momoPhone: dto.momoPhone },
    );

    // Record transaction
    const tx = this.txns.create({
      userId: link.merchantUserId,
      type: 'collection',
      status: 'completed',
      amount: link.amount,
      currency: link.currency,
      fee: '0',
      amlStatus: 'cleared',
      idempotencyKey,
      settledAt: new Date(),
      payerReference: dto.payerReference,
      counterpartyDisplay: dto.momoPhone ?? 'Guest',
      metadata: { shortCode: link.shortCode, momoPhone: dto.momoPhone },
    });
    await this.txns.save(tx);

    // Mark link as paid
    await this.links.update(link.id, {
      status: 'paid',
      paidAt: new Date(),
      payerReference: dto.payerReference,
    });

    this.logger.log(
      `[COLLECTION] Guest paid ${link.amount} ${link.currency} to merchant ${link.merchantUserId}`,
    );

    return {
      success: true,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      paidAt: new Date(),
      message: 'Payment successful',
    };
  }

  private generateShortCode(): string {
    return Array.from({ length: 10 }, () =>
      SHORT_CODE_CHARS[Math.floor(Math.random() * SHORT_CODE_CHARS.length)],
    ).join('');
  }
}
