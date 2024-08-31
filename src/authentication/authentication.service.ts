import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import CreateUserDto from 'src/_dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import CreateUserRoleDto from 'src/_dtos/create-role.dto';
import User from 'src/user/user.entity';

@Injectable()
export class AuthenticationService {

    constructor(
        private userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    public getCookieWithJwtToken(userId: string) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload);
        return token;
    }

    async createUser(userData: CreateUserDto) {
        return await this.userService.create(userData)
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

    public async chooseRole(payload: CreateUserRoleDto, user: User) {
        return await this.userService.chooseRole(payload, user);
    }

    public async productOwnerPermission(user: User) {
        return await this.userService.productOwnerPermission(user);
    }

}
