import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}
