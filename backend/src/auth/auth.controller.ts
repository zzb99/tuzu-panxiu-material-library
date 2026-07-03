import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminUser } from './admin-user.entity';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateAdminDto, LoginDto, UpdateAdminDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/auth/login') @Throttle({ default: { limit: 5, ttl: 60000 } }) login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Get('admin/auth/profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: Request & { user: AdminUser }) { return this.auth.toProfile(request.user); }

  @Patch('admin/auth/password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() request: Request & { user: AdminUser }, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(request.user.id, dto);
  }

  @Get('admin/admin-users')
  @UseGuards(JwtAuthGuard)
  listAdmins() { return this.auth.listAdmins(); }

  @Post('admin/admin-users')
  @UseGuards(JwtAuthGuard)
  createAdmin(@Body() dto: CreateAdminDto) { return this.auth.createAdmin(dto); }

  @Put('admin/admin-users/:id')
  @UseGuards(JwtAuthGuard)
  updateAdmin(@Req() request: Request & { user: AdminUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.auth.updateAdmin(String(id), request.user.id, dto);
  }
}
