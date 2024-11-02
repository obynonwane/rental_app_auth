import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { RenterKyc } from '../renter-kyc/renter-kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenterKyc, User])],
  controllers: [CloudinaryController],
  providers: [CloudinaryService]
})
export class CloudinaryModule { }
