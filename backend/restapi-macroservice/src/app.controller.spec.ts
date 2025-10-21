import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GoogleService } from "./app/services/google-service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: GoogleService, useValue: {} }],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe("Hello World!");
  });
});
