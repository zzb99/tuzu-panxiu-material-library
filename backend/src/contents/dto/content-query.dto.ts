import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsHexColor, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AdminSearchQueryDto, ContentStatus, SearchQueryDto } from '../../common/dto/query.dto';

export enum ResourceType {
  PATTERN = 'pattern', DOCUMENT = 'document', CREATION = 'creation', INHERITOR = 'inheritor',
  APPLICATION_CASE = 'application_case',
}

export class PublicContentQueryDto extends SearchQueryDto { @IsEnum(ResourceType) type!: ResourceType; }
export class AdminContentQueryDto extends AdminSearchQueryDto { @IsEnum(ResourceType) type!: ResourceType; }

export class ContentBodyDto {
  @IsString() @IsNotEmpty() @MaxLength(255) title!: string;
  @IsOptional() @IsString() @MaxLength(500) coverImage?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number | null;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() content?: string | null;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
  @IsOptional() @Transform(({ value }) => value === true || value === 'true' || value === 1) @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsString() @MaxLength(255) sourceArea?: string | null;
  @IsOptional() @IsString() @MaxLength(255) applicationPart?: string | null;
  @IsOptional() @IsString() @MaxLength(255) craftType?: string | null;
  @IsOptional() @IsArray() @IsHexColor({ each: true }) mainColors?: string[];
  @IsOptional() @IsString() meaning?: string | null;
  @IsOptional() @IsString() @MaxLength(255) author?: string | null;
  @IsOptional() @IsString() @MaxLength(500) source?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(9999) year?: number | null;
  @IsOptional() @IsString() summary?: string | null;
  @IsOptional() @IsString() @MaxLength(255) creatorName?: string | null;
  @IsOptional() @IsDateString() creationDate?: string | null;
  @IsOptional() @IsString() @MaxLength(100) level?: string | null;
  @IsOptional() @IsString() @MaxLength(255) region?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(9999) birthYear?: number | null;
  @IsOptional() @IsString() @MaxLength(100) caseType?: string | null;
  @IsOptional() @IsString() @MaxLength(255) clientName?: string | null;
  @IsOptional() @IsDateString() caseDate?: string | null;
}

export class StatusDto { @IsEnum(ContentStatus) status!: ContentStatus; }
export class SortDto { @Type(() => Number) @IsInt() sortOrder!: number; }
export class FeaturedDto { @Transform(({ value }) => value === true || value === 'true' || value === 1) @IsBoolean() isFeatured!: boolean; }

export class PatternImageDto {
  @IsString() @IsNotEmpty() @MaxLength(500) imageUrl!: string;
  @IsOptional() @IsString() @MaxLength(255) altText?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder = 0;
}
