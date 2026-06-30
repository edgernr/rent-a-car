import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) password!: string;
}

export class VendorRegisterDto {
  // owner account
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() name?: string;
  // company
  @IsString() @MinLength(2) legalName!: string;
  @IsString() @MinLength(2) displayName!: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() phone?: string;
}
