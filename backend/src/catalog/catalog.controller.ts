import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BannerDto, CatalogQueryDto, CategoryDto, PageContentDto, SiteSettingsDto, TagDto } from './catalog.dto';
import { CatalogService } from './catalog.service';
@Controller()
export class CatalogController{
 constructor(private readonly s:CatalogService){}
 @Get('banners') banners(@Query()q:CatalogQueryDto){return this.s.list('banner',q,true);}
 @Get('banners/:id') banner(@Param('id',ParseIntPipe)id:number){return this.s.detail('banner',String(id),true);}
 @Get('categories') categories(@Query()q:CatalogQueryDto){return this.s.list('category',q,true);}
 @Get('categories/:id') category(@Param('id',ParseIntPipe)id:number){return this.s.detail('category',String(id),true);}
 @Get('tags') tags(@Query()q:CatalogQueryDto){return this.s.list('tag',q,true);}
 @Get('tags/:id') tag(@Param('id',ParseIntPipe)id:number){return this.s.detail('tag',String(id),true);}
 @Get('pages/:key') page(@Param('key')key:string){return this.s.pageByKey(key);}
 @Get('site-settings') settings(){return this.s.getSettings();}
 @Get('admin/banners') @UseGuards(JwtAuthGuard) adminBanners(@Query()q:CatalogQueryDto){return this.s.list('banner',q,false);}
 @Get('admin/banners/:id') @UseGuards(JwtAuthGuard) adminBanner(@Param('id',ParseIntPipe)id:number){return this.s.detail('banner',String(id),false);}
 @Post('admin/banners') @UseGuards(JwtAuthGuard) createBanner(@Body()d:BannerDto){return this.s.create('banner',d);}
 @Put('admin/banners/:id') @UseGuards(JwtAuthGuard) updateBanner(@Param('id',ParseIntPipe)id:number,@Body()d:BannerDto){return this.s.update('banner',String(id),d);}
 @Delete('admin/banners/:id') @UseGuards(JwtAuthGuard) deleteBanner(@Param('id',ParseIntPipe)id:number){return this.s.remove('banner',String(id));}
 @Get('admin/categories') @UseGuards(JwtAuthGuard) adminCategories(@Query()q:CatalogQueryDto){return this.s.list('category',q,false);}
 @Get('admin/categories/:id') @UseGuards(JwtAuthGuard) adminCategory(@Param('id',ParseIntPipe)id:number){return this.s.detail('category',String(id),false);}
 @Post('admin/categories') @UseGuards(JwtAuthGuard) createCategory(@Body()d:CategoryDto){return this.s.create('category',d);}
 @Put('admin/categories/:id') @UseGuards(JwtAuthGuard) updateCategory(@Param('id',ParseIntPipe)id:number,@Body()d:CategoryDto){return this.s.update('category',String(id),d);}
 @Delete('admin/categories/:id') @UseGuards(JwtAuthGuard) deleteCategory(@Param('id',ParseIntPipe)id:number){return this.s.remove('category',String(id));}
 @Get('admin/tags') @UseGuards(JwtAuthGuard) adminTags(@Query()q:CatalogQueryDto){return this.s.list('tag',q,false);}
 @Get('admin/tags/:id') @UseGuards(JwtAuthGuard) adminTag(@Param('id',ParseIntPipe)id:number){return this.s.detail('tag',String(id),false);}
 @Post('admin/tags') @UseGuards(JwtAuthGuard) createTag(@Body()d:TagDto){return this.s.create('tag',d);}
 @Put('admin/tags/:id') @UseGuards(JwtAuthGuard) updateTag(@Param('id',ParseIntPipe)id:number,@Body()d:TagDto){return this.s.update('tag',String(id),d);}
 @Delete('admin/tags/:id') @UseGuards(JwtAuthGuard) deleteTag(@Param('id',ParseIntPipe)id:number){return this.s.remove('tag',String(id));}
 @Get('admin/pages') @UseGuards(JwtAuthGuard) adminPages(@Query()q:CatalogQueryDto){return this.s.list('page_content',q,false);}
 @Get('admin/pages/:id') @UseGuards(JwtAuthGuard) adminPage(@Param('id',ParseIntPipe)id:number){return this.s.detail('page_content',String(id),false);}
 @Post('admin/pages') @UseGuards(JwtAuthGuard) createPage(@Body()d:PageContentDto){return this.s.create('page_content',d);}
 @Put('admin/pages/:id') @UseGuards(JwtAuthGuard) updatePage(@Param('id',ParseIntPipe)id:number,@Body()d:PageContentDto){return this.s.update('page_content',String(id),d);}
 @Delete('admin/pages/:id') @UseGuards(JwtAuthGuard) deletePage(@Param('id',ParseIntPipe)id:number){return this.s.remove('page_content',String(id));}
 @Get('admin/site-settings') @UseGuards(JwtAuthGuard) adminSettings(){return this.s.getSettings();}
 @Put('admin/site-settings') @UseGuards(JwtAuthGuard) updateSettings(@Body()d:SiteSettingsDto){return this.s.updateSettings(d);}
}
