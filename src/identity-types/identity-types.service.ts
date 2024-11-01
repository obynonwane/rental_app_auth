import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import IdentityType from './identity-types.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IdentityTypesService {
    constructor(
        @InjectRepository(IdentityType)
        private identityTypeRepository: Repository<IdentityType>,

    ) { }


    public async getAll() {
        return await this.identityTypeRepository.find()
    }
}
