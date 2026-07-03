import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ContentStatus { DRAFT = 'draft', PUBLISHED = 'published', OFFLINE = 'offline' }
export enum ContentSort { DEFAULT = 'default', LATEST = 'latest', POPULAR = 'popular', DOWNLOADS = 'downloads' }

export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}

export class SearchQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  @IsOptional() @Transform(({ value }) => Array.isArray(value) ? value : [value]) @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ContentSort) sort: ContentSort = ContentSort.DEFAULT;
  @IsOptional() @Transform(({ value }) => Array.isArray(value) ? value : [value]) @IsString({ each: true }) colors?: string[];
  @IsOptional() @Transform(({ value }) => Array.isArray(value) ? value : [value]) @IsString({ each: true }) crafts?: string[];
  @IsOptional() @Transform(({ value }) => Array.isArray(value) ? value : [value]) @IsString({ each: true }) parts?: string[];
  @IsOptional() @Transform(({ value }) => Array.isArray(value) ? value : [value]) @IsString({ each: true }) meanings?: string[];
}

export class AdminSearchQueryDto extends SearchQueryDto {
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
}
