import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../database/entities/user.entity';
import { WalletEntity } from '../../database/entities/wallet.entity';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { AccountType, RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;        // 15 min
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 3600; // 7 days
const OTP_TTL_SECONDS = 10 * 60;                 // 10 min
const MFA_TOKEN_TTL_SECONDS = 5 * 60;            // 5 min

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tier: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private readonly wallets: Repository<WalletEntity>,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  // ─── Registration ──────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({
      where: [{ phone: dto.phone }, { email: dto.email }],
    });
    if (existing) {
      throw new ConflictException('Phone or email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.users.create({
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      type: dto.accountType === AccountType.BUSINESS ? 'business' : 'individual',
      role: dto.accountType === AccountType.BUSINESS ? 'business' : 'user',
      tier: 0,
      kycStatus: 'pending',
      kybStatus: 'not_started',
      phoneVerified: false,
      businessName: dto.businessName,
      registrationNumber: dto.registrationNumber,
    });

    const saved = await this.users.save(user);

    // Provision wallets immediately
    await this.wallets.save([
      this.wallets.create({ userId: saved.id, currency: 'AFRi' }),
      this.wallets.create({ userId: saved.id, currency: 'xGHS' }),
    ]);

    // Send OTP (mock — log to console)
    await this.sendOtp(saved.phone);

    return { userId: saved.id, message: 'OTP sent to your phone number' };
  }

  // ─── Phone OTP ─────────────────────────────────────────────────────────────

  async sendOtp(phone: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${phone}`, otp, OTP_TTL_SECONDS);
    // In production this calls an SMS gateway; for prototype, log it
    this.logger.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
  }

  async verifyPhone(phone: string, otp: string): Promise<{ verified: boolean }> {
    const stored = await this.redis.get(`otp:${phone}`);
    if (!stored || stored !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redis.del(`otp:${phone}`);

    await this.users.update({ phone }, { phoneVerified: true });
    return { verified: true };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: [{ phone: dto.identifier }, { email: dto.identifier }],
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.phoneVerified) {
      // Re-send OTP so user can verify
      await this.sendOtp(user.phone);
      throw new UnauthorizedException('Phone not verified — new OTP sent');
    }

    if (user.mfaEnabled) {
      // Issue short-lived MFA token; full tokens issued after MFA step
      const mfaToken = uuidv4();
      await this.redis.set(
        `mfa:${mfaToken}`,
        user.id,
        MFA_TOKEN_TTL_SECONDS,
      );
      return { requiresMfa: true, mfaToken };
    }

    // Mock new-device alert — always trigger on login for prototype demo
    const tokens = await this.issueTokens(user);
    return { requiresMfa: false, newDevice: true, ...tokens };
  }

  // ─── MFA (mock — any 6-digit code accepted) ────────────────────────────────

  async verifyMfa(mfaToken: string, code: string) {
    const userId = await this.redis.get(`mfa:${mfaToken}`);
    if (!userId) {
      throw new UnauthorizedException('MFA token expired or invalid');
    }

    // Prototype: accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.redis.del(`mfa:${mfaToken}`);

    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const tokens = await this.issueTokens(user);
    return { newDevice: true, ...tokens };
  }

  // ─── Token refresh ─────────────────────────────────────────────────────────

  async refresh(refreshToken: string) {
    const blacklisted = await this.redis.exists(`rt:blacklist:${refreshToken}`);
    if (blacklisted) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findOneOrFail({ where: { id: payload.sub } });

    // Rotate: blacklist old, issue new pair
    await this.redis.set(
      `rt:blacklist:${refreshToken}`,
      '1',
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return this.issueTokens(user);
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await this.redis.set(
      `rt:blacklist:${refreshToken}`,
      '1',
      REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async issueTokens(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });

    return { accessToken, refreshToken };
  }
}
