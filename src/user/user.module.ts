import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from "./user.entity"
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailVerificationTokenService } from '../email-verification-token/email-verification-token.service';
import EmailVerificationToken from '../email-verification-token/email-verification-token.entity';
import { Utility } from '../utilities/utility';



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
    TypeOrmModule.forFeature([User, EmailVerificationToken])],
  providers: [UserService, EmailVerificationTokenService, Utility]
})
export class UserModule { }
