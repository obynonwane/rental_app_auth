import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from "./user.entity"
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailVerificationTokenService } from '../email-verification-token/email-verification-token.service';
import EmailVerificationToken from '../email-verification-token/email-verification-token.entity';
import { Utility } from '../utilities/utility';
import Role from '../role/role.entity';
import ParticipantStaff from '../participant-staff/participant-staff.entity';
import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';
import { ResetPasswordTokenService } from '../reset-password-token/reset-password-token.service';
import ResetPasswordToken from '../reset-password-token/reset-password-token.entity';
import AccountType from '../account-type/account-type.entity';
import { BusinessKyc } from '../business-kyc/business-kyc.entity';
import { RenterKyc } from '../renter-kyc/renter-kyc.entity';
import SavedInventory from '../saved-inventory/saved-inventory.entity';
import { UserSubscription } from '../user-subscription/user-subscription.entity';
import { Plan } from '../plan/plan.entity';
import { UserSubscriptionHistory } from '../user-subscription-history/user-subscription-history.entity';



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
    TypeOrmModule.forFeature([
      User,
      EmailVerificationToken,
      Role,
      ParticipantStaff,
      Country,
      State,
      Lga,
      ResetPasswordToken,
      AccountType,
      BusinessKyc,
      RenterKyc,
      SavedInventory,
      UserSubscription,
      Plan,
      UserSubscriptionHistory
    ])],
  providers: [UserService, EmailVerificationTokenService, Utility, ResetPasswordTokenService]
})
export class UserModule { }
