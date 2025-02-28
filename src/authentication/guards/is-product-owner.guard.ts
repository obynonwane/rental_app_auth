import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { UserType } from '../../_enums/user-type.enum';

@Injectable()
export class IsProductOwnerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const roleArray = request.user?.data?.roles;

        // Check if roles exist and include "PARTICIPANT"
        if (!roleArray || !roleArray.includes(UserType.PARTICIPANT)) {
            throw new HttpException(
                {
                    error: true,
                    status_code: HttpStatus.FORBIDDEN,
                    message: 'User is not a participant',
                    data: {},
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return true; // Allow access if check is passed
    }
}
