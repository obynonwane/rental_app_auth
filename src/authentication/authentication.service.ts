import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import CreateUserDto from 'src/_dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import CreateUserRoleDto from 'src/_dtos/create-role.dto';
import User from '../user/user.entity';
import LoginUserDto from '../_dtos/login-user.dto';
import AssignUserPermissionDto from '../_dtos/assign-permission.dto';

@Injectable()
export class AuthenticationService {

    constructor(
        private userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    public async getJwtToken(_user: LoginUserDto) {


        const user = await this.userService.getByEmail(_user.email, _user.password);

        const userId = user.data.id
        console.log(userId);
        // return user
        const payload: TokenPayload = { userId };
        console.log(payload);
        const token = this.jwtService.sign(payload);
        console.log(token)
        return token;
    }

    async createUser(userData: CreateUserDto) {
        return await this.userService.create(userData)
    }
    async productOwnerCreateStaff(userData: CreateUserDto, user: any) {
        return await this.userService.productOwnerCreateStaff(userData, user)
    }

    public async verifyEmail(token: string): Promise<{ message: string, error: boolean, status_code: number }> {
        return await this.userService.verifyEmail(token);
    }

    public async getAuthenticatedUser(email: string, password: string) {
        return await this.userService.getByEmail(email, password);
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    public async chooseRole(payload: CreateUserRoleDto, user: any) {
        return await this.userService.chooseRole(payload, user);
    }

    public async productOwnerPermission(user: User) {
        return await this.userService.productOwnerPermission(user);
    }

    public async productOwnerAssignPermission(user: any, payload: AssignUserPermissionDto) {
        return await this.userService.productOwnerAssignPermission(user, payload);
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
}
