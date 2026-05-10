import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KYC_TIER_KEY } from '../decorators/kyc-tier.decorator';

@Injectable()
export class KycGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<number>(KYC_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredTier === undefined) return true;

    const { user } = context.switchToHttp().getRequest<{ user: { tier: number } }>();

    if (!user || user.tier < requiredTier) {
      throw new ForbiddenException(
        `KYC Tier ${requiredTier} required. Please complete identity verification to access this feature.`,
      );
    }

    return true;
  }
}
