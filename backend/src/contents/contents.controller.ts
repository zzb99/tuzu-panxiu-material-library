import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContentsService } from './contents.service';
import { AdminContentQueryDto, ContentBodyDto, FeaturedDto, PatternImageDto, PublicContentQueryDto, ResourceType, SortDto, StatusDto } from './dto/content-query.dto';

@Controller()
export class ContentsController {
  constructor(private readonly contents:ContentsService){}
  @Get('contents') publicList(@Query() q:PublicContentQueryDto){return this.contents.listPublic(q);}
  @Get('contents/:type/:id') publicDetail(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number){return this.contents.detail(type,String(id),true);}
  @Get('featured') featured(@Query('type') type?:ResourceType,@Query('limit') limit?:string){return this.contents.featured(type,limit?Number(limit):8);}

  @Get('admin/contents') @UseGuards(JwtAuthGuard) adminList(@Query() q:AdminContentQueryDto){return this.contents.listAdmin(q);}
  @Get('admin/contents/:type/:id') @UseGuards(JwtAuthGuard) adminDetail(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number){return this.contents.detail(type,String(id),false);}
  @Post('admin/contents/:type') @UseGuards(JwtAuthGuard) create(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Body() dto:ContentBodyDto){return this.contents.create(type,dto);}
  @Put('admin/contents/:type/:id') @UseGuards(JwtAuthGuard) update(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number,@Body() dto:ContentBodyDto){return this.contents.update(type,String(id),dto);}
  @Delete('admin/contents/:type/:id') @UseGuards(JwtAuthGuard) remove(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number){return this.contents.remove(type,String(id));}
  @Patch('admin/contents/:type/:id/status') @UseGuards(JwtAuthGuard) status(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number,@Body() dto:StatusDto){return this.contents.setStatus(type,String(id),dto.status);}
  @Patch('admin/contents/:type/:id/sort') @UseGuards(JwtAuthGuard) sort(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number,@Body() dto:SortDto){return this.contents.setSort(type,String(id),dto.sortOrder);}
  @Patch('admin/contents/:type/:id/featured') @UseGuards(JwtAuthGuard) featuredSet(@Param('type',new ParseEnumPipe(ResourceType)) type:ResourceType,@Param('id',ParseIntPipe) id:number,@Body() dto:FeaturedDto){return this.contents.setFeatured(type,String(id),dto.isFeatured);}
  @Post('admin/patterns/:patternId/images') @UseGuards(JwtAuthGuard) addImage(@Param('patternId',ParseIntPipe) id:number,@Body() dto:PatternImageDto){return this.contents.addPatternImage(String(id),dto);}
  @Put('admin/pattern-images/:id') @UseGuards(JwtAuthGuard) updateImage(@Param('id',ParseIntPipe) id:number,@Body() dto:PatternImageDto){return this.contents.updatePatternImage(String(id),dto);}
  @Delete('admin/pattern-images/:id') @UseGuards(JwtAuthGuard) removeImage(@Param('id',ParseIntPipe) id:number){return this.contents.removePatternImage(String(id));}
}
