import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  replyTo: string;

  @IsOptional()
  @IsBoolean()
  isGroupMessage: boolean;
}
