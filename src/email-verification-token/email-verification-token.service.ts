import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import EmailVerificationToken from './email-verification-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utility } from '../utilities/utility';
import { UserService } from 'src/user/user.service';
import User from '../user/user.entity';

@Injectable()
export class EmailVerificationTokenService {

    constructor(

        @InjectRepository(EmailVerificationToken)
        private emailVerificationTokenRepository: Repository<EmailVerificationToken>,

        private utilities: Utility,

        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) { }


    public async createEmailverificationToken(email: string) {
        try {
            const token = this.emailVerificationTokenRepository.create({
                token: await this.utilities.generateRandomString(),
                email: email,
            });
            return await this.emailVerificationTokenRepository.save(token);

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }


    public async updateCreateEmailverificationToken(email: string) {
        try {

            const token = await this.emailVerificationTokenRepository.findOne({ where: { email: email } })
            token.token = await this.utilities.generateRandomString()

            await this.emailVerificationTokenRepository.save(token)
            return await this.emailVerificationTokenRepository.save(token);

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    public async verifyEmail(token: string): Promise<{ message: string, error: boolean, status_code: number }> {
        try {
            // Find the record by email
            const tokenEntity = await this.emailVerificationTokenRepository.findOne({ where: { token: token } });
            if (!tokenEntity) {
                return {
                    "message": `Token not found for email`,
                    error: true,
                    status_code: 401,
                }
            }

            // check if token created at is above 1 hour
            if (tokenEntity?.created_at) {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

                if (new Date(tokenEntity.created_at) < oneHourAgo) {
                    return {
                        message: `email verification token expired`,
                        error: true,
                        status_code: 400,
                    };
                }
            }

            if (tokenEntity?.expired) {
                return {
                    "message": `email verification token already used`,
                    error: true,
                    status_code: 400,
                }
            }
            // find and update use status
            const user = await this.userRepository.findOne({ where: { email: tokenEntity.email } });
            user.verified = true;

            //save updated entity back to database
            await this.userRepository.save(user);

            //update emailVerificationTokenRepository
            tokenEntity.expired = true
            await this.emailVerificationTokenRepository.save(tokenEntity)

            return {
                "message": "account verified succesfully",
                error: false,
                status_code: 200,
            }
        } catch (error) {
            return {
                "message": `error verifying user`,
                error: true,
                status_code: 400,
            }
        }
    }


    public async sendEmailToStaffForAccountCreation(email: string) {
        try {
            const token = this.emailVerificationTokenRepository.create({
                token: await this.utilities.generateRandomString(),
                email: email,
            });
            return await this.emailVerificationTokenRepository.save(token);

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}
