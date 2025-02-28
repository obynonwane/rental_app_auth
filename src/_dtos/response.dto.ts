// response.dto.ts
export class ResponseDTO<T = any> {
    error: boolean;
    status_code: number;
    message: string;
    data: T;
}
