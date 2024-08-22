import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

import * as Joi from "@hapi/joi"
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'database.module';
import { EmailVerificationTokenModule } from './email-verification-token/email-verification-token.module';
import { UtilitiesModule } from './utilities/utilities.module';




@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      })
    }),
    DatabaseModule,
    UserModule,
    AuthenticationModule,
    EmailVerificationTokenModule,
    UtilitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

