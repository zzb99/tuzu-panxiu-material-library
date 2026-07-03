import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'admin_user' })
export class AdminUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ length: 64, unique: true }) username!: string;
  @Column({ name: 'password_hash', length: 255, select: false }) passwordHash!: string;
  @Column({ name: 'display_name', length: 100 }) displayName!: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email!: string | null;
  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' }) status!: 'active' | 'disabled';
  @Column({ name: 'last_login_at', type: 'datetime', nullable: true }) lastLoginAt!: Date | null;
  @Column({ name: 'created_at', type: 'datetime' }) createdAt!: Date;
  @Column({ name: 'updated_at', type: 'datetime' }) updatedAt!: Date;
}
