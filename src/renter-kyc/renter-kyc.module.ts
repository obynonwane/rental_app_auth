import { Module } from '@nestjs/common';
import { RenterKycController } from './renter-kyc.controller';
import { RenterKycService } from './renter-kyc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenterKyc } from './renter-kyc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenterKyc])],
  controllers: [RenterKycController],
  providers: [RenterKycService]
})
export class RenterKycModule { }
