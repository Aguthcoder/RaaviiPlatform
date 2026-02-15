import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationEntity, NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async listForUser(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 });
  }

  async createNotification(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
  }): Promise<NotificationEntity> {
    return this.notificationRepository.save(this.notificationRepository.create(input));
  }

  async markRead(userId: string, ids: string[]) {
    if (!ids.length) return { updated: 0 };
    const result = await this.notificationRepository.update(
      { id: In(ids), userId },
      { isRead: true, readAt: new Date() },
    );
    return { updated: result.affected ?? 0 };
  }
}
