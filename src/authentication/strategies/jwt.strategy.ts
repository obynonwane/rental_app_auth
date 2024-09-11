import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import User from '../../user/user.entity';
import { JsonResponse, JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import UserPermission from '../../user-permission/user-permission.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserPermission) private userPermissionRepository: Repository<UserPermission>,
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
      relations: ['roles', 'roles.permissions'], // Load roles and permissions
    });

    const userPermissions = await this.userPermissionRepository.find({
      where: { user: { id: user.id } },
      relations: ['permission'],
    })

    // Extract permission names from UserPermission assigned by staff
    const assignedPermissionNames = userPermissions.map(userPermission => userPermission.permission.name);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Extract roles and permissions
    const roles: string[] = user.roles.map(role => role.name);
    const permissions: string[] = user.roles.flatMap(role => role.permissions.map(permission => permission.name));


    // merge role permission and assigned permission
    const allPermissions = [...permissions, ...assignedPermissionNames];

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
        permissions: allPermissions  // Include the extracted permissions array
      }
    };


    // Return the new response
    return response;

    // return user;
  }
}
