import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() user: LoginDTO, @Res({ passthrough: true }) res: Response) {
    console.log('this is run');
    
    return this.authService.login(user.username, user.password, res);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request) {
    try {
      // req.res.setHeader('Authorization', null);
      // await this.authService.logout(req.user['userId']);
      return 'You have successfully logged out';
    } catch (error) {
      throw new ForbiddenException('Login Failed');
    }
  }
}
