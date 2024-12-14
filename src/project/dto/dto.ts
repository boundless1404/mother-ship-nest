import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Credit_Source_Type, Wallet_Transaction_Type } from 'src/lib/enums';

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

export class CreateWalletDto {
  @IsNotEmpty()
  @IsNumberString()
  user_id: string;

  @IsOptional()
  @IsString()
  country_fullname: string;
}

export class TransactWalletDto {
  @IsNotEmpty()
  @IsString()
  public_id: string;

  @IsNotEmpty()
  @IsNumberString()
  user_id: string;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  credit_source_data?: string;

  @IsNotEmpty()
  @IsEnum(Credit_Source_Type)
  credit_source_type: Credit_Source_Type;

  @IsNotEmpty()
  @IsEnum(Wallet_Transaction_Type)
  type: Wallet_Transaction_Type;
}
