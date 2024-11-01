import { Module } from '@nestjs/common';
import { RenterKycController } from './renter-kyc.controller';
import { RenterKycService } from './renter-kyc.service';

@Module({
  controllers: [RenterKycController],
  providers: [RenterKycService]
})
export class RenterKycModule {}
