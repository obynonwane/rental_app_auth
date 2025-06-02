import { Module } from '@nestjs/common';
import { BusinessKycController } from './business-kyc.controller';
import { BusinessKycService } from './business-kyc.service';
import { BusinessKyc } from './business-kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';
import User from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    BusinessKyc,
    Country,
    State,
    Lga,
    User
  ])],
  controllers: [BusinessKycController],
  providers: [BusinessKycService]
})
export class BusinessKycModule { }
