import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';
import { AccountTypeService } from './account-type.service';

@Module({
  controllers: [AccountTypeController],
  providers: [AccountTypeService]
})
export class AccountTypeModule {}
