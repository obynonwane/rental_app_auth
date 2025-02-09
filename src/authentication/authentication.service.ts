import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private cloudinaryService: CloudinaryService,
    private identityTypesService: IdentityTypesService,
    private renterKycService: RenterKycService,
    private businessKycService: BusinessKycService,
  ) { }

  public async getJwtToken(_user: LoginUserDto) {
    const user = await this.userService.getByEmail(_user.email, _user.password);

    const userId = user.data.id;
    console.log(userId);
    // return user
    const payload: TokenPayload = { userId };
    console.log(payload);
    const token = this.jwtService.sign(payload);
    console.log(token);
    return token;
  }

  async createUser(userData: CreateUserDto) {
    return await this.userService.create(userData);
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
