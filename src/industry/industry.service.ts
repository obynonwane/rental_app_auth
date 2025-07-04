import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Industry from './industry.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IndustryService {

    constructor(
        @InjectRepository(Industry)
        private industryeRepository: Repository<Industry>,
    ) { }

    public async getAll() {
        return await this.industryeRepository.find()
    }
}
