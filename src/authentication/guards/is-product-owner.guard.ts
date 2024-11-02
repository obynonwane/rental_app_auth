import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { UserType } from '../../_enums/user-type.enum';

@Injectable()
export class IsProductOwnerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const roleArray = request.user?.data?.roles;

        // Check if roles exist and include "RENTER"
        if (!roleArray || !roleArray.includes(UserType.PRODUCT_OWNER)) {
            throw new HttpException(
                {
                    error: true,
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'User is not a product owner',
                    data: {},
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return true; // Allow access if check is passed
    }
}
