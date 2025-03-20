// response.dto.ts
import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class ResponseDto<T> {
  @IsNumber()
  statusCode: number;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: T; 

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
