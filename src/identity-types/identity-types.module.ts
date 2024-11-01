import { Module } from '@nestjs/common';
import { IdentityTypesController } from './identity-types.controller';
import { IdentityTypesService } from './identity-types.service';

@Module({
  controllers: [IdentityTypesController],
  providers: [IdentityTypesService]
})
export class IdentityTypesModule {}
