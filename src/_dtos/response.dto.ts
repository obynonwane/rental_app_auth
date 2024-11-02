// response.dto.ts
export class ResponseDTO<T = any> {
    error: boolean;
    statusCode: number;
    message: string;
    data: T;
}
