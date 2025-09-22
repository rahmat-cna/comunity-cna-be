import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
  Get,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
// import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //   @UseGuards(PermissionsGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const saltOrRounds = 10;
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    createUserDto.username = createUserDto.email.split('@')[0];
    return this.userService.create(createUserDto);
  }

  @Get(':username')
  async getUserWithCounts(@Param('username') username: string) {
    return this.userService.findOneByUsername(username);
  }
}
