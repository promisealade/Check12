import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { KycDocumentEntity } from '../../database/entities/kyc-document.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { KybDocType, KycDocType, SubmitKybDto, SubmitKycDto } from './dto/submit-kyc.dto';

// Tier rules:
//   Tier 1 → any primary ID (national_id | passport | drivers_license) approved
//   Tier 2 → primary ID + selfie approved
const PRIMARY_ID_TYPES: string[] = [
  KycDocType.NATIONAL_ID,
  KycDocType.PASSPORT,
  KycDocType.DRIVERS_LICENSE,
];

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KycDocumentEntity)
    private readonly docs: Repository<KycDocumentEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  // ─── Individual KYC ────────────────────────────────────────────────────────

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });

    if (user.type !== 'individual') {
      throw new BadRequestException('Business accounts must use KYB submission');
    }

    const existing = await this.docs.findOne({
      where: { userId, documentType: dto.documentType as string },
    });

    if (existing?.status === 'approved') {
      throw new BadRequestException(`${dto.documentType} already approved`);
    }

    // Upsert document
    const doc = existing ?? this.docs.create({ userId });
    doc.documentType = dto.documentType as string as any;
    doc.providerRef = `SMILEID-MOCK-${uuidv4().slice(0, 8).toUpperCase()}`;
    // Mock: auto-approve immediately
    doc.status = 'approved';
    doc.reviewedAt = new Date();

    await this.docs.save(doc);
    this.logger.log(`[MOCK KYC] Auto-approved ${dto.documentType} for user ${userId}`);

    // Recalculate tier
    const newTier = await this.recalculateKycTier(userId);
    await this.users.update(userId, {
      kycStatus: 'approved',
      tier: Math.max(user.tier, newTier),
    });

    return {
      documentType: doc.documentType,
      status: doc.status,
      providerRef: doc.providerRef,
      tier: Math.max(user.tier, newTier),
      message: 'Document verified successfully',
    };
  }

  async getKycStatus(userId: string) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const documents = await this.docs.find({ where: { userId } });

    const approvedTypes = documents
      .filter((d) => d.status === 'approved')
      .map((d) => d.documentType);

    const hasPrimaryId = PRIMARY_ID_TYPES.some((t) => approvedTypes.includes(t));
    const hasSelfie = approvedTypes.includes('selfie');

    return {
      tier: user.tier,
      kycStatus: user.kycStatus,
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        status: d.status,
        submittedAt: d.submittedAt,
      })),
      nextStep: !hasPrimaryId
        ? 'Submit a national ID, passport, or driver\'s license'
        : !hasSelfie
        ? 'Submit a selfie to reach Tier 2'
        : null,
      tierRequirements: {
        tier1: { met: hasPrimaryId, requirement: 'Primary ID document' },
        tier2: { met: hasPrimaryId && hasSelfie, requirement: 'Primary ID + selfie' },
      },
    };
  }

  // ─── Business KYB ──────────────────────────────────────────────────────────

  async submitKyb(userId: string, dto: SubmitKybDto) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });

    if (user.type !== 'business') {
      throw new BadRequestException('Only business accounts can submit KYB documents');
    }

    const existing = await this.docs.findOne({
      where: { userId, documentType: dto.documentType as string },
    });

    if (existing?.status === 'approved') {
      throw new BadRequestException(`${dto.documentType} already approved`);
    }

    const doc = existing ?? this.docs.create({ userId });
    doc.documentType = dto.documentType as string as any;
    doc.providerRef = `KYB-MOCK-${uuidv4().slice(0, 8).toUpperCase()}`;
    doc.status = 'approved';
    doc.reviewedAt = new Date();

    await this.docs.save(doc);
    this.logger.log(`[MOCK KYB] Auto-approved ${dto.documentType} for user ${userId}`);

    // Check if KYB is fully complete (needs both docs)
    const allDocs = await this.docs.find({ where: { userId } });
    const approvedKybDocs = allDocs
      .filter((d) => d.status === 'approved')
      .map((d) => d.documentType);

    const kybComplete =
      approvedKybDocs.includes('business_registration') &&
      approvedKybDocs.includes('director_id');

    if (kybComplete) {
      await this.users.update(userId, { kybStatus: 'approved', tier: 2 });
    }

    return {
      documentType: doc.documentType,
      status: doc.status,
      providerRef: doc.providerRef,
      kybComplete,
      message: kybComplete
        ? 'KYB approved — your business account is fully verified'
        : 'Document approved — please submit remaining KYB documents',
    };
  }

  async getKybStatus(userId: string) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const documents = await this.docs.find({ where: { userId } });

    const approvedTypes = documents
      .filter((d) => d.status === 'approved')
      .map((d) => d.documentType);

    const hasBusinessReg = approvedTypes.includes('business_registration');
    const hasDirectorId = approvedTypes.includes('director_id');

    return {
      kybStatus: user.kybStatus,
      businessName: user.businessName,
      registrationNumber: user.registrationNumber,
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        status: d.status,
        submittedAt: d.submittedAt,
      })),
      requirements: {
        businessRegistration: { met: hasBusinessReg, requirement: 'Certificate of Incorporation' },
        directorId: { met: hasDirectorId, requirement: 'Director national ID or passport' },
      },
    };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async recalculateKycTier(userId: string): Promise<number> {
    const approved = await this.docs.find({ where: { userId, status: 'approved' } });
    const types = approved.map((d) => d.documentType);

    const hasPrimaryId = PRIMARY_ID_TYPES.some((t) => types.includes(t));
    const hasSelfie = types.includes('selfie');

    if (hasPrimaryId && hasSelfie) return 2;
    if (hasPrimaryId) return 1;
    return 0;
  }
}
