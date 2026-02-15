import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    url: configService.getOrThrow<string>('DATABASE_URL'),
    autoLoadEntities: true,
    synchronize: false,
    ssl:
      configService.getOrThrow<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
    logging: configService.getOrThrow<string>('NODE_ENV') !== 'production',
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: false,
  }),
};
