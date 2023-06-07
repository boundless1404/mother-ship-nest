import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { IsAuthenticated } from 'src/shared/isAuthenticated.guard';
import { GetAuthPayload } from 'src/shared/getAuthenticatedUserPayload.decorator';
import { AuthPayload } from 'src/lib/types';
import { CreateAppDto, CreateProjectDto } from './dto/dto';
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

  @Post('/:projectId/create-app')
  @UseGuards(new IsAuthenticated())
  async createAppInProject(
    @Param('projectId') projectId: string,
    @Body() createAppDto: CreateAppDto,
    @GetAuthPayload() authPayload: AuthPayload,
  ) {
    //
    const userId = authPayload.userData.id;
    const appAccesToken = await this.projectService.createAppInProject(
      createAppDto,
      userId,
      projectId,
    );

    return {
      appAccesToken,
    };
  }
}
