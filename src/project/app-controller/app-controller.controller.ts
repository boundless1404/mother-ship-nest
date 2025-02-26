import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../project.service';
import {
  AppUserSignInDto,
  AppUserSignUpDto,
  ResendTokenDto,
  UpdateAppUserDataDto,
} from './dto/dto';
import { IsAuthenticated } from 'src/shared/isAuthenticated.guard';
import { GetAuthPayload } from 'src/shared/getAuthenticatedUserPayload.decorator';
import { AuthenticatedApiData } from 'src/lib/types';
import { TokenCreationPurpose } from 'src/lib/enums';
@Controller('app')
export class AppControllerController {
  constructor(private projectService: ProjectService) {
    //
  }
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Post('/user/:publicId/sign-up')
  async appUserSignUp(
    @Body() signUpDto: AppUserSignUpDto,
    @Param('publicId') publicId: string,
  ) {
    const apiData = { publicId };
    await this.projectService.signUserUpInApp(apiData, signUpDto);
    return '';
  }

  @Post('/user/:publicId/sign-in')
  // @UseGuards(IsAuthenticated)
  async appUserSignIn(
    @Body() signInDto: AppUserSignInDto,
    //
    @Param() apiData: { publicId: string },
  ) {
    const authResponse = await this.projectService.signUserInApp(
      apiData,
      signInDto,
    );
    return { authResponse };
  }

  @Put('/user')
  @UseGuards(IsAuthenticated)
  async updateAppUserData(
    @Body() updateAppUser: UpdateAppUserDataDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    await this.projectService.updateAppUserData({
      updateAppUserData: updateAppUser,
      apiData,
    });
  }

  @Get('/verify')
  async verifyToken(
    @Query()
    query: {
      appUserId: string;
      token: string;
    },
  ) {
    const { appUserId, token } = query;
    const authResponse = await this.projectService.verifyToken({
      appUserId,
      token,
    });
    return authResponse;
  }

  @Post('/:publicId/resend-token')
  async resendVerificationToken(
    @Body() resendTokenDto: ResendTokenDto,
    @Param() apiData: AuthenticatedApiData,
  ) {
    await this.projectService.resendToken(resendTokenDto, apiData);
  }

  @Post('/:publicId/complete-verification')
  // @UseGuards(new IsAuthenticated({ isApiAccess: true })
  async completeVerification(
    @Body()
    query: { email: string; token: string; tokenPurpose: TokenCreationPurpose },
    @Param() apiData: { publicId: string },
  ) {
    const { email, token, tokenPurpose } = query;
    const authResponse = await this.projectService.completeAppUserVerification({
      publicId: apiData.publicId,
      email,
      token,
      tokenPurpose,
    });
    return authResponse;
  }
}
