import { Body, Controller, Post } from '@nestjs/common';
import { AdminUserSignUpDto } from './dtos/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    //
  }

  /**
   * End point for admin user
   * @param userDto
   * @returns
   */
  @Post('/users')
  async adminUserSignUp(@Body() userDto: AdminUserSignUpDto) {
    //
    const token = await this.authService.createAndSignUserPayload(userDto);

    return token;
  }
}
