import { Body, Controller, Get, HttpCode, HttpStatus, Injectable, Param, Post, Query, Req, Res, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticationService } from './authentication.service';
import CreateUserDto from '../_dtos/create-user.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { JwtExceptionFilter } from './filters/jwt-exception.filter';
import CreateUserRoleDto from '../_dtos/create-role.dto';
import LoginUserDto from '../_dtos/login-user.dto';
import AssignUserPermissionDto from '../_dtos/assign-permission.dto';
import * as path from 'path';

import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames
import * as mime from 'mime-types'; // Import mime-types package

//
@Controller('authentication')
@Injectable()
export class AuthenticationController {

    constructor(
        private authenticationService: AuthenticationService
    ) { }

    @Post("/signup")
    async createUser(@Body() userData: CreateUserDto, @Res() response: Response) {
        const user = await this.authenticationService.createUser(userData)
        return response.status(HttpStatus.ACCEPTED).json(user);
    }

    @HttpCode(200)
    @Post('login')
    async logIn(@Body() userData: LoginUserDto, @Res() response: Response) {

        const token: string = await this.authenticationService.getJwtToken(userData);
        return response.status(HttpStatus.ACCEPTED).json(
            {
                error: false,
                statusCode: 200,
                message: 'logged-in successfully',
                data: {
                    access_token: token,
                }
            });
    }


    @UseGuards(JwtAuthenticationGuard)
    @UseFilters(JwtExceptionFilter)
    @Get('get-me')
    async getUserDetail(@Req() request: RequestWithUser, @Res() response: Response) {
        const user = request.user;
        return response.status(HttpStatus.ACCEPTED).json(user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @UseFilters(JwtExceptionFilter)
    @Get('verify-token')
    async authenticate(@Req() request: RequestWithUser, @Res() response: Response) {

        const user = request.user;
        return response.status(HttpStatus.ACCEPTED).json(user);
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Post('choose-role')
    async chooseRole(@Req() request: RequestWithUser, @Body() payload: CreateUserRoleDto, @Res() response: Response) {
        console.log("this is the payload", payload)

        const { user } = request;
        const res = await this.authenticationService.chooseRole(payload, user)

        return response.status(HttpStatus.ACCEPTED).json(
            {
                error: false,
                statusCode: 200,
                message: 'role added successfully',
                data: {
                    data: res,
                }
            });
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('product-owner-permissions')
    async productOwnerPermission(@Req() request: RequestWithUser, @Res() response: Response) {
        const { user } = request;
        const role = await this.authenticationService.productOwnerPermission(user)
        return response.status(HttpStatus.ACCEPTED).json(role);
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Post('assign-permission')
    async productOwnerAssignPermission(@Body() payload: AssignUserPermissionDto, @Req() request: RequestWithUser, @Res() response: Response) {

        const { user } = request;
        const result = await this.authenticationService.productOwnerAssignPermission(user, payload);
        return response.status(HttpStatus.ACCEPTED).json(result);
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Post('product-owner-create-staff')
    async productOwnerCreateStaff(@Body() userData: CreateUserDto, @Req() request: RequestWithUser, @Res() response: Response) {
        const { user } = request;
        const result = await this.authenticationService.productOwnerCreateStaff(userData, user)
        return response.status(HttpStatus.ACCEPTED).json(result);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
        return response.status(HttpStatus.ACCEPTED).json({ status: true, statusCode: 200, message: 'logged out successfully' });
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string, @Req() request: RequestWithUser, @Res() response: Response) {
        console.log("welcome here")
        const data = await this.authenticationService.verifyEmail(token)
        let status = data.error == true ? HttpStatus.ACCEPTED : HttpStatus.BAD_REQUEST
        return response.status(status).json(
            {
                error: data.error,
                statusCode: data.status_code,
                message: data.message,
                data: data
            });
    }


    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('countries')
    async getCountries(@Req() request: RequestWithUser, @Res() response: Response) {
        const result = await this.authenticationService.getCountries();
        return response.status(HttpStatus.ACCEPTED).json(result);
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('states')
    async getStates(@Req() request: RequestWithUser, @Res() response: Response) {
        const result = await this.authenticationService.getStates();
        return response.status(HttpStatus.ACCEPTED).json(result);
    }


    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('lgas')
    async getLgas(@Req() request: RequestWithUser, @Res() response: Response) {
        const result = await this.authenticationService.getLgas();
        return response.status(HttpStatus.ACCEPTED).json(result);
    }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('country/state/:id')
    async getCountryState(@Param('id') id: string, @Req() request: RequestWithUser, @Res() response: Response) {

        const result = await this.authenticationService.getCountryState(id);
        return response.status(HttpStatus.ACCEPTED).json(result);
    }


    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @Get('state/lgas/:id')
    async getStateLgas(@Param('id') id: string, @Req() request: RequestWithUser, @Res() response: Response) {

        const result = await this.authenticationService.getStateLgas(id);
        return response.status(HttpStatus.ACCEPTED).json(result);
    }


    // @HttpCode(200)
    // @UseGuards(JwtAuthenticationGuard)
    // @UseInterceptors(FileInterceptor('file'))
    // @Post('renter-kyc')
    // async kycRenter(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Body() body: any,
    //     @Req() request: RequestWithUser,
    //     @Res() response: Response
    // ) {
    //     // Debug: Log the original filename
    //     console.log('Original filename:', file.originalname);

    //     // Access additional form fields
    //     const address = body.address;
    //     const idNumber = body.id_number;

    //     // Define the target directory where you want to move the file (relative to the src directory)
    //     const targetDirectory = path.join(__dirname, '..', 'uploads'); // This points to src/uploads

    //     // Ensure the uploads directory exists; if not, create it
    //     if (!fs.existsSync(targetDirectory)) {
    //         fs.mkdirSync(targetDirectory, { recursive: true });
    //     }

    //     // Attempt to get the file extension
    //     // let fileExtension = path.extname(file.originalname);
    //     const splitFileName = file.originalname.split('.');
    //     const extension = splitFileName.length - 1;


    //     // Generate a unique file name using UUID and append the determined file extension
    //     // const uniqueFileName = `${uuidv4()}${fileExtension}`;
    //     const uniqueFileName = uuidv4() + '.' + splitFileName[extension];

    //     // Define the full path for the new file
    //     const targetPath = path.join(targetDirectory, uniqueFileName);

    //     // Move the file to the target directory
    //     fs.writeFileSync(targetPath, file.buffer);

    //     // Process the file and data as needed
    //     return response.status(HttpStatus.ACCEPTED).json({
    //         error: false,
    //         statusCode: 200,
    //         message: 'File and data received and processed',
    //         data: {
    //             data: targetPath,
    //         },
    //     });
    // }

    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('renter-kyc')
    async kycRenter(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() request: RequestWithUser,
        @Res() response: Response
    ) {
        // Debug: Log the original filename
        console.log('Original filename:', file.originalname);

        // Access additional form fields
        const address = body.address;
        const idNumber = body.id_number;
        const idType = body.id_type;
        const addressCountry = body.address_country;
        const addressState = body.address_state;
        const addressLga = body.address_lga;



        // Define the target directory relative to the project root
        // Use process.cwd() to get the project root directory
        const targetDirectory = path.join(process.cwd(), 'src', 'uploads');

        // Ensure the uploads directory exists; if not, create it
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory, { recursive: true });
        }

        // Get the file extension
        const fileExtension = path.extname(file.originalname);

        // Generate a unique file name using UUID and append the file extension
        const uniqueFileName = `${uuidv4()}${fileExtension}`;

        // Define the full path for the new file
        const targetPath = path.join(targetDirectory, uniqueFileName);

        // Move the file to the target directory
        fs.writeFileSync(targetPath, file.buffer);


        const details = {
            address,
            idNumber,
            idType,
            addressCountry,
            addressState,
            addressLga,
            uniqueFileName,
        }


        await this.authenticationService.kycRenter(details);

        // Process the file and data as needed
        return response.status(HttpStatus.ACCEPTED).json({
            error: false,
            statusCode: 200,
            message: 'File and data received and processed',
            data: {
                data: targetPath,
            },
        });
    }

}

