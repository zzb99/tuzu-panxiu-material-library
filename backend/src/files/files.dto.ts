import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ResourceType } from '../contents/dto/content-query.dto';
export class DownloadFileDto{
 @IsEnum(ResourceType) resourceType!:ResourceType;
 @Type(()=>Number) @IsInt() @Min(1) resourceId!:number;
 @Type(()=>Number) @IsInt() @Min(1) mediaFileId!:number;
 @IsString() @IsNotEmpty() fileName!:string;
}
