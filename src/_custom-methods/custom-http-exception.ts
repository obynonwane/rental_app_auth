import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
    private errorDetails: any;

    constructor(message: string, status_code: HttpStatus, errorDetails: any) {
        super(message, status_code);
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
