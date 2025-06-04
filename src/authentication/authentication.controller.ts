import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticationService } from './authentication.service';
import CreateUserDto from '../_dtos/create-user.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { JwtExceptionFilter } from './filters/jwt-exception.filter';

import LoginUserDto from '../_dtos/login-user.dto';

import * as path from 'path';

import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

import RenterKycDto from 'src/_dtos/renter-kyc.dto';
import { IsParticiapntGuard } from './guards/is-renter.guard';
import { BusinessKycDto } from '../_dtos/business-kyc.dto';
import { IsProductOwnerGuard } from './guards/is-product-owner.guard';
import { ResetPasswordEmailDto } from '../_dtos/reset-password-email.dto';
import { ChangePasswordDto } from '../_dtos/change-password.dto';
import { RequestPasswordVerificationEmailDto } from '../_dtos/request-password-verification-email.dto';

//
@Controller('authentication')
@Injectable()
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) { }

  @Post('/signup')
  async createUser(@Body() userData: CreateUserDto, @Res() response: Response) {
    const user = await this.authenticationService.createUser(userData);
    return response.status(HttpStatus.ACCEPTED).json(user);
  }

  @Post('/admin/signup')
  async signupAdmin(
    @Body() userData: CreateUserDto,
    @Res() response: Response,
  ) {
    const user = await this.authenticationService.signupAdmin(userData);
    return response.status(HttpStatus.ACCEPTED).json(user);
  }

  @Post('request-verification-email')
  async requestVerificationEmail(
    @Body() userData: RequestPasswordVerificationEmailDto,
    @Res() response: Response,
  ) {
    const user = await this.authenticationService.requestVerificationEmail(userData);
    return response.status(HttpStatus.ACCEPTED).json(user);
  }

  @HttpCode(200)
  @Post('login')
  async logIn(@Body() userData: LoginUserDto, @Res() response: Response) {
    const token = await this.authenticationService.getJwtToken(
      userData,
    );



    return response.status(token.status_code).json(token);
  }

  @UseGuards(JwtAuthenticationGuard)
  @UseFilters(JwtExceptionFilter)
  @Get('get-me')
  async getUserDetail(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const user = request.user;
    return response.status(HttpStatus.ACCEPTED).json(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @UseFilters(JwtExceptionFilter)
  @Get('verify-token')
  async authenticate(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const user = request.user;
    return response.status(HttpStatus.ACCEPTED).json(user);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Post('participant-create-staff')
  async participantCreateStaff(
    @Body() userData: CreateUserDto,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const { user } = request;
    const result = await this.authenticationService.participantCreateStaff(
      userData,
      user,
    );
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    return response.status(HttpStatus.ACCEPTED).json({
      status: true,
      status_code: 200,
      message: 'logged out successfully',
    });
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const data = await this.authenticationService.verifyEmail(token);
    const status =
      data.error == true ? HttpStatus.BAD_REQUEST : HttpStatus.ACCEPTED;
    return response.status(status).json({
      error: data.error,
      status_code: data.status_code,
      message: data.message,
      data: data,
    });
  }

  @HttpCode(200)
  @Get('countries')
  async getCountries(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.authenticationService.getCountries();
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @HttpCode(200)
  @Get('states')
  async getStates(@Req() request: RequestWithUser, @Res() response: Response) {
    const result = await this.authenticationService.getStates();
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @HttpCode(200)
  @Get('lgas')
  async getLgas(@Req() request: RequestWithUser, @Res() response: Response) {
    const result = await this.authenticationService.getLgas();
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @HttpCode(200)
  @Get('country/state/:id')
  async getCountryState(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.authenticationService.getCountryState(id);
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @HttpCode(200)
  @Get('state/lgas/:id')
  async getStateLgas(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const result = await this.authenticationService.getStateLgas(id);
    return response.status(HttpStatus.ACCEPTED).json(result);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard, IsParticiapntGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('kyc-renter')
  async kycRenter(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const userId = request.user['data']['user']['id'];
    const kycs = request.user['data']['kyc_detail'];


    if (kycs['business_kyc'] !== null && kycs['business_kyc'] !== undefined) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        status_code: HttpStatus.BAD_REQUEST,
        message: 'error: business kyc already done - individual kyc cannot be done ',
      });
    }

    // Access additional form fields
    const address = body.address;
    const idNumber = body.id_number;
    const idType = body.id_type;
    const addressCountry = body.address_country;
    const addressState = body.address_state;
    const addressLga = body.address_lga;

    // Define the target directory relative to the project root
    // Use process.cwd() to get the project root directory
    const targetDirectory = path.join(process.cwd(), '/', 'uploads');

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

    const details: RenterKycDto = {
      address,
      idNumber,
      idType,
      addressCountry,
      addressState,
      addressLga,
      uniqueFileName,
      targetPath,
      userId,
    };

    // check if the user already have individual kyc
    await this.authenticationService.kycRenter(details);

    // Process the file and data as needed
    return response.status(HttpStatus.ACCEPTED).json({
      error: false,
      status_code: 200,
      message: 'File and data received and processed',
      data: {
        data: targetPath,
      },
    });
  }

  @HttpCode(201)
  @UseGuards(JwtAuthenticationGuard, IsProductOwnerGuard)
  @Post('kyc-business')
  async kycBusiness(
    @Body() userData: BusinessKycDto,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const userId = request.user['data']['user']['id'];

    const kycs = request.user['data']['kyc_detail'];


    if (kycs['renter_kyc'] !== null && kycs['renter_kyc'] !== undefined) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        status_code: HttpStatus.BAD_REQUEST,
        message: 'error: individual kyc already done - business kyc cannot be done ',
      });
    }

    if (kycs['business_kyc'] !== null && kycs['business_kyc'] !== undefined) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        status_code: HttpStatus.BAD_REQUEST,
        message: 'error: kyc already done ',
      });
    }


    const user = await this.authenticationService.kycBusiness(userData, userId);
    return response.status(user.status_code).json(user);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Get('retrieve-identification-types')
  async retriveIdentificationTypes(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result =
      await this.authenticationService.retriveIdentificationTypes();
    return response.status(HttpStatus.ACCEPTED).json({
      error: false,
      status_code: 200,
      message: 'Identification types retrived sucessfully',
      data: {
        data: result,
      },
    });
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Get('list-user-type')
  async listUserTypes(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.authenticationService.retriveUserTypes();
    return response.status(HttpStatus.ACCEPTED).json({
      error: false,
      status_code: 200,
      message: 'user types retrieved sucessfully',
      data: {
        data: result,
      },
    });
  }


  @Post('reset-password-email')
  async sendResetPasswordEmail(
    @Body() userData: ResetPasswordEmailDto,
    @Res() response: Response,
  ) {

    const result = await this.authenticationService.sendResetPasswordEmail(
      userData,
    );

    const res = response.status(result.status_code).json({
      error: result.error,
      status_code: result.status_code,
      message: result.message,
      data: result.data
    });



    return res
  }

  @Post('change-password')
  async changePassword(
    @Body() userData: ChangePasswordDto,
    @Res() response: Response,
  ) {

    const result = await this.authenticationService.changePassword(
      userData,
    );
    return response.status(result.status_code).json({
      error: result.error,
      status_code: result.status_code,
      message: result.message,
      data: result.data
    });
  }
}
