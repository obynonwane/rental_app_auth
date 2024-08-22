import { Module } from '@nestjs/common';
import { Utility } from './utility';

@Module({
    providers: [Utility]
})
export class UtilitiesModule { }
