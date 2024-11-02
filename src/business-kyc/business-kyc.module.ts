import { Module } from '@nestjs/common';
import { BusinessKycController } from './business-kyc.controller';
import { BusinessKycService } from './business-kyc.service';
import { BusinessKyc } from './business-kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([
    BusinessKyc,
  ])],
  controllers: [BusinessKycController],
  providers: [BusinessKycService]
})
export class BusinessKycModule { }
