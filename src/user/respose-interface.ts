import Role from '../role/role.entity';

export interface Data {
  role: Role;
}

export interface JsonResponse {
  error: boolean;
  message: string;
  statusCode: number;
  data: any;
}
