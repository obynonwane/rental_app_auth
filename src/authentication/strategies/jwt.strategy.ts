import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import User from '../../user/user.entity';
import { JsonResponse, JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { BusinessKyc } from '../../business-kyc/business-kyc.entity';
import { RenterKyc } from '../../renter-kyc/renter-kyc.entity';
import { KycType } from 'src/_enums/kyc-types.enum';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(BusinessKyc) private businessKycRepository: Repository<BusinessKyc>,
    @InjectRepository(RenterKyc) private renterKycRepository: Repository<RenterKyc>,

  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }


  async validate(payload: JwtPayload): Promise<JsonResponse> {
    const { userId } = payload;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'], // Load roles
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Extract roles
    const roles: string[] = user.roles.map(role => role.name);

    let business_kyc: BusinessKyc
    let renter_kyc: RenterKyc


    if (roles && Array.isArray(roles) && roles.includes(KycType.BUSINESS)) {
      business_kyc = await this.businessKycRepository.findOne({ where: { user: { id: user.id } } })
    }


    if (roles && Array.isArray(roles) && roles.includes(KycType.RENTER)) {
      renter_kyc = await this.renterKycRepository.findOne({ where: { user: { id: user.id } } })
    }

    user.roles = undefined;
    user.password = undefined;

    // Construct the response
    const response: JsonResponse = {
      error: false,
      message: 'User details retrieved successfully',
      statusCode: HttpStatus.OK,
      data: {
        user,         // Include the original user object
        roles,        // Include the extracted roles array
        kyc_detail: {
          renter_kyc,
          business_kyc
        }
      }
    };


    // Return the new response
    return response;

  }
}
