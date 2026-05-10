import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
  ) {}

  async list(userId: string) {
    const items = await this.notifications.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    const unreadCount = items.filter((n) => !n.read).length;
    return { notifications: items, unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    await this.notifications.update({ id: notificationId, userId }, { read: true });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.notifications.update({ userId, read: false }, { read: true });
    return { success: true };
  }

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>,
  ) {
    const n = this.notifications.create({ userId, type, message, actionUrl, metadata });
    return this.notifications.save(n);
  }
}
