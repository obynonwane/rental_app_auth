import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
    private errorDetails: any;

    constructor(message: string, statusCode: HttpStatus, errorDetails: any) {
        super(message, statusCode);
        this.errorDetails = errorDetails;
    }

    getResponse(): object {
        const response = super.getResponse();

        if (typeof response === 'string') {
            return {
                message: response,
                ...this.errorDetails,
            };
        }
        return {
            ...response,
            ...this.errorDetails,
        };
    }
}
