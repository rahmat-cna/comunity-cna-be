import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}
