import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import RenterKycDto from '../_dtos/renter-kyc.dto';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {

    constructor() {
        // Initialize Cloudinary with your credentials
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
            api_key: process.env.CLOUDINARY_API_KEY,       // Your Cloudinary API key
            api_secret: process.env.CLOUDINARY_API_SECRET,   // Your Cloudinary API secret
        });
    }


    async uploadRenterKyc(filePath: RenterKycDto): Promise<UploadApiResponse | UploadApiErrorResponse> {
        try {
            return new Promise((resolve, reject) => {
                const storagePath = filePath.targetPath // Ensure the correct path


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

                        console.log('Cloudinary upload result:', result); // Log the result here

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
