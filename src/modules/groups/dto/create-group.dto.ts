import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(3)
  name: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;

  @IsArray()
  memberIds: string[];
}
