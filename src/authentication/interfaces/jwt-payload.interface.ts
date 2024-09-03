// import { Donor } from '../../donor/donor.entity';
import User from '../../user/user.entity';
export interface JwtPayload {
  email: string;
  userId: string;
}

export interface Permission {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface Data {
  user: User;
  roles: string[];
  permissions: string[];
}

export interface JsonResponse {
  error: boolean;
  message: string;
  statusCode: number;
  data: Data;
}