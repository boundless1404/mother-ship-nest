
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import App from './App.entity';
import { Token } from './Token.entity';
import { User } from '../../auth/entities/User.entity';

@Entity()
export default class AppUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // *foregin keys
  @Column({ type: 'bigint' })
  appId: string;

  @Column({ type: 'bigint' })
  userId: string;

  // *relations
  @ManyToOne(() => App, (app) => app.appUsers)
  @JoinColumn({ name: 'appId' })
  app: App;

  @ManyToOne(() => User, (user) => user.appUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Token, (token) => token.appUser)
  tokens: Token[];
}
