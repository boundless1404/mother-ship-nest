import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AppUser from './AppUser.entity';
import ProjectUser from './ProjectUser.entity';
import { TokenCreationPurpose } from '../../lib/enums';
import User from './User.entity';
import App from './App.entity';

@Entity()
export default class Token {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar' })
  valueOfToken: string;

  @Column({ type: 'numeric' })
  expiry: number;

  @Column({ type: 'enum', enum: TokenCreationPurpose })
  purpose: TokenCreationPurpose;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // foregin keys
  /**
   * *For users invited to project
   */
  @Column({ type: 'bigint', nullable: true })
  projectUserId: string;

  /**
   * *For users on an app
   */
  @Column({ type: 'bigint', nullable: true })
  appUserId: string;

  /**
   * *For users who are project creators
   */
  @Column({ type: 'bigint', nullable: true })
  userId: string;

  /**
   * *For app access token
   */
  @Column({ type: 'bigint', nullable: true })
  appId: string;

  // relations
  @ManyToOne(() => AppUser, (appUser) => appUser.tokens)
  @JoinColumn({ name: 'appUserId' })
  appUser: AppUser;

  @ManyToOne(() => ProjectUser, (projectUser) => projectUser.tokens)
  @JoinColumn({ name: 'projectUserId' })
  projectUser: ProjectUser;

  @OneToOne(() => User, (user) => user.token)
  @JoinColumn()
  user: User;

  @OneToOne(() => App, (app) => app.token)
  @JoinColumn()
  app: App;
}
