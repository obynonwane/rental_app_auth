import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './user.entity';
import { Repository } from 'typeorm';
import CreateUserDto from '../_dtos/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { CustomHttpException } from '../_custom-methods/custom-http-exception';
import { PostgresErrorCode } from '../_enums/postgresErrorCodes.enum';
import { ClientProxy } from '@nestjs/microservices';
import { EmailVerificationTokenService } from '../email-verification-token/email-verification-token.service';
import EmailVerificationToken from '../email-verification-token/email-verification-token.entity';
import CreateUserRoleDto from '../_dtos/create-role.dto';




const configService = new ConfigService();

@Injectable()
export class UserService {
    constructor(
        @Inject('RABBITMQ_SERVICE')
        private rabbitClient: ClientProxy,

        @InjectRepository(User)
        private usersRepository: Repository<User>,

        private emailVerificationTokenService: EmailVerificationTokenService,

    ) { }

    public async getByEmail(email: string, password: string) {
        try {
            const user = await this.usersRepository.findOne({ where: { email: email } });
            await this.verifyPassword(password, user.password);
            user.password = undefined;


            return {
                error: false,
                statusCode: HttpStatus.OK,
                message: "user detail retrived succesfully",
                data: user
            }


        } catch (error) {
            throw new CustomHttpException('wrong credentials provided', HttpStatus.BAD_REQUEST, { statusCode: HttpStatus.BAD_REQUEST, error: true });
        }
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        try {
            const isPasswordMatching = await bcrypt.compareSync(plainTextPassword, hashedPassword);
            if (!isPasswordMatching) {
                throw new CustomHttpException('wrong credentials provided', HttpStatus.BAD_REQUEST, { statusCode: HttpStatus.BAD_REQUEST, error: true });
            }
        } catch (error) {
            throw new CustomHttpException('error logging in user', HttpStatus.INTERNAL_SERVER_ERROR, { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true });
        }
    }

    public async create(userData: CreateUserDto) {
        try {

            const newUser = this.usersRepository.create({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                password: await this.createPasswordHash(userData.password)
            });
            const user = await this.usersRepository.save(newUser);

            const token = await this.emailVerificationTokenService.createEmailverificationToken(userData.email)


            const data = {
                email: user.email,
                phone: user.phone,
                email_verification_token: token.token,
                first_name: user.first_name,
                last_name: user.last_name,
                verified: user.verified,
                verification_link: `${process.env.ROOT_URL}` + '?token=' + `${token.token}`
            }

            //send email verification mail - rabbitmq
            this.rabbitClient.emit('log.INFO', { name: 'auth', data: data })

            //make a request to logger service with the payload to submit logging - rabbitmQ
            this.rabbitClient.emit('log.INFO', { name: 'log', data: data })

            return {
                error: false,
                statusCode: HttpStatus.ACCEPTED,
                message: "user account created",
            }


        } catch (error) {
            if (error?.code == PostgresErrorCode.UniqueViolation) {
                throw new CustomHttpException('user email already exist', HttpStatus.BAD_REQUEST, { statusCode: HttpStatus.BAD_REQUEST, error: true, });
            }
            throw new CustomHttpException('error creating user', HttpStatus.INTERNAL_SERVER_ERROR, { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true });
        }

    }

    public async verifyEmail(token: string): Promise<{ message: string, error: boolean, status_code: number }> {
        return await this.emailVerificationTokenService.verifyEmail(token)
    }

    public async createPasswordHash(password: string) {
        try {
            return await bcrypt.hash(password, bcrypt.genSaltSync(10));
        } catch (error) {
            throw new CustomHttpException('error hasing password', HttpStatus.INTERNAL_SERVER_ERROR, { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true, });
        }
    }

    public async getById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: id } });
        if (user) {
            return user;
        }
        throw new CustomHttpException('user with this id does not exist', HttpStatus.NOT_FOUND, { statusCode: HttpStatus.NOT_FOUND, error: true, });

    }


    public async chooseRole(payload: CreateUserRoleDto, user: User) {

        try {
            // get the role 
            // then assign the role to user
        } catch (error) {

        }

    }
}
