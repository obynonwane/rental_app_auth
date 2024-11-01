import { Module } from '@nestjs/common';
import { IdentityTypesController } from './identity-types.controller';
import { IdentityTypesService } from './identity-types.service';
import IdentityType from './identity-types.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IdentityType])],
  controllers: [IdentityTypesController],
  providers: [IdentityTypesService]
})
export class IdentityTypesModule {}
