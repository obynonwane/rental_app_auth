// error-response.dto.ts
export interface ErrorResponseDTO {
    error: boolean;
    status_code: number;
    message: string;
    data: any;
}
