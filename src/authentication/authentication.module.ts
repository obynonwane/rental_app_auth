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
import Permission from '../permission/permission.entity';
import ProductOwnerStaff from '../product-owner-staff/product-owner-staff.entity';
import UserPermission from '../user-permission/user-permission.entity';
import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
      Permission,
      ProductOwnerStaff,
      UserPermission,
      Country,
      State,
      Lga
    ])
  ],
  providers: [
    AuthenticationService,
    UserService,
    Utility,
    EmailVerificationTokenService,
    JwtStrategy,
    CloudinaryService
  ],
  controllers: [AuthenticationController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthenticationModule { }


// PassportModule.register({ defaultStrategy: 'jwt' }),
