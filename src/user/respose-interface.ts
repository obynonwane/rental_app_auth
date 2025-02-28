import Role from '../role/role.entity';

export interface Data {
  role: Role;
}

export interface JsonResponse {
  error: boolean;
  message: string;
  status_code: number;
  data: any;
}
