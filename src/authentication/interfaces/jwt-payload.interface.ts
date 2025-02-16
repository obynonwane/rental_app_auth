// import { Donor } from '../../donor/donor.entity';
import { RenterKyc } from 'src/renter-kyc/renter-kyc.entity';
import User from '../../user/user.entity';
import { BusinessKyc } from 'src/business-kyc/business-kyc.entity';
export interface JwtPayload {
  email: string;
  userId: string;
}


export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Data {
  user: User;
  roles: string[];
  kyc_detail: {
    renter_kyc: RenterKyc;
    business_kyc: BusinessKyc;
  }
}

export interface JsonResponse {
  error: boolean;
  message: string;
  statusCode: number;
  data: Data;
}