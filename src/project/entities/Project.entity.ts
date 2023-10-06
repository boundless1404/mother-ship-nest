import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectUser } from './ProjectUser.entity';
import { ProjectAppConfiguration } from './ProjectAppConfiguration.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // foregin keys

  // relations
  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  projectUsers: ProjectUser[];

  @OneToMany(() => ProjectAppConfiguration, (projectApp) => projectApp.project)
  projectAppConfigurations: ProjectAppConfiguration[];

  //   @OneToMany(() => AppUser, (appUser) => appUser.project)
  //   appUsers: AppUser[];
}
