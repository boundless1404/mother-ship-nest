import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { AppUserSignInDto, AppUserSignUpDto } from './app-controller/dto/dto';
import { TokenCreationPurpose } from 'src/lib/enums';
// import { Token } from './entities/Token.entity';

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

  // * complete verification
  @Get('/complete-verification')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async completeVerification(
    @Query()
    query: { email: string; token: string; tokenPurpose: TokenCreationPurpose },
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
  ) {
    const { email, token, tokenPurpose } = query;
    const authResponse = await this.projectService.completeAppUserVerification(
      apiData,
      email,
      token,
      tokenPurpose,
    );
    return authResponse;
  }
}
