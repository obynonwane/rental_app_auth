import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BusinessKyc } from './business-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import BusinessKycDto from '../_dtos/business-kyc.dto';
import { BusinessRegisteredEnum } from './enums/business-registered.enum';
import { ResponseDTO } from '../_dtos/response.dto';

@Injectable()
export class BusinessKycService {
    constructor(@InjectRepository(BusinessKyc)
    private businessKycRepository: Repository<BusinessKyc>,) { }


    public async createKyc(detail: BusinessKycDto, userId: string): Promise<ResponseDTO> {
        try {

            console.log("reached here")

            const kyc = this.businessKycRepository.create({
                business_registered: detail.business_registered as BusinessRegisteredEnum,
                cac_number: detail.cac_number,
                display_name: detail.display_name,
                address: detail.address_street,
                user: { id: userId },
                country: { id: detail.address_country },
                state: { id: detail.address_state },
                lga: { id: detail.address_lga },
            });

            const theKyc = await this.businessKycRepository.save(kyc);


            const response: ResponseDTO<BusinessKyc> = {
                error: false,
                statusCode: 200,
                message: 'kyc created succesfully',
                data: theKyc,
            };

            return response
        } catch (error) {
            throw new HttpException(
                {
                    error: true,
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'error creating kyc',
                    data: {},
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
