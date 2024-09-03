import { Module } from '@nestjs/common';
import { ProductOwnerStaffController } from './product-owner-staff.controller';
import { ProductOwnerStaffService } from './product-owner-staff.service';

@Module({
  controllers: [ProductOwnerStaffController],
  providers: [ProductOwnerStaffService]
})
export class ProductOwnerStaffModule {}
