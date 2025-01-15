import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './Project.entity';
import App from './App.entity';
import { AppVerificationPivot, AppVerificationType } from '../../lib/enums';
import { ProjectConfEmailDetail } from './ProjectConfEmailDetail.entity';

@Entity()
export class ProjectAppConfiguration {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  appAuthVerificationUrl: string;

  @Column({
    type: 'enum',
    enum: AppVerificationType,
    default: AppVerificationType.CODE,
  })
  appVerificationType: AppVerificationType;

  @Column({
    type: 'enum',
    enum: AppVerificationPivot,
    default: AppVerificationPivot.EMAIL,
  })
  appVerificationPivot: AppVerificationPivot;

  /**
   * The minimum for this value is 6.
   */
  @Column({ type: 'integer', default: 6 })
  verificationTokenCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sharedAppTokenSecret: string;

  @Column({ type: 'varchar', nullable: true })
  tokenExpiry: string;

  // foreign keys
  @Index()
  @Column({ type: 'bigint' })
  appId: string;

  @Index()
  @Column({ type: 'bigint' })
  projectId: string;

  // relations
  @ManyToOne(() => Project, (project) => project.projectAppConfigurations)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToOne(() => App, (app) => app.projectConfiguration)
  @JoinColumn({ name: 'appId' })
  app: App;

  @OneToMany(
    () => ProjectConfEmailDetail,
    (projectConfEmailDetail) => projectConfEmailDetail.projectAppConfiguration,
  )
  projectConfEmailDetails: ProjectConfEmailDetail[];
}
