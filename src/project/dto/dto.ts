import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  requireIdentityValidation: boolean;
}

export class CreateProjectDto {
  name: string;
}

export class SignUpInApp {
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
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  initiateVerificationRequest: boolean;
}
