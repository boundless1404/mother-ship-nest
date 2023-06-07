import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Token } from './Token.entity';
import { User } from '../../auth/entities/User.entity';
import { Project } from './Project.entity';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'boolean', nullable: true })
  isProjectCreator: boolean;

  @Column({ type: 'boolean' })
  isAdmin: boolean;

  // foregin keys
  @Column({ type: 'bigint' })
  userId: string;

  @Column({ type: 'bigint' })
  projectId: string;

  // relations
  @ManyToOne(() => User, (user) => user.projectUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Project, (project) => project.projectUsers)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToMany(() => Token, (token) => token.projectUser)
  tokens: Token[];
}
