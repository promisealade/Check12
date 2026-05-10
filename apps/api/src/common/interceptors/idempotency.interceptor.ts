import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

const IDEMPOTENCY_TTL = 86400; // 24 hours

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method !== 'POST') return next.handle();

    const idempotencyKey = request.headers['idempotency-key'] as string;
    if (!idempotencyKey) return next.handle();

    const cacheKey = `idempotency:${idempotencyKey}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      this.logger.log(`Idempotency hit: ${idempotencyKey}`);
      const parsed = JSON.parse(cached) as unknown;
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-Idempotency-Replayed', 'true');
      response.json(parsed);
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    }

    return next.handle().pipe(
      tap(async (data: unknown) => {
        await this.redis.setex(cacheKey, IDEMPOTENCY_TTL, JSON.stringify(data));
      }),
    );
  }
}
