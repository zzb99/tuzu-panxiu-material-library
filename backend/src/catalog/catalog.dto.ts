import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ContentStatus, PaginationQueryDto } from '../common/dto/query.dto';
import { ResourceType } from '../contents/dto/content-query.dto';

export class CatalogQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() keyword?:string;
  @IsOptional() @IsEnum(ResourceType) resourceType?:ResourceType;
  @IsOptional() @IsEnum(ContentStatus) status?:ContentStatus;
}
export class CategoryDto {
  @IsEnum(ResourceType) resourceType!:ResourceType;
  @IsOptional() @Type(()=>Number) @IsInt() @Min(1) parentId?:number|null;
  @IsString() @IsNotEmpty() @MaxLength(100) name!:string;
  @IsString() @IsNotEmpty() @MaxLength(120) slug!:string;
  @IsOptional() @IsString() @MaxLength(500) description?:string|null;
  @IsOptional() @Type(()=>Number) @IsInt() sortOrder=0;
  @IsOptional() @IsEnum(ContentStatus) status:ContentStatus=ContentStatus.PUBLISHED;
}
export class TagDto {
  @IsString() @IsNotEmpty() @MaxLength(100) name!:string;
  @IsString() @IsNotEmpty() @MaxLength(120) slug!:string;
  @IsOptional() @IsString() @MaxLength(500) description?:string|null;
  @IsOptional() @Type(()=>Number) @IsInt() sortOrder=0;
  @IsOptional() @IsEnum(ContentStatus) status:ContentStatus=ContentStatus.PUBLISHED;
}
export class BannerDto {
  @IsString() @IsNotEmpty() @MaxLength(255) title!:string;
  @IsOptional() @IsString() @MaxLength(500) subtitle?:string|null;
  @IsString() @IsNotEmpty() @MaxLength(500) imageUrl!:string;
  @IsOptional() @IsString() @MaxLength(500) linkUrl?:string|null;
  @IsOptional() @IsString() @MaxLength(100) linkText?:string|null;
  @IsOptional() @IsEnum(ContentStatus) status:ContentStatus=ContentStatus.DRAFT;
  @IsOptional() @Type(()=>Number) @IsInt() sortOrder=0;
  @IsOptional() @IsDateString() startAt?:string|null;
  @IsOptional() @IsDateString() endAt?:string|null;
}
export class PageContentDto {
  @IsString() @IsNotEmpty() @MaxLength(100) pageKey!:string;
  @IsString() @IsNotEmpty() @MaxLength(255) title!:string;
  @IsOptional() @IsString() @MaxLength(500) coverImage?:string|null;
  @IsOptional() @IsString() description?:string|null;
  @IsOptional() @IsString() content?:string|null;
  @IsOptional() @IsArray() @IsString({each:true}) tags?:string[];
  @IsOptional() @IsEnum(ContentStatus) status:ContentStatus=ContentStatus.DRAFT;
  @IsOptional() @Type(()=>Number) @IsInt() sortOrder=0;
  @IsOptional() @Transform(({value})=>value===true||value==='true'||value===1) @IsBoolean() isFeatured=false;
}

export class SiteSettingsDto {
  @IsString() @IsNotEmpty() @MaxLength(120) siteName!: string;
  @IsString() @IsNotEmpty() @MaxLength(255) siteSubtitle!: string;
  @IsOptional() @IsString() @MaxLength(500) contact?: string | null;
  @IsOptional() @IsString() @MaxLength(1000) copyright?: string | null;
  @IsOptional() @IsString() @MaxLength(120) icp?: string | null;
}
