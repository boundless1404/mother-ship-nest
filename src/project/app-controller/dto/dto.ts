import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Validate,
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
  //@IsNotEmpty()
  // @IsStrongPassword()
  //@IsOptional()
  @IsNotEmpty()
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

export class UpdateAppUserDataDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  phoneCode: string;

  @IsOptional()
  @IsNumberString()
  phoneCodeId: string;
}

export class ResendTokenDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Validate((value, args) => {
    const [expectedValue] = args.constraints;
    return !!expectedValue;
  })
  phoneCode: string;

  @IsOptional()
  @IsString()
  phone: string;
}
