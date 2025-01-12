import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AppUser from '../../project/entities/AppUser.entity';
import { ProjectUser } from '../../project/entities/ProjectUser.entity';
import { ProjectUserPassword } from '../../project/entities/ProjectUserPassword.entity';
import { Token } from '../../project/entities/Token.entity';
import { PhoneCode } from '../../project/entities/PhoneCode.entity';
import { UUID_PREFIX } from '../../lib/enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({
    type: 'varchar',
    unique: true,
    default: `'${UUID_PREFIX.USER}-' || uuid_generate_v4()`,
  })
  publicId: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  firstName: string;

  @Column({ type: 'varchar', default: '' })
  middleName: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Index()
  @Column({ type: 'varchar', nullable: true, unique: true })
  phone: string;

  @Column({ type: 'bigint', nullable: true })
  phoneCodeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // *relations
  @OneToMany(() => AppUser, (appUser) => appUser.user)
  appUsers: AppUser[];

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  projectUsers: ProjectUser[];

  @OneToOne(
    () => ProjectUserPassword,
    (projectUserPassword) => projectUserPassword.user,
  )
  projectUserPassword: ProjectUserPassword;

  @OneToMany(() => Token, (token) => token.user)
  token: Token;

  @ManyToOne(() => PhoneCode, (phoneCode) => phoneCode.users)
  @JoinColumn({ name: 'phoneCodeId' })
  phoneCode: PhoneCode;
}
