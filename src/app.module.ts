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
import { UserRoleModule } from './user-role/user-role.module';
import { RoleModule } from './role/role.module';

import { ParticipantStaffModule } from './participant-staff/participant-staff.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { CountryModule } from './country/country.module';
import { LgaModule } from './lga/lga.module';
import { StateModule } from './state/state.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RenterKycModule } from './renter-kyc/renter-kyc.module';
import { IdentityTypesModule } from './identity-types/identity-types.module';
import { BusinessKycModule } from './business-kyc/business-kyc.module';
import { ResetPasswordTokenModule } from './reset-password-token/reset-password-token.module';
import { AccountTypeModule } from './account-type/account-type.module';
import { PlanModule } from './plan/plan.module';




@Module({
  imports: [
    PrometheusModule.register(),
    HttpModule,
    ConfigModule.forRoot({
      // envFilePath: process.env.DEV_ENV === 'test' ? '.env.test' : '.env', 

      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
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
    UserRoleModule,
    RoleModule,
    ParticipantStaffModule,
    MetricsModule,
    CountryModule,
    LgaModule,
    StateModule,
    CloudinaryModule,
    RenterKycModule,
    IdentityTypesModule,
    BusinessKycModule,
    ResetPasswordTokenModule,
    AccountTypeModule,
    PlanModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

