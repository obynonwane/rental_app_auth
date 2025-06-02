import { HttpStatus, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import RenterKycDto from '../_dtos/renter-kyc.dto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EntityManager, Repository } from 'typeorm';
import { RenterKyc } from '../renter-kyc/renter-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../user/user.entity';
import Country from '../country/country.entity';
import State from '../state/state.entity';
import Lga from '../lga/lga.entity';

@Injectable()
export class CloudinaryService {

    constructor(
        @InjectRepository(RenterKyc)
        private renterKycRepository: Repository<RenterKyc>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Country)
        private countryRepository: Repository<Country>,

        @InjectRepository(State)
        private stateRepository: Repository<State>,

        @InjectRepository(Lga)
        private lgaRepository: Repository<Lga>,
    ) {
        // Initialize Cloudinary with your credentials
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
            api_key: process.env.CLOUDINARY_API_KEY,       // Your Cloudinary API key
            api_secret: process.env.CLOUDINARY_API_SECRET,   // Your Cloudinary API secret
        });
    }


    async uploadRenterKyc(detail: RenterKycDto): Promise<UploadApiResponse | UploadApiErrorResponse | { error: boolean, status_code: number, message: string, data: any }> {
        try {


            // check  country 
            const country = await this.countryRepository.findOne({ where: { id: detail.addressCountry } })
            if (!country) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'country selected do not exist',
                    data: {}
                };

            }

            // check  state 
            const state = await this.stateRepository.findOne({ where: { id: detail.addressState, country: { id: country.id } } })
            if (!state) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'state selected do not belong to the country',
                    data: {},
                };

            }

            // check  lga
            const lga = await this.lgaRepository.findOne({ where: { id: detail.addressLga, state: { id: state.id } } })
            if (!lga) {
                return {
                    error: true,
                    status_code: HttpStatus.BAD_REQUEST,
                    message: 'city (lga) selected do not belong to the state',
                    data: {},
                };

            }


            return new Promise((resolve, reject) => {
                const storagePath = detail.targetPath // Ensure the correct path


                // Determine resource_type based on file extension
                const ext = path.extname(storagePath).toLowerCase();
                let resourceType: 'image' | 'raw' = 'raw'; // Default to raw

                if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
                    resourceType = 'image'; // Set resource type for images
                } else if (['.pdf'].includes(ext)) {
                    resourceType = 'raw'; // Set resource type for PDF
                }

                cloudinary.uploader.upload(
                    storagePath,
                    { folder: 'rentalsolution/renterkyc', access_mode: 'public', resource_type: resourceType },
                    async (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            return reject(error);
                        }


                        const entityManager = this.renterKycRepository.manager;

                        await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {

                            // create the kyc
                            const userExist = await transactionalEntityManager.findOne(RenterKyc, {
                                where: { user: { id: detail.userId } },
                            });
                            if (!userExist) {
                                const kyc = this.renterKycRepository.create({
                                    address: detail.address,
                                    uploaded_image: result.secure_url,
                                    identity_number: detail.idNumber,
                                    identityType: { id: detail.idType },
                                    user: { id: detail.userId },
                                    country: { id: detail.addressCountry },
                                    state: { id: detail.addressState },
                                    lga: { id: detail.addressLga },
                                });

                                // save the kyc details
                                await transactionalEntityManager.save(RenterKyc, kyc);

                                //update the user type
                                await transactionalEntityManager.query(
                                    `UPDATE users 
                                     SET user_types = array_append(user_types, $1), 
                                         kycs = array_append(kycs, $2) 
                                     WHERE id = $3`,
                                    ["renter", "renter", detail.userId]
                                );


                                // update the first time login
                                let theUser = await this.userRepository.findOne({ where: { id: detail.userId } })
                                theUser.first_time_login = "no"
                                await transactionalEntityManager.save(User, theUser);
                            }

                        })

                        // Attempt to delete the file after successful upload
                        try {
                            await fs.unlink(storagePath); // Delete the local file
                            console.log(`Deleted local file: ${storagePath}`);
                        } catch (deleteError) {
                            console.error(`Error deleting local file: ${deleteError}`);
                        }

                        resolve(result); // Resolve with the Cloudinary result
                    },
                );
            });
        } catch (error) {
            console.error('Error in uploadRenterKyc:', error);
            throw error; // Rethrow to handle this in the calling function
        }
    }
}
