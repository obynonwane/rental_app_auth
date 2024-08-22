
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

import { CustomHttpException } from '../_custom-methods/custom-http-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthenticationService) {
        super({
            usernameField: 'email'
        });
    }
    async validate(email: string, password: string): Promise<any> {
        const user = this.authenticationService.getAuthenticatedUser(email, password);
        if (!user) {
            throw new CustomHttpException('user unauthorised', HttpStatus.UNAUTHORIZED, { statusCode: HttpStatus.UNAUTHORIZED, status: false });
        }
        return user
    }
}