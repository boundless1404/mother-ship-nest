import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AppUserSignUpDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  phoneCode: string;

  // TODO: replace with a custom password validator
  @IsNotEmpty()
  // @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsBoolean()
  initiateVerificationRequest: boolean;
}

export class AppUserSignInDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
