import { Body, Controller, Get, HttpCode, HttpStatus, Injectable, Post, Query, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import CreateUserDto from '../_dtos/create-user.dto';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import RequestWithUser from './request-with-user.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { JwtExceptionFilter } from './jwt-exception.filter';
import CreateUserRoleDto from '../_dtos/create-role.dto';
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
    @UseGuards(LocalAuthenticationGuard)
    @Post('login')
    async logIn(@Req() request: RequestWithUser, @Res() response: Response) {


        const { user } = request;
        const token: string = this.authenticationService.getCookieWithJwtToken(user.id);

        return response.status(HttpStatus.ACCEPTED).json(
            {
                error: false,
                status_code: 200,
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
        user.password = undefined;
        return response.status(HttpStatus.ACCEPTED).json(
            {
                error: false,
                status_code: 200,
                message: 'user details retrieved succesfully',
                data: {
                    user: user
                }
            });
    }

    @UseGuards(JwtAuthenticationGuard)
    @UseFilters(JwtExceptionFilter)
    @Get('verify-token')
    async authenticate(@Req() request: RequestWithUser, @Res() response: Response) {

        const user = request.user;
        user.password = undefined;
        return response.status(HttpStatus.ACCEPTED).json(
            {
                error: false,
                status_code: 200,
                message: 'token verified succesfully',
                data: {
                    user: user
                }
            });
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
                status_code: 200,
                message: 'role added successfully',
                data: {
                    data: res,
                }
            });
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
                status_code: data.status_code,
                message: data.message,
                data: data
            });
    }



}

