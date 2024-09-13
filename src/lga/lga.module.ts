import { Module } from '@nestjs/common';
import { LgaController } from './lga.controller';
import { LgaService } from './lga.service';

@Module({
  controllers: [LgaController],
  providers: [LgaService]
})
export class LgaModule {}
