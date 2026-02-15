import { IsNumber, IsOptional, IsString } from 'class-validator';

class TelegramChatDto {
  @IsNumber()
  id!: number;

  @IsString()
  type!: string;
}

class TelegramFromDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsString()
  username?: string;
}

class TelegramMessageDto {
  chat!: TelegramChatDto;
  from!: TelegramFromDto;

  @IsString()
  text!: string;
}

export class TelegramWebhookDto {
  message!: TelegramMessageDto;
}
