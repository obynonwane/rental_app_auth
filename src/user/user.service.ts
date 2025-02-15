import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './user.entity';
import { EntityManager, Repository } from 'typeorm';
import CreateUserDto from '../_dtos/create-user.dto';

import * as bcrypt from 'bcryptjs';
import { CustomHttpException } from '../_custom-methods/custom-http-exception';
import { PostgresErrorCode } from '../_enums/postgresErrorCodes.enum';
import { ClientProxy } from '@nestjs/microservices';
import { EmailVerificationTokenService } from '../email-verification-token/email-verification-token.service';
import CreateUserRoleDto from '../_dtos/create-role.dto';
import Role from '../role/role.entity';

import { JsonResponse } from './respose-interface';
import { UserType, UserTypeArray } from '../_enums/user-type.enum';
import ParticipantStaff from '../participant-staff/participant-staff.entity';

import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';
import { CreateStaffDto } from '../_dtos/create-staff.dto';
import { ResetPasswordTokenService } from '../reset-password-token/reset-password-token.service';
import ChangePasswordDto from '../_dtos/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private rabbitClient: ClientProxy,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(ParticipantStaff)
    private productOwnerStaffRepository: Repository<ParticipantStaff>,

    @InjectRepository(Country)
    private countryRepository: Repository<Country>,

    @InjectRepository(State)
    private stateRepository: Repository<State>,

    @InjectRepository(Lga)
    private lgaRepository: Repository<Lga>,

    private emailVerificationTokenService: EmailVerificationTokenService,

    private resetPasswordTokenService: ResetPasswordTokenService,
  ) { }

  public async getByEmail(email: string, password: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
      await this.verifyPassword(password, user.password);
      user.password = undefined;

      return {
        error: false,
        statusCode: HttpStatus.OK,
        message: 'user detail retrived succesfully',
        data: user,
      };
    } catch (error) {
      throw new CustomHttpException(
        'wrong credentials provided',
        HttpStatus.BAD_REQUEST,
        { statusCode: HttpStatus.BAD_REQUEST, error: true },
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    try {
      const isPasswordMatching = await bcrypt.compareSync(
        plainTextPassword,
        hashedPassword,
      );
      if (!isPasswordMatching) {
        throw new CustomHttpException(
          'wrong credentials provided',
          HttpStatus.BAD_REQUEST,
          { statusCode: HttpStatus.BAD_REQUEST, error: true },
        );
      }
    } catch (error) {
      throw new CustomHttpException(
        'error logging in user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true },
      );
    }
  }

  public async create(userData: CreateUserDto) {
    try {
      const newUser = this.userRepository.create({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        password: await this.createPasswordHash(userData.password),
      });
      const user = await this.userRepository.save(newUser);

      const token =
        await this.emailVerificationTokenService.createEmailverificationToken(
          userData.email,
        );

      const data = {
        email: user.email,
        phone: user.phone,
        email_verification_token: token.token,
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified,
        verification_link:
          `${process.env.ROOT_URL}` + '?token=' + `${token.token}`,
      };

      //send email verification mail - rabbitmq
      this.rabbitClient.emit('log.INFO', { name: 'auth', data: data });

      //make a request to logger service with the payload to submit logging - rabbitmQ
      this.rabbitClient.emit('log.INFO', { name: 'log', data: data });

      const userRole: CreateUserRoleDto = {
        user_type: UserType.PARTICIPANT,
      };
      // assign role
      await this.chooseRole(userRole, user);

      return {
        error: false,
        status_code: HttpStatus.ACCEPTED,
        message: 'user account created',
      };
    } catch (error) {
      if (error?.code == PostgresErrorCode.UniqueViolation) {
        throw new CustomHttpException(
          'user email already exist',
          HttpStatus.BAD_REQUEST,
          { statusCode: HttpStatus.BAD_REQUEST, error: true },
        );
      }
      throw new CustomHttpException(
        'error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true },
      );
    }
  }
  public async signupAdmin(userData: CreateUserDto) {
    try {
      const newUser = this.userRepository.create({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        password: await this.createPasswordHash(userData.password),
      });
      const user = await this.userRepository.save(newUser);

      const token =
        await this.emailVerificationTokenService.createEmailverificationToken(
          userData.email,
        );

      const data = {
        email: user.email,
        phone: user.phone,
        email_verification_token: token.token,
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified,
        verification_link:
          `${process.env.ROOT_URL}` + '?token=' + `${token.token}`,
      };

      //send email verification mail - rabbitmq
      this.rabbitClient.emit('log.INFO', { name: 'auth', data: data });

      //make a request to logger service with the payload to submit logging - rabbitmQ
      this.rabbitClient.emit('log.INFO', { name: 'log', data: data });

      const adminUser: CreateUserRoleDto = {
        user_type: UserType.ADMIN,
      };
      // assign role
      await this.chooseRole(adminUser, user);

      return {
        error: false,
        statusCode: HttpStatus.ACCEPTED,
        message: 'user account created',
      };
    } catch (error) {
      if (error?.code == PostgresErrorCode.UniqueViolation) {
        throw new CustomHttpException(
          'user email already exist',
          HttpStatus.BAD_REQUEST,
          { statusCode: HttpStatus.BAD_REQUEST, error: true },
        );
      }
      throw new CustomHttpException(
        'error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true },
      );
    }
  }

  public async verifyEmail(
    token: string,
  ): Promise<{ message: string; error: boolean; status_code: number }> {
    return await this.emailVerificationTokenService.verifyEmail(token);
  }

  public async createPasswordHash(password: string) {
    try {
      return await bcrypt.hash(password, bcrypt.genSaltSync(10));
    } catch (error) {
      throw new CustomHttpException(
        'error hasing password',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true },
      );
    }
  }

  public async getById(id: string) {
    console.log('this is the method');

    // Retrieve the user from the database, including roles
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles'], // Load roles
    });

    if (!user) {
      throw new CustomHttpException(
        'user with this id does not exist',
        HttpStatus.NOT_FOUND,
        { statusCode: HttpStatus.NOT_FOUND, error: true },
      );
    }

    // Extract roles
    const roles: string[] = user.roles.map((role) => role.name);

    // Construct the response
    const response = {
      user, // Include the original user object
      roles, // Include the extracted roles array
    };

    // Return the new response
    return response;
  }

  public async chooseRole(payload: CreateUserRoleDto, _user: User) {
    // do type assertion
    const selectedType = payload.user_type as UserType;

    // check if the user have role product owner
    const exists = UserTypeArray.includes(selectedType);

    // throe an exception if the user type is not what was sent
    if (!exists) {
      throw new CustomHttpException(
        `roled select not found`,
        HttpStatus.BAD_REQUEST,
        { statusCode: HttpStatus.BAD_REQUEST, error: true },
      );
    }

    // get the user making the call
    const user = await this.userRepository.findOne({
      where: { id: _user.id },
      relations: ['roles'], // Ensure roles are loaded with the user
    });

    if (!user) {
      // throw new Error('User not found');
      throw new CustomHttpException(`user not found`, HttpStatus.NOT_FOUND, {
        statusCode: HttpStatus.NOT_FOUND,
        error: true,
      });
    }

    // Find the role by name
    const role = await this.roleRepository.findOne({
      where: { name: payload.user_type },
    });

    if (!role) {
      // throw new Error('Role not found');

      // throw new Error(`User already has the role: ${role.name}`);
      throw new CustomHttpException(`role not found`, HttpStatus.NOT_FOUND, {
        statusCode: HttpStatus.NOT_FOUND,
        error: true,
      });
    }

    // Check if the user already has the role
    const hasRole = user.roles.some(
      (existingRole) => existingRole.id === role.id,
    );

    if (hasRole) {
      // throw new Error(`User already has the role: ${role.name}`);
      throw new CustomHttpException(
        `User already has the role: ${role.name}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: true },
      );
    }

    // Assign the role to the user
    user.roles.push(role);

    // Save the updated user entity
    return await this.userRepository.save(user);
  }

  public async participantCreateStaff(userData: CreateStaffDto, _user: any) {
    // Extract the user roles
    const userRoles = _user.data.roles;

    // Check if the user has the role 'PARTICIPANT'
    const isParticipant = userRoles.includes(UserType.PARTICIPANT);

    if (!isParticipant) {
      throw new CustomHttpException(
        'User does not have permission to create staff',
        HttpStatus.FORBIDDEN,
        { statusCode: HttpStatus.FORBIDDEN, error: true },
      );
    }

    const entityManager = this.userRepository.manager;

    await entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Check if a user with the same email already exists
        const existingUser = await transactionalEntityManager.findOne(User, {
          where: { email: userData.email },
        });
        if (existingUser) {
          throw new CustomHttpException(
            'A user with this email already exists',
            HttpStatus.CONFLICT,
            { statusCode: HttpStatus.BAD_REQUEST, error: true },
          );
        }

        // Check if a user with the same phone number already exists
        const existingUserByPhone = await transactionalEntityManager.findOne(
          User,
          { where: { phone: userData.phone } },
        );
        if (existingUserByPhone) {
          throw new CustomHttpException(
            'A user with this phone number already exists',
            HttpStatus.CONFLICT,
            { statusCode: HttpStatus.BAD_REQUEST, error: true },
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
        // save the new participant_staff user
        const staffUser = await transactionalEntityManager.save(User, newUser);

        // Assign the 'participant_staff' role to the new user
        const productOwnerStaffRole = await transactionalEntityManager.findOne(
          Role,
          { where: { name: userData.role } },
        );
        if (!productOwnerStaffRole) {
          throw new CustomHttpException(
            'Role "participant_staff" not found',
            HttpStatus.NOT_FOUND,
            { statusCode: HttpStatus.NOT_FOUND, error: true },
          );
        }

        // Assign the 'participant_staff' role to the new user
        if (!staffUser.roles) {
          staffUser.roles = [productOwnerStaffRole];
        } else {
          const hasRole = staffUser.roles.some(
            (existingRole) => existingRole.id === productOwnerStaffRole.id,
          );
          if (!hasRole) {
            console.log(productOwnerStaffRole, 'the user role');
            staffUser.roles.push(productOwnerStaffRole);
          }
        }
        //save the role
        await transactionalEntityManager.save(User, staffUser);

        // Assuming the current user is the product owner
        const theAccountOwner = await transactionalEntityManager.findOne(User, {
          where: { id: _user.data.id },
        });

        if (!theAccountOwner) {
          throw new CustomHttpException(
            'user creating staff not found',
            HttpStatus.NOT_FOUND,
            { statusCode: HttpStatus.NOT_FOUND, error: true },
          );
        }

        // Create the relationship between the product owner and the new staff
        const accountOwner = new ParticipantStaff();
        accountOwner.user = theAccountOwner;
        accountOwner.staff = staffUser;

        await transactionalEntityManager.save(ParticipantStaff, accountOwner);

        const data = {
          email: staffUser.email,
        };

        // Send email verification mail
        this.rabbitClient.emit('log.INFO', {
          name: 'auth_staff_creation',
          data: data,
        });

        // Log the creation
        this.rabbitClient.emit('log.INFO', { name: 'log', data: data });
      },
    );
    return {
      error: false,
      statusCode: HttpStatus.CREATED,
      message:
        'Staff user created and associated successfully, emails have been sent to the user',
    };
  }

  public async getCountries() {
    const response: JsonResponse = {
      error: false,
      message: 'countries retrived succesfully',
      statusCode: HttpStatus.OK,
      data: await this.countryRepository.find(),
    };
    return response;
  }
  public async getStates() {
    const response: JsonResponse = {
      error: false,
      message: 'states retrived succesfully',
      statusCode: HttpStatus.OK,
      data: await this.stateRepository.find(),
    };
    return response;
  }

  public async getLgas() {
    const response: JsonResponse = {
      error: false,
      message: 'lgas retrived succesfully',
      statusCode: HttpStatus.OK,
      data: await this.lgaRepository.find(),
    };
    return response;
  }
  public async getCountryState(id: string) {
    const response: JsonResponse = {
      error: false,
      message: 'country states retrived succesfully',
      statusCode: HttpStatus.OK,
      data: await this.stateRepository.find({ where: { country: { id: id } } }),
    };
    return response;
  }

  public async getStateLgas(id: string) {
    const response: JsonResponse = {
      error: false,
      message: 'state lgas retrived succesfully',
      statusCode: HttpStatus.OK,
      data: await this.lgaRepository.find({ where: { state: { id: id } } }),
    };
    return response;
  }

  public async sendResetPasswordEmail(email: string) {
    try {
      // check if user with email exist 
      let user = await this.userRepository.findOne({ where: { email: email } })

      if (!user) {

        const response: JsonResponse = {
          error: true,
          message: 'email supplied cannot be found',
          statusCode: HttpStatus.BAD_REQUEST,
          data: null
        };
        return response;
      }

      // generate verification token
      const token =
        await this.resetPasswordTokenService.createEmailverificationToken(
          user.email,
        );

      const data = {
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified,
        verification_link:
          `${process.env.FORGOT_PASSWORD_URL}` + '?token=' + `${token.token}`,
      };



      //send email verification mail - rabbitmq
      this.rabbitClient.emit('log.INFO', { name: 'reset-password-email', data: data });

      const response: JsonResponse = {
        error: false,
        message: 'reset password email sent',
        statusCode: HttpStatus.ACCEPTED,
        data: null
      };
      return response;
    } catch (error) {
      console.log(error)
      throw new CustomHttpException(
        'error sending reset password email',
        HttpStatus.BAD_REQUEST,
        { statusCode: HttpStatus.BAD_REQUEST, error: true },
      );
    }
  }


  public async changePassword(userdata: ChangePasswordDto) {
    try {
      const token = await this.resetPasswordTokenService.getToken(userdata.token)

      if (!token) {
        const response: JsonResponse = {
          error: true,
          message: 'token supplied cannot be found',
          statusCode: HttpStatus.BAD_REQUEST,
          data: null
        };
        return response;
      }

      if (token.expired == true) {
        const response: JsonResponse = {
          error: true,
          message: 'token already expired',
          statusCode: HttpStatus.BAD_REQUEST,
          data: null
        };
        return response;
      }

      // update the user
      let user = await this.userRepository.findOne({ where: { email: token.email } })

      if (!user) {
        const response: JsonResponse = {
          error: true,
          message: 'user not found',
          statusCode: HttpStatus.BAD_REQUEST,
          data: null
        };
        return response;
      }

      user.password = await this.createPasswordHash(userdata.password)
      await this.userRepository.save(user)

      // update the token as expired 
      await this.resetPasswordTokenService.deactivateToken(userdata.token)


      const response: JsonResponse = {
        error: false,
        message: 'user password changed succesfully',
        statusCode: HttpStatus.ACCEPTED,
        data: null
      };
      return response;

    } catch (error) {
      throw new CustomHttpException(
        'error changing user password',
        HttpStatus.BAD_REQUEST,
        { statusCode: HttpStatus.BAD_REQUEST, error: true },
      );
    }
  }
}
