import { Global, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/user.entity';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailVerificationTokenService } from '../email-verification-token/email-verification-token.service';
import EmailVerificationToken from '../email-verification-token/email-verification-token.entity';
import { Utility } from '../utilities/utility';
import Role from '../role/role.entity';

import ProductOwnerStaff from '../participant-staff/participant-staff.entity';

import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RenterKycService } from '../renter-kyc/renter-kyc.service';
import { IdentityTypesService } from '../identity-types/identity-types.service';
import IdentityType from '../identity-types/identity-types.entity';
import { RenterKyc } from '../renter-kyc/renter-kyc.entity';
import { BusinessKycService } from '../business-kyc/business-kyc.service';
import { BusinessKyc } from '../business-kyc/business-kyc.entity';
import { ResetPasswordTokenService } from '../reset-password-token/reset-password-token.service';
import ResetPasswordToken from '../reset-password-token/reset-password-token.entity';
import AccountType from '../account-type/account-type.entity';
import { Plan } from '../plan/plan.entity';
import { IndustryService } from '../industry/industry.service';
import Industry from '../industry/industry.entity';
import { UserSubscription } from '../user-subscription/user-subscription.entity';
import { UserSubscriptionHistory } from '../user-subscription-history/user-subscription-history.entity';
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672'],
          queue: 'nestjs_queue', // Queue name
          queueOptions: {
            durable: true, // Ensure this matches the durable setting in your Go consumer
          },
        },
      },
    ]),
    UserModule,
    // PassportModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      EmailVerificationToken,
      Role,
      ProductOwnerStaff,
      Country,
      State,
      Lga,
      IdentityType,
      RenterKyc,
      BusinessKyc,
      ResetPasswordToken,
      AccountType,
      Plan,
      Industry,
      UserSubscription,
      UserSubscriptionHistory
    ])
  ],
  providers: [
    AuthenticationService,
    UserService,
    Utility,
    EmailVerificationTokenService,
    JwtStrategy,
    CloudinaryService,
    RenterKycService,
    IdentityTypesService,
    BusinessKycService,
    ResetPasswordTokenService,
    IndustryService
  ],
  controllers: [AuthenticationController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthenticationModule { }


// PassportModule.register({ defaultStrategy: 'jwt' }),
