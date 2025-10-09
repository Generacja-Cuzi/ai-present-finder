import { plainToInstance } from "class-transformer";
import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from "class-validator";

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  BRIGHTDATA_API_KEY?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BRIGHTDATA_ENDPOINT = "https://api.brightdata.com/datasets/v3/scrape";

  @IsString()
  @IsOptional()
  CLOUDAMQP_URL = "amqp://admin:admin@localhost:5672";

  @IsString()
  @IsOptional()
  PORT = "3010";

  @IsBooleanString()
  @IsOptional()
  USE_MOCK_DATA = true;

  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
