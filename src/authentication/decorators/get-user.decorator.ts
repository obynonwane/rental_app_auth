import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import User from '../../user/user.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
