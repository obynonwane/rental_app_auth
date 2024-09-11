import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './user.entity';
import { EntityManager, Repository } from 'typeorm';
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
import { UserType, UserTypeArray } from "../_enums/user-type.enum"
import ProductOwnerStaff from "../product-owner-staff/product-owner-staff.entity"
import AssignUserPermissionDto from '../_dtos/assign-permission.dto';
import UserPermission from '../user-permission/user-permission.entity';







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

        @InjectRepository(ProductOwnerStaff)
        private productOwnerStaffRepository: Repository<ProductOwnerStaff>,

        @InjectRepository(UserPermission)
        private userPermissionRepository: Repository<UserPermission>,

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



    public async chooseRole(payload: CreateUserRoleDto, _user: any) {

        // do type assertion 
        const selectedType = payload.user_type as UserType

        // check if the user have role product owner
        const exists = UserTypeArray.includes(selectedType);

        // throe an exception if the user type is not what was sent
        if (!exists) {
            throw new CustomHttpException(`roled select not found`, HttpStatus.BAD_REQUEST, { statusCode: HttpStatus.BAD_REQUEST, error: true, });
        }

        // get the user making the call
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


    public async productOwnerCreateStaff(userData: CreateUserDto, _user: any) {
        // Extract the user roles
        const userRoles = _user.data.roles;

        console.log(userRoles)

        // Check if the user has the role 'PRODUCT_OWNER'
        const isProductOwner = userRoles.includes(UserType.PRODUCT_OWNER);

        if (!isProductOwner) {
            throw new CustomHttpException(
                'User does not have permission to create staff',
                HttpStatus.FORBIDDEN,
                { statusCode: HttpStatus.FORBIDDEN, error: true }
            );
        }

        const entityManager = this.userRepository.manager;

        await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {

            // Check if a user with the same email already exists
            const existingUser = await transactionalEntityManager.findOne(User, { where: { email: userData.email } });
            if (existingUser) {
                throw new CustomHttpException(
                    'A user with this email already exists',
                    HttpStatus.CONFLICT,
                    { statusCode: HttpStatus.BAD_REQUEST, error: true }
                );
            }

            // Check if a user with the same phone number already exists
            const existingUserByPhone = await transactionalEntityManager.findOne(User, { where: { phone: userData.phone } });
            if (existingUserByPhone) {
                throw new CustomHttpException(
                    'A user with this phone number already exists',
                    HttpStatus.CONFLICT,
                    { statusCode: HttpStatus.BAD_REQUEST, error: true }
                );
            }

            // Create a new staff user
            const newUser = this.userRepository.create({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                password: await this.createPasswordHash(userData.password),
            });
            // save the new product_owner_staff user
            const staffUser = await transactionalEntityManager.save(User, newUser);

            // Assign the 'product_owner_staff' role to the new user
            const productOwnerStaffRole = await transactionalEntityManager.findOne(Role, { where: { name: UserType.PRODUCT_OWNER_STAFF } });
            if (!productOwnerStaffRole) {
                throw new CustomHttpException(
                    'Role "product_owner_staff" not found',
                    HttpStatus.NOT_FOUND,
                    { statusCode: HttpStatus.NOT_FOUND, error: true }
                );
            }

            // Assign the 'product_owner_staff' role to the new user
            if (!staffUser.roles) {
                staffUser.roles = [productOwnerStaffRole];
            } else {
                const hasRole = staffUser.roles.some(existingRole => existingRole.id === productOwnerStaffRole.id);
                if (!hasRole) {
                    console.log(productOwnerStaffRole, "the user role")
                    staffUser.roles.push(productOwnerStaffRole);
                }
            }
            //save the role
            await transactionalEntityManager.save(User, staffUser);


            // Assuming the current user is the product owner
            const productOwnerUser = await transactionalEntityManager.findOne(User, { where: { id: _user.data.id } });

            if (!productOwnerUser) {
                throw new CustomHttpException(
                    'Product Owner user not found',
                    HttpStatus.NOT_FOUND,
                    { statusCode: HttpStatus.NOT_FOUND, error: true }
                );
            }

            // Create the relationship between the product owner and the new staff
            const productOwnerStaff = new ProductOwnerStaff();
            productOwnerStaff.productOwner = productOwnerUser;
            productOwnerStaff.staff = staffUser;

            await transactionalEntityManager.save(ProductOwnerStaff, productOwnerStaff);

            const data = {
                email: staffUser.email,
            };

            // Send email verification mail
            this.rabbitClient.emit('log.INFO', { name: 'auth_staff_creation', data: data });

            // Log the creation
            this.rabbitClient.emit('log.INFO', { name: 'log', data: data });
        });

        return {
            error: false,
            statusCode: HttpStatus.CREATED,
            message: 'Staff user created and associated successfully, emails have been sent to the user',
        };
    }


    public async productOwnerAssignPermission(user: any, payload: AssignUserPermissionDto): Promise<JsonResponse> {
        try {

            // 1. check if user have permission
            if (!user.data.roles.includes(UserType.PRODUCT_OWNER)) {
                throw new CustomHttpException(
                    `user have no authorization to assign permission`,
                    HttpStatus.UNAUTHORIZED,
                    { statusCode: HttpStatus.UNAUTHORIZED, error: false }
                );
            }
            // 2. Get the user 
            const staff = await this.userRepository.findOne({ where: { id: payload.user_id } });
            if (!staff) {
                throw new CustomHttpException(
                    `User with ID ${payload.user_id} not found.`,
                    HttpStatus.NOT_FOUND,
                    { statusCode: HttpStatus.NOT_FOUND, error: true }
                );
            }

            // 3. Get the permission
            const permission = await this.permissionRepository.findOne({ where: { id: payload.permission_id } });
            if (!permission) {
                throw new CustomHttpException(
                    `Permission with ID ${payload.permission_id} not found.`,
                    HttpStatus.NOT_FOUND,
                    { statusCode: HttpStatus.NOT_FOUND, error: true }
                );
            }

            // 4. Check if the user already has the permission
            const existingPermission = await this.userPermissionRepository.findOne({
                where: {
                    user: { id: payload.user_id },  // Assuming 'user' is a relation field
                    permission: { id: payload.permission_id }  // Assuming 'permission' is a relation field
                }
            });


            if (existingPermission) {
                const response: JsonResponse = {
                    error: true,
                    message: 'User already has this permission',
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: null
                };
                return response;
            }

            // 5. Assign the permission 
            const new_permission = this.userPermissionRepository.create({
                user: staff,
                permission: permission
            });

            // Save the new permission assignment
            await this.userPermissionRepository.save(new_permission);

            new_permission.user.password = undefined;
            // Successful response
            const response: JsonResponse = {
                error: false,
                message: 'Permission assigned successfully',
                statusCode: HttpStatus.OK,
                data: new_permission,
            };

            return response;
        } catch (error) {
            // Log the error if needed (e.g., to a monitoring service)
            console.error('Error during permission assignment:', error);

            // Error response
            const response: JsonResponse = {
                error: true,
                message: error.message || 'An error occurred while assigning the permission.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
            };

            return response;
        }
    }



}
