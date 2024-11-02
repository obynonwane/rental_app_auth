import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import RenterKycDto from '../_dtos/renter-kyc.dto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { RenterKyc } from '../renter-kyc/renter-kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../user/user.entity';

@Injectable()
export class CloudinaryService {

    constructor(
        @InjectRepository(RenterKyc)
        private renterKycRepository: Repository<RenterKyc>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        // Initialize Cloudinary with your credentials
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
            api_key: process.env.CLOUDINARY_API_KEY,       // Your Cloudinary API key
            api_secret: process.env.CLOUDINARY_API_SECRET,   // Your Cloudinary API secret
        });
    }


    async uploadRenterKyc(detail: RenterKycDto): Promise<UploadApiResponse | UploadApiErrorResponse> {
        try {
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


                        // create the kyc
                        const userExist = await this.renterKycRepository.findOne({ where: { user: { id: detail.userId } } })
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

                            await this.renterKycRepository.save(kyc)
                        }
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
