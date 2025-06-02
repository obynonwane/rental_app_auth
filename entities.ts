import Role from "./src/role/role.entity";
import EmailVerificationToken from "./src/email-verification-token/email-verification-token.entity";
import User from "./src/user/user.entity"
import { RenterKyc } from './src/renter-kyc/renter-kyc.entity';
import IdentityType from "./src/identity-types/identity-types.entity";
import ResetPasswordToken from "./src/reset-password-token/reset-password-token.entity";



export const entities = [
    User,
    EmailVerificationToken,
    Role,
    RenterKyc,
    IdentityType,
    ResetPasswordToken,

]; 