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
import Role from '../role/role.entity';
import Permission from '../permission/permission.entity';
import { JsonResponse } from './respose-interface';




const configService = new ConfigService();

@Injectable()
export class UserService {
    constructor(
        @Inject('RABBITMQ_SERVICE')
        private rabbitClient: ClientProxy,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Role)
        private roleRepository: Repository<Role>,

        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,

        private emailVerificationTokenService: EmailVerificationTokenService,

    ) { }

    public async getByEmail(email: string, password: string) {
        try {
            const user = await this.userRepository.findOne({ where: { email: email } });
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

            const newUser = this.userRepository.create({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                password: await this.createPasswordHash(userData.password)
            });
            const user = await this.userRepository.save(newUser);

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


    public async getById(id: string) {
        console.log("this is the method")

        // Retrieve the user from the database, including roles and permissions
        const user = await this.userRepository.findOne({
            where: { id: id },
            relations: ['roles', 'roles.permissions'], // Load roles and permissions
        });

        if (!user) {
            throw new CustomHttpException('user with this id does not exist', HttpStatus.NOT_FOUND, { statusCode: HttpStatus.NOT_FOUND, error: true });
        }

        // Extract roles and permissions
        const roles: string[] = user.roles.map(role => role.name);
        const permissions: string[] = user.roles.flatMap(role => role.permissions.map(permission => permission.name));

        // Construct the response
        const response = {
            user,         // Include the original user object
            roles,        // Include the extracted roles array
            permissions,  // Include the extracted permissions array
        }

        // Return the new response
        return response;
    }



    public async chooseRole(payload: CreateUserRoleDto, _user: User) {


        // get the user
        const user = await this.userRepository.findOne({
            where: { id: _user.id },
            relations: ['roles'],  // Ensure roles are loaded with the user
        });

        if (!user) {
            // throw new Error('User not found');
            throw new CustomHttpException(`user not found`, HttpStatus.NOT_FOUND, { statusCode: HttpStatus.NOT_FOUND, error: true, });

        }

        // Find the role by name
        const role = await this.roleRepository.findOne({ where: { name: payload.user_type } });

        if (!role) {
            // throw new Error('Role not found');

            // throw new Error(`User already has the role: ${role.name}`);
            throw new CustomHttpException(`role not found`, HttpStatus.NOT_FOUND, { statusCode: HttpStatus.NOT_FOUND, error: true, });

        }

        // Check if the user already has the role
        const hasRole = user.roles.some(existingRole => existingRole.id === role.id);

        if (hasRole) {
            // throw new Error(`User already has the role: ${role.name}`);
            throw new CustomHttpException(`User already has the role: ${role.name}`, HttpStatus.INTERNAL_SERVER_ERROR, { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true, });

        }

        // Assign the role to the user
        user.roles.push(role);

        // change the first_time_login = false
        user.first_time_login = false;

        // Save the updated user entity
        return await this.userRepository.save(user);
        // get the role 
        // then assign the role to user


    }

    public async productOwnerPermission(user: User) {
        const role = await this.roleRepository.findOne({ where: { name: 'product_owner' }, relations: ['permissions'], });
        // Construct the response
        const response: JsonResponse = {
            error: false,
            message: 'Permissions retrieved succesfully',
            statusCode: HttpStatus.OK,
            data: {
                role,
            }
        };


        // Return the new response
        return response;
    }


    public async productOwnerCreateStaff(userData: CreateUserDto) {
        try {

            const newUser = this.userRepository.create({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                password: await this.createPasswordHash(userData.password)
            });
            const user = await this.userRepository.save(newUser);

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
}
