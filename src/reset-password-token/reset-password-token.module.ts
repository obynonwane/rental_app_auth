import { Module } from '@nestjs/common';
import { ResetPasswordTokenController } from './reset-password-token.controller';
import { ResetPasswordTokenService } from './reset-password-token.service';
import EmailVerificationToken from '../email-verification-token/email-verification-token.entity';
import User from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import ResetPasswordToken from '../reset-password-token/reset-password-token.entity';
import { Utility } from '../utilities/utility';

@Module({
  imports: [TypeOrmModule.forFeature([ResetPasswordToken, User])],
  controllers: [ResetPasswordTokenController],
  providers: [ResetPasswordTokenService, Utility]
})
export class ResetPasswordTokenModule { }
