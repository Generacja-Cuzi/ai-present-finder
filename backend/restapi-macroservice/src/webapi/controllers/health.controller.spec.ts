import { RabbitMQHealthIndicator } from "src/app/health/rabbitmq.health";
import { HealthController } from "src/webapi/controllers/health.controller";

import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import type { HealthCheckResult } from "@nestjs/terminus";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

describe("HealthController", () => {
  let controller: HealthController;
  let mockCheckFunction: jest.Mock;

  beforeEach(async () => {
    const mockHealthCheckResult: HealthCheckResult = {
      status: "ok",
      info: {},
      error: {},
      details: {},
    };

    mockCheckFunction = jest.fn().mockResolvedValue(mockHealthCheckResult);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: mockCheckFunction,
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest
              .fn()
              .mockResolvedValue({ database: { status: "up" } }),
          },
        },
        {
          provide: RabbitMQHealthIndicator,
          useValue: {
            isHealthy: jest
              .fn()
              .mockResolvedValue({ rabbitmq: { status: "up" } }),
          },
        },
        {
          provide: "STALKING_ANALYZE_REQUESTED_EVENT",
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: "CHAT_START_INTERVIEW_EVENT",
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("check", () => {
    it("should return health check result", async () => {
      const result = await controller.check();
      expect(result.status).toBe("ok");
      expect(mockCheckFunction).toHaveBeenCalled();
    });
  });

  describe("readiness", () => {
    it("should return readiness check result", async () => {
      const result = await controller.readiness();
      expect(result.status).toBe("ok");
      expect(mockCheckFunction).toHaveBeenCalled();
    });
  });

  describe("liveness", () => {
    it("should return ok status", () => {
      const result = controller.liveness();
      expect(result).toEqual({ status: "ok" });
    });
  });

  describe("checkDatabase", () => {
    it("should return database health check result", async () => {
      const result = await controller.checkDatabase();
      expect(result.status).toBe("ok");
      expect(mockCheckFunction).toHaveBeenCalled();
    });
  });

  describe("checkRabbitMQ", () => {
    it("should return RabbitMQ health check result", async () => {
      const result = await controller.checkRabbitMQ();
      expect(result.status).toBe("ok");
      expect(mockCheckFunction).toHaveBeenCalled();
    });
  });
});
