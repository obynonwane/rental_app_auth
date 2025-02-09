import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ResetPasswordToken from './reset-password-token.entity';
import { Utility } from '../utilities/utility';
import User from '../user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResetPasswordTokenService {

    constructor(
        @InjectRepository(ResetPasswordToken)
        private resetPasswordTokenRepository: Repository<ResetPasswordToken>,
        private utilities: Utility,
    ) { }

    public async createEmailverificationToken(email: string) {
        try {
            const token = this.resetPasswordTokenRepository.create({
                token: await this.utilities.generateRandomString(),
                email: email,
            });
            return await this.resetPasswordTokenRepository.save(token);

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    public async getToken(token: string) {
        try {
            return await this.resetPasswordTokenRepository.findOne({ where: { token: token } });

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    public async deactivateToken(token: string) {
        try {
            const data = await this.resetPasswordTokenRepository.findOne({ where: { token: token } });
            data.expired = true
            await this.resetPasswordTokenRepository.save(data)

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}
