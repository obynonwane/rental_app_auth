import { Module } from '@nestjs/common';
import { EmailVerificationTokenController } from './email-verification-token.controller';
import { EmailVerificationTokenService } from './email-verification-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import EmailVerificationToken from './email-verification-token.entity';
import { Utility } from '../utilities/utility';
import { UserService } from '../user/user.service';
import User from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationToken, User])],
  controllers: [EmailVerificationTokenController],
  providers: [EmailVerificationTokenService, Utility]
})
export class EmailVerificationTokenModule { }
