import { entities } from './entities';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load .env only in non-Kubernetes environments
if (!process.env.KUBERNETES_SERVICE_HOST) {
  console.log(`Loading environment variables from .env`);
  config(); // No need to specify a path, it will default to ".env"
}

const configService = new ConfigService();
export default new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: entities,
  migrations: ['./migrations/*.ts'],
});
