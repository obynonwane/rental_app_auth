import { Module } from '@nestjs/common';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import Industry from './industry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustryController],
  providers: [IndustryService]
})
export class IndustryModule { }
