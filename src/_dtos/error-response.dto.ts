// error-response.dto.ts
export interface ErrorResponseDTO {
    error: boolean;
    statusCode: number;
    message: string;
    data: any;
}
