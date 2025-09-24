import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  videos?: string[];

  @IsOptional()
  @IsString()
  gifs?: string;

}