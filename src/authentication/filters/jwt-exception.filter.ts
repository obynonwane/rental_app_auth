import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let customMessage = 'User unauthorized';
        if (exception.message.includes('expired')) {
            customMessage = 'Token has expired';
        } else if (exception.message.includes('Invalid token')) {
            customMessage = 'Invalid token';
        }

        response.status(HttpStatus.UNAUTHORIZED).json({
            error: true,
            status_code: HttpStatus.UNAUTHORIZED,
            message: customMessage,
        });
    }
}
