import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AppUser from '../../project/entities/AppUser.entity';
import { ProjectUser } from '../../project/entities/ProjectUser.entity';
import { ProjectUserPassword } from '../../project/entities/ProjectUserPassword.entity';
import { Token } from '../../project/entities/Token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  firstName: string;

  @Column({ type: 'varchar', default: '' })
  middleName: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

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

  @OneToOne(() => Token, (token) => token.user)
  token: Token;
}
