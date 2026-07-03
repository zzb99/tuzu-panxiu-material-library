import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminUser } from './admin-user.entity';
import { ChangePasswordDto, CreateAdminDto, LoginDto, UpdateAdminDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.admins.createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where('admin.username = :username', { username: dto.username })
      .getOne();
    const hash = admin?.passwordHash.replace(/^\$2y\$/, '$2b$');
    if (!admin || admin.status !== 'active' || !hash || !(await bcrypt.compare(dto.password, hash))) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    await this.admins.update(admin.id, { lastLoginAt: new Date() });
    return {
      token: await this.jwt.signAsync({ sub: admin.id, username: admin.username }),
      admin: this.toProfile(admin),
    };
  }

  async findActiveById(id: string) {
    return this.admins.findOne({ where: { id, status: 'active' } });
  }

  toProfile(admin: AdminUser) {
    return { id: admin.id, username: admin.username, displayName: admin.displayName, email: admin.email };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const admin = await this.admins.createQueryBuilder('admin').addSelect('admin.passwordHash').where('admin.id = :id', { id }).getOne();
    if (!admin || !(await bcrypt.compare(dto.currentPassword, admin.passwordHash.replace(/^\$2y\$/, '$2b$')))) {
      throw new UnauthorizedException('当前密码错误');
    }
    await this.admins.update(id, { passwordHash: await bcrypt.hash(dto.newPassword, 12) });
    return { changed: true };
  }

  async listAdmins() {
    const items = await this.admins.find({ order: { id: 'ASC' } });
    return items.map((admin) => ({ ...this.toProfile(admin), status: admin.status, lastLoginAt: admin.lastLoginAt, createdAt: admin.createdAt }));
  }

  async createAdmin(dto: CreateAdminDto) {
    const exists = await this.admins.findOne({ where: [{ username: dto.username }, ...(dto.email ? [{ email: dto.email }] : [])] });
    if (exists) throw new ConflictException('管理员账号或邮箱已存在');
    const admin = this.admins.create({ username: dto.username, passwordHash: await bcrypt.hash(dto.password, 12), displayName: dto.displayName, email: dto.email || null, status: 'active' });
    return { ...this.toProfile(await this.admins.save(admin)), status: 'active' };
  }

  async updateAdmin(id: string, operatorId: string, dto: UpdateAdminDto) {
    const admin = await this.admins.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('管理员不存在');
    if (id === operatorId && dto.status === 'disabled') throw new BadRequestException('不能禁用当前登录账号');
    if (admin.status === 'active' && dto.status === 'disabled' && await this.admins.count({ where: { status: 'active' } }) <= 1) {
      throw new BadRequestException('至少保留一个可用管理员');
    }
    admin.displayName = dto.displayName;
    admin.email = dto.email || null;
    admin.status = dto.status;
    const saved = await this.admins.save(admin);
    return { ...this.toProfile(saved), status: saved.status };
  }
}
