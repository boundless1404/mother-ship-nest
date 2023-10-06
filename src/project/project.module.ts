import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AppControllerController } from './app-controller/app-controller.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [ProjectService],
  controllers: [ProjectController, AppControllerController],
})
export class ProjectModule {}
