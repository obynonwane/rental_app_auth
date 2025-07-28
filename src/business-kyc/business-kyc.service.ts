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
import Lga from '../lga/lga.entity';
import User from '../user/user.entity';
import { Plan } from '../plan/plan.entity';

@Injectable()
export class BusinessKycService {
    constructor(
        @InjectRepository(BusinessKyc)
        private businessKycRepository: Repository<BusinessKyc>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>,
        @InjectRepository(State)
        private stateRepository: Repository<State>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Lga)
        private lgaRepository: Repository<Lga>,

        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
    ) { }


    public async subdomainExist(subdomain: string) {
        // check  country 
        const subD = await this.businessKycRepository.findOne({ where: { subdomain: subdomain } })
        if (subD) {
            return {
                error: true,
                status_code: HttpStatus.BAD_REQUEST,
                message: 'subdomain already exist',
                data: {}
            };

        }


        return {
            error: false,
            status_code: HttpStatus.ACCEPTED,
            message: 'subdomain available for usage',
            data: {}
        };

    }

    public async createKyc(detail: BusinessKycDto, userId: string): Promise<ResponseDTO<BusinessKyc> | { error: boolean, status_code: number, message: string, data: any }> {
        try {

            // check  country 
            const country = await this.countryRepository.findOne({ where: { id: detail.address_country } })
            if (!country) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'country selected do not exist',
                    data: {}
                };

            }

            // check  state 
            const state = await this.stateRepository.findOne({ where: { id: detail.address_state, country: { id: country.id } } })
            if (!state) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'state selected do not belong to the country',
                    data: {},
                };

            }

            // check  lga
            const lga = await this.lgaRepository.findOne({ where: { id: detail.address_lga, state: { id: state.id } } })
            if (!lga) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'city (lga) selected do not belong to the state',
                    data: {},
                };

            }


            // check  lga
            const plan = await this.planRepository.findOne({ where: { name: "free" } })
            if (!plan) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'plan not found',
                    data: {},
                };

            }

            // check if the org_url exist
            const orgurl = await this.businessKycRepository.findOne({ where: { subdomain: detail.subdomain } })
            if (orgurl) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'business with url exist',
                    data: {},
                };

            }



            const validdomain = this.validateSubdomain(detail.subdomain)
            if (validdomain.valid == false) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: validdomain.message,
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
                    key_bonus: detail.key_bonus,
                    description: detail.description,
                    plan: plan,
                    active_plan: false,
                    subdomain: detail.subdomain.toLowerCase(),
                    industries: detail.industries
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

                // update the first time login
                let theUser = await this.userRepository.findOne({ where: { id: userId } })
                theUser.first_time_login = "no"
                await transactionalEntityManager.save(User, theUser);

                return {
                    error: false,
                    status_code: HttpStatus.ACCEPTED,
                    message: 'KYC created successfully',
                    data: this.formatKycResponse(theKyc),
                };
            });
        } catch (error) {


            const errorResponse: ErrorResponseDTO = {
                error: true,
                status_code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating KYC',
                data: {},
            };

            throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
 * Checks if a subdomain is valid:
 * - Only a-z, 0-9, -
 * - 3 to 63 characters
 * - Not reserved
 */
    public validateSubdomain(subdomain: string): {
        valid: boolean;
        message?: string;
    } {
        const allowedPattern = /^[a-z0-9\-]+$/;

        if (!subdomain) {
            return { valid: false, message: 'Subdomain is required.' };
        }

        if (subdomain.length < 3 || subdomain.length > 20) {
            return { valid: false, message: 'Subdomain must be between 3 and 20 characters.' };
        }

        if (!allowedPattern.test(subdomain)) {
            return { valid: false, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens.' };
        }

        const reserved = ['www', 'api', 'admin', 'mail', 'support', 'lendora', 'dev', 'staging', 'live', 'production', 'product', 'service'];

        if (reserved.includes(subdomain.toLowerCase())) {
            return { valid: false, message: 'This subdomain is reserved and cannot be used.' };
        }

        return { valid: true };
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

