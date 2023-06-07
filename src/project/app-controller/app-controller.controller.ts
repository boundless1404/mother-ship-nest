import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '../project.service';
import { AppUserSignInDto, AppUserSignUpDto } from './dto/dto';
import { IsAuthenticated } from 'src/shared/isAuthenticated.guard';
import { GetAuthPayload } from 'src/shared/getAuthenticatedUserPayload.decorator';
import { AuthenticatedApiData } from 'src/lib/types';

@Controller('app')
export class AppControllerController {
  constructor(private projectService: ProjectService) {
    //
  }

  @Post('/user/sign-up')
  @UseGuards(IsAuthenticated)
  async appUserSignUp(
    @Body() signUpDto: AppUserSignUpDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    await this.projectService.signUserUpInApp(apiData, signUpDto);
    return '';
  }

  @Post('/user/sign-in')
  @UseGuards(IsAuthenticated)
  async appUserSignIn(
    @Body() signInDto: AppUserSignInDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const token = await this.projectService.signUserInApp(apiData, signInDto);
    return { token };
  }
}
