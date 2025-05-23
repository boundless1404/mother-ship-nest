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
import { ProjectService } from './project.service';
import { IsAuthenticated } from 'src/shared/isAuthenticated.guard';
import { GetAuthPayload } from 'src/shared/getAuthenticatedUserPayload.decorator';
import {
  AuthPayload,
  AuthenticatedApiData,
  AuthenticatedUserData,
} from 'src/lib/types';
import { CreateAppDto, CreateProjectDto } from './dto/dto';
import {
  AppUserSignInDto,
  AppUserSignUpDto,
  ResendTokenDto,
  UpdateAppUserDataDto,
} from './app-controller/dto/dto';
import { TokenCreationPurpose } from 'src/lib/enums';
// import { Token } from './entities/Token.entity';

// TODO: change projectId to use public id
@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {
    //
  }

  @Post()
  @UseGuards(IsAuthenticated)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetAuthPayload() authPayload: AuthPayload,
  ) {
    const userId = authPayload.userData.id;
    await this.projectService.createProject(createProjectDto, userId);
  }

  @Post('/:projectId/apps/create')
  @UseGuards(new IsAuthenticated())
  async createAppInProject(
    @Param('projectId') projectId: string,
    @Body() createAppDto: CreateAppDto,
    @GetAuthPayload() authPayload: AuthPayload,
  ) {
    //
    const userId = authPayload.userData.id;
    const appAccessToken = await this.projectService.createAppInProject(
      createAppDto,
      userId,
      projectId,
    );

    return {
      apiToken: appAccessToken,
    };
  }

  @Get('/:projectId/apps/access')
  @UseGuards(new IsAuthenticated())
  async grantAppApiAccess(
    @Param('projectId') projectId: string,
    @Query('appId') appId: string,
    @GetAuthPayload('userData') userData: AuthenticatedUserData,
  ) {
    const accessToken = await this.projectService.grantAppAccessToUser(
      userData.id,
      projectId,
      appId,
    );
    return { apiToken: accessToken };
  }

  @Get('/:projectId/apps/public-id')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async getAppPublicId(
    @GetAuthPayload() authPayload: AuthenticatedApiData,
    @Param('projectId') projectId,
  ) {
    //
    return await this.projectService.getAppPublicId(
      authPayload.appId,
      projectId,
    );
  }

  // * sign user up in app
  @Post('/app/signup')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async signUpInApp(
    @Body() signUpDto: AppUserSignUpDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const authResponse = await this.projectService.signUserUpInApp(
      apiData,
      signUpDto,
    );
    return authResponse;
  }

  // * sign user in app
  @Post('/app/signin')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async signInUserInApp(
    @Body() signInDto: AppUserSignInDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const authResponse = await this.projectService.signUserInApp(
      apiData,
      signInDto,
    );
    return authResponse;
  }

  @Put('/app/user')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async updateAppUserData(
    @Body() updateAppUser: UpdateAppUserDataDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    await this.projectService.updateAppUserData({
      updateAppUserData: updateAppUser,
      apiData,
    });
  }

  // * complete verification
  @Get('/app/complete-verification')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async completeVerificationFromLink(
    @Query()
    query: { email: string; token: string; tokenPurpose: TokenCreationPurpose },
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const { email, token, tokenPurpose } = query;
    const authResponse = await this.projectService.completeAppUserVerification({
      appId: apiData.appId,
      email,
      token,
      tokenPurpose,
    });
    return authResponse;
  }

  @Post('/app/complete-verification')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async completeVerification(
    @Body()
    query: { email: string; token: string; tokenPurpose: TokenCreationPurpose },
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const { email, token, tokenPurpose } = query;
    const authResponse = await this.projectService.completeAppUserVerification({
      appId: apiData.appId,
      email,
      token,
      tokenPurpose,
    });
    return authResponse;
  }

  @Post('/app/resend-token')
  async resendVerificationToken(
    @Body() resendTokenDto: ResendTokenDto,
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    await this.projectService.resendToken(resendTokenDto, apiData);
  }
}
