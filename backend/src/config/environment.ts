import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString() @IsNotEmpty() DATABASE_HOST!: string;
  @IsInt() @Min(1) @Max(65535) DATABASE_PORT!: number;
  @IsString() @IsNotEmpty() DATABASE_USER!: string;
  @IsString() DATABASE_PASSWORD!: string;
  @IsString() @IsNotEmpty() DATABASE_NAME!: string;
  @IsInt() @Min(1) @Max(65535) BACKEND_PORT!: number;
  @IsString() @IsNotEmpty() JWT_SECRET!: string;
  @IsString() @IsNotEmpty() UPLOAD_DIR!: string;
  @IsInt() @Min(1) MAX_UPLOAD_SIZE!: number;
  @IsOptional() @IsString() CORS_ORIGINS?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const normalized = { ...config, MAX_UPLOAD_SIZE: parseFileSize(config.MAX_UPLOAD_SIZE) };
  const validated = plainToInstance(EnvironmentVariables, normalized, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) throw new Error(`环境变量配置无效：${errors.map((e) => e.property).join(', ')}`);
  return { ...config, ...validated };
}

function parseFileSize(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const match = value.trim().match(/^(\d+)(b|kb|mb|gb)?$/i);
  if (!match) return value;
  const units: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  return Number(match[1]) * units[(match[2] || 'b').toLowerCase()];
}
