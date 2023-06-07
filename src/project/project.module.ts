import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AppControllerController } from './app-controller/app-controller.controller';

@Module({
  providers: [ProjectService],
  controllers: [ProjectController, AppControllerController],
})
export class ProjectModule {}
