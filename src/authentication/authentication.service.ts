import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import CreateUserDto from 'src/_dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import CreateUserRoleDto from 'src/_dtos/create-role.dto';
import User from '../user/user.entity';
import LoginUserDto from '../_dtos/login-user.dto';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import RenterKycDto from '../_dtos/renter-kyc.dto';
import { IdentityTypesService } from '../identity-types/identity-types.service';
import { RenterKycService } from '../renter-kyc/renter-kyc.service';
import BusinessKycDto from '../_dtos/business-kyc.dto';
import { BusinessKycService } from '../business-kyc/business-kyc.service';
import { UserTypeArray } from '../_enums/user-type.enum';
import { CreateStaffDto } from '../_dtos/create-staff.dto';
import ResetPasswordEmailDto from '../_dtos/reset-password-email.dto';
import ChangePasswordDto from '../_dtos/change-password.dto';
import RequestPasswordVerificationEmailDto from '../_dtos/request-password-verification-email.dto';
import { IndustryService } from '../industry/industry.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private industryService: IndustryService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private cloudinaryService: CloudinaryService,
    private identityTypesService: IdentityTypesService,
    private renterKycService: RenterKycService,
    private businessKycService: BusinessKycService,
  ) { }

  public async getJwtToken(_user: LoginUserDto) {
    const user = await this.userService.getByEmail(_user.email, _user.password);

    if (!user.data.verified) {
      return {
        error: true,
        status_code: HttpStatus.UNAUTHORIZED,
        message: 'email not verified, please verify your email',
        data: {}
      }
    }
    const userId = user.data.id;

    // return user
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);

    // return the user 


    return {
      error: false,
      status_code: HttpStatus.ACCEPTED,
      message: 'logged-in successfully',
      data: {
        access_token: token,
        detail: (await this.userService.getUser(userId)).data
      },
    }
  }




  async createUser(userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  async requestVerificationEmail(userData: RequestPasswordVerificationEmailDto) {
    return await this.userService.requestVerificationEmail(userData);
  }
  async signupAdmin(userData: CreateUserDto) {
    return await this.userService.signupAdmin(userData);
  }
  async participantCreateStaff(userData: CreateStaffDto, user: any) {
    return await this.userService.participantCreateStaff(userData, user);
  }

  public async verifyEmail(
    token: string,
  ): Promise<{ message: string; error: boolean; status_code: number }> {
    return await this.userService.verifyEmail(token);
  }

  public async getAuthenticatedUser(email: string, password: string) {
    return await this.userService.getByEmail(email, password);
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public async chooseRole(payload: CreateUserRoleDto, user: User) {
    return await this.userService.chooseRole(payload, user);
  }

  public async getCountries() {
    return await this.userService.getCountries();
  }
  public async getStates() {
    return await this.userService.getStates();
  }
  public async getLgas() {
    return await this.userService.getLgas();
  }

  public async getCountryState(id: string) {
    return await this.userService.getCountryState(id);
  }

  public async getStateLgas(id: string) {
    return await this.userService.getStateLgas(id);
  }

  public async kycRenter(details: RenterKycDto) {
    await this.cloudinaryService.uploadRenterKyc(details);
  }

  public async retriveIdentificationTypes() {
    return await this.identityTypesService.getAll();
  }

  public async retriveIndustries() {
    return await this.industryService.getAll();
  }

  public async kycBusiness(detail: BusinessKycDto, userId: string) {
    return await this.businessKycService.createKyc(detail, userId);
  }

  public async retriveUserTypes() {
    const userTypes = {};
    UserTypeArray.map((x) => {
      if (x == 'participant' || x == 'participant_staff') {
        userTypes[x] = x.replace(/_/g, ' ');
      }
    });
    return userTypes;
  }

  public async sendResetPasswordEmail(userdata: ResetPasswordEmailDto) {
    return await this.userService.sendResetPasswordEmail(userdata.email);
  }

  public async changePassword(userdata: ChangePasswordDto) {
    return await this.userService.changePassword(userdata);
  }
}
