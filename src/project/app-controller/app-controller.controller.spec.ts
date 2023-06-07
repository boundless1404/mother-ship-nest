import { Test, TestingModule } from '@nestjs/testing';
import { AppControllerController } from './app-controller.controller';

describe('AppControllerController', () => {
  let controller: AppControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppControllerController],
    }).compile();

    controller = module.get<AppControllerController>(AppControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
