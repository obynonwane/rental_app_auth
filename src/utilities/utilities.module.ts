import { Module } from '@nestjs/common';
import { Utility } from './utility';
import User from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([
        User,
    ])],
    providers: [Utility]
})
export class UtilitiesModule { }
