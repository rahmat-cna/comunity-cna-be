import {
  Injectable,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne({ username });

    if (user && bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    username: string,
    password: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.userService.findOneUsernameOrEmail(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user.id };

      const token = this.jwtService.sign(payload);

      // set token di http-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 1 hari
        // secure: process.env.NODE_ENV === 'production',
      });

      // kembalikan user info tanpa password
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException('Invalid Credential');
  }

  async logout(userId: string) {
    const user = await this.userService.findOne(userId);
  }
}
