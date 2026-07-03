import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty() @MaxLength(64) username!: string;
  @IsString() @IsNotEmpty() @MaxLength(128) password!: string;
}

export class ChangePasswordDto {
  @IsString() @IsNotEmpty() currentPassword!: string;
  @IsString() @MinLength(10) @MaxLength(128) newPassword!: string;
}

export class CreateAdminDto {
  @IsString() @IsNotEmpty() @MaxLength(64) username!: string;
  @IsString() @MinLength(10) @MaxLength(128) password!: string;
  @IsString() @IsNotEmpty() @MaxLength(100) displayName!: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string | null;
}

export class UpdateAdminDto {
  @IsString() @IsNotEmpty() @MaxLength(100) displayName!: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string | null;
  @IsEnum(['active', 'disabled']) status!: 'active' | 'disabled';
}
