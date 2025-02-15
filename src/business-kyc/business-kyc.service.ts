import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { BusinessKyc } from './business-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import BusinessKycDto from '../_dtos/business-kyc.dto';
import { BusinessRegisteredEnum } from './enums/business-registered.enum';
import { ResponseDTO } from '../_dtos/response.dto';
import { ErrorResponseDTO } from '../_dtos/error-response.dto';
import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from 'src/lga/lga.entity';

@Injectable()
export class BusinessKycService {
    constructor(
        @InjectRepository(BusinessKyc)
        private businessKycRepository: Repository<BusinessKyc>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>,
        @InjectRepository(State)
        private stateRepository: Repository<State>,
        @InjectRepository(Lga)
        private lgaRepository: Repository<Lga>,
    ) { }



    public async createKyc(detail: BusinessKycDto, userId: string): Promise<ResponseDTO<BusinessKyc> | { error: boolean, statusCode: number, message: string, data: any }> {
        try {

            // check  country 
            const country = await this.countryRepository.findOne({ where: { id: detail.address_country } })
            if (!country) {
                return {
                    error: true,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'country selected do not exist',
                    data: {}
                };

            }

            // check  state 
            const state = await this.stateRepository.findOne({ where: { id: detail.address_state, country: { id: country.id } } })
            if (!state) {
                return {
                    error: true,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'state selected do not belong to the country',
                    data: {},
                };

            }

            // check  lga
            const lga = await this.lgaRepository.findOne({ where: { id: detail.address_lga, state: { id: state.id } } })
            if (!lga) {
                return {
                    error: true,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'city (lga) selected do not belong to the state',
                    data: {},
                };

            }



            const entityManager = this.businessKycRepository.manager;

            return await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
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

                await transactionalEntityManager.save(BusinessKyc, kyc);

                // Update the user type
                await transactionalEntityManager.query(
                    `UPDATE users 
                     SET user_types = array_append(user_types, $1), 
                         kycs = array_append(kycs, $2) 
                     WHERE id = $3`,
                    ["business", "business", userId]
                );

                // Retrieve the full KYC record with related entities
                const theKyc = await transactionalEntityManager.findOne(BusinessKyc, {
                    where: { id: kyc.id },
                    relations: ['country', 'state', 'lga', 'user'],
                });

                return {
                    error: false,
                    statusCode: 200,
                    message: 'KYC created successfully',
                    data: this.formatKycResponse(theKyc),
                };
            });
        } catch (error) {

            console.log(error)
            const errorResponse: ErrorResponseDTO = {
                error: true,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating KYC',
                data: {},
            };

            throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private formatKycResponse(kyc: BusinessKyc) {
        // Format the response object to include full details of related entities
        return {
            id: kyc.id,
            address: kyc.address,
            business_registered: kyc.business_registered,
            cac_number: kyc.cac_number,
            display_name: kyc.display_name,
            created_at: kyc.created_at,
            updated_at: kyc.updated_at,
            country: kyc.country, // Include full country details
            state: kyc.state,     // Include full state details
            lga: kyc.lga,         // Include full LGA details
            user: kyc.user,       // Include full user details
            verified: kyc.verified
        };
    }
}

