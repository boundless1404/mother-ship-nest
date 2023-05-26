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
import AppUser from './AppUser.entity';
import ProjectUser from './ProjectUser.entity';
import { ProjectUserPassword } from './ProjectUserPassword.entity';
import Token from './Token.entity';

@Entity()
export default class User {
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
