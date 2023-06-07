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
