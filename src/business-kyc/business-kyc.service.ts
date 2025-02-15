import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { BusinessKyc } from './business-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import BusinessKycDto from '../_dtos/business-kyc.dto';
import { BusinessRegisteredEnum } from './enums/business-registered.enum';
import { ResponseDTO } from '../_dtos/response.dto';
import { ErrorResponseDTO } from '../_dtos/error-response.dto';

@Injectable()
export class BusinessKycService {
    constructor(@InjectRepository(BusinessKyc)
    private businessKycRepository: Repository<BusinessKyc>,) { }


    // public async createKyc(detail: BusinessKycDto, userId: string): Promise<ResponseDTO<BusinessKyc>> {
    //     try {
    //         const entityManager = this.businessKycRepository.manager;

    //         return await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
    //             const kyc = this.businessKycRepository.create({
    //                 business_registered: detail.business_registered as BusinessRegisteredEnum,
    //                 cac_number: detail.cac_number,
    //                 display_name: detail.display_name,
    //                 address: detail.address_street,
    //                 user: { id: userId },
    //                 country: { id: detail.address_country },
    //                 state: { id: detail.address_state },
    //                 lga: { id: detail.address_lga },
    //             });

    //             await transactionalEntityManager.save(BusinessKyc, kyc);



    //             //update the user type
    //             await transactionalEntityManager.query(
    //                 `UPDATE users 
    //                      SET user_types = array_append(user_types, $1), 
    //                          kycs = array_append(kycs, $2) 
    //                      WHERE id = $3`,
    //                 ["business", "business", userId]
    //             );

    //             // Retrieve the full KYC record with related entities
    //             const theKyc = await this.businessKycRepository.findOne({
    //                 where: { id: kyc.id }, // Ensure you look for the saved record
    //                 relations: ['country', 'state', 'lga', 'user'], // Specify the relations to load
    //             });


    //             const response: ResponseDTO<BusinessKyc> = {
    //                 error: false,
    //                 statusCode: 200,
    //                 message: 'kyc created succesfully',
    //                 data: this.formatKycResponse(theKyc),
    //             };

    //             return response
    //         })

    //     } catch (error) {
    //         const errorResponse: ErrorResponseDTO = {
    //             error: true,
    //             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //             message: 'Error creating KYC',
    //             data: {},
    //         };

    //         throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
    public async createKyc(detail: BusinessKycDto, userId: string): Promise<ResponseDTO<BusinessKyc>> {
        try {
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

