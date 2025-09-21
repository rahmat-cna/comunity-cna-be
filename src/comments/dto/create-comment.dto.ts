import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsNumber()
  postId?: number;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}