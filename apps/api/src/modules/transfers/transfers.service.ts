import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { CreateTransferDto } from './dto/transfer.dto';

const TRANSFER_FEE_RATE = 0.005; // 0.5%
const TRANSFER_FEE_MIN = '0.01000000';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txns: Repository<TransactionEntity>,
    private readonly wallet: WalletService,
  ) {}

  async lookupRecipient(identifier: string) {
    const user = await this.users.findOne({
      where: [{ phone: identifier }, { email: identifier }],
    });
    if (!user) throw new NotFoundException('Recipient not found');
    return {
      userId: user.id,
      displayName: user.email,
      phone: user.phone,
      tier: user.tier,
    };
  }

  async send(senderId: string, dto: CreateTransferDto) {
    if (!dto.amount || parseFloat(dto.amount) <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const recipient = await this.users.findOne({
      where: [{ phone: dto.recipientIdentifier }, { email: dto.recipientIdentifier }],
    });
    if (!recipient) throw new NotFoundException('Recipient not found');
    if (recipient.id === senderId) throw new BadRequestException('Cannot transfer to yourself');

    const amount = parseFloat(dto.amount);
    const fee = Math.max(parseFloat(TRANSFER_FEE_MIN), amount * TRANSFER_FEE_RATE);
    const total = amount + fee;

    const senderWallet = await this.wallet.getWalletByCurrency(
      senderId,
      dto.currency as 'AFRi' | 'xGHS',
    );
    const recipientWallet = await this.wallet.getWalletByCurrency(
      recipient.id,
      dto.currency as 'AFRi' | 'xGHS',
    );

    const balance = parseFloat(await this.wallet.computeBalance(senderWallet.id));
    if (total > balance) {
      throw new BadRequestException(
        `Insufficient balance. Need ${total.toFixed(8)} ${dto.currency}, have ${balance.toFixed(8)}`,
      );
    }

    const idempotencyKey = dto.idempotencyKey ?? uuidv4();

    // Debit sender (amount + fee)
    await this.wallet.appendLedgerEvent(
      senderWallet.id,
      'debit',
      total.toFixed(8),
      dto.currency,
      'transfer',
      `transfer:debit:${idempotencyKey}`,
    );

    // Credit recipient (amount only — fee kept by platform)
    await this.wallet.appendLedgerEvent(
      recipientWallet.id,
      'credit',
      amount.toFixed(8),
      dto.currency,
      'transfer',
      `transfer:credit:${idempotencyKey}`,
    );

    // AML: flag if amount >= 5000 (VELOCITY_THRESHOLD demo)
    const amlStatus = amount >= 5000 ? 'flagged' : 'cleared';

    // Sent record
    const sent = this.txns.create({
      userId: senderId,
      type: 'transfer_sent',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: dto.currency,
      fee: fee.toFixed(8),
      counterpartyId: recipient.id,
      counterpartyDisplay: recipient.email,
      amlStatus,
      idempotencyKey,
      settledAt: new Date(),
      metadata: { note: dto.note },
    });

    // Received record
    const received = this.txns.create({
      userId: recipient.id,
      type: 'transfer_received',
      status: 'completed',
      amount: amount.toFixed(8),
      currency: dto.currency,
      fee: '0',
      counterpartyId: senderId,
      amlStatus: 'cleared',
      idempotencyKey: `${idempotencyKey}:recv`,
      settledAt: new Date(),
    });

    await this.txns.save([sent, received]);

    this.logger.log(
      `[TRANSFER] ${senderId} → ${recipient.id} | ${amount} ${dto.currency} | AML=${amlStatus}`,
    );

    return {
      transactionId: sent.id,
      recipient: { userId: recipient.id, display: recipient.email },
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      currency: dto.currency,
      amlStatus,
      status: 'completed',
      newBalance: await this.wallet.computeBalance(senderWallet.id),
    };
  }
}
