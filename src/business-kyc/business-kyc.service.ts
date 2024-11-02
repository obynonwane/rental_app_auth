import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BusinessKyc } from './business-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BusinessKycService {
    constructor(@InjectRepository(BusinessKyc)
    private businessKycRepository: Repository<BusinessKyc>,) { }
}
