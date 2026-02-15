import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, JobsOptions } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queue: Queue;
  private readonly workers: Worker[] = [];

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://redis:6379';
    this.queue = new Queue('ravi-jobs', { connection: { url: redisUrl } });
  }

  async add<T>(name: string, payload: T, options?: JobsOptions): Promise<void> {
    await this.queue.add(name, payload, {
      removeOnComplete: 1000,
      removeOnFail: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...options,
    });
  }

  registerWorker(name: string, processor: (payload: unknown) => Promise<void>): void {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://redis:6379';
    const worker = new Worker(
      'ravi-jobs',
      async (job) => {
        if (job.name !== name) return;
        await processor(job.data);
      },
      { connection: { url: redisUrl }, concurrency: 20 },
    );
    this.workers.push(worker);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.close()));
    await this.queue.close();
  }
}
