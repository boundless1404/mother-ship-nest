import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectAppConfiguration } from './ProjectAppConfiguration.entity';
import { ProjectConfEmailDetailTypeEnum } from '../../lib/enums';

@Entity()
export class ProjectConfEmailDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'enum', enum: ProjectConfEmailDetailTypeEnum })
  type: ProjectConfEmailDetailTypeEnum;

  @Column({ type: 'varchar' })
  emailSenderName: string;

  @Column({ type: 'varchar' })
  emailSenderAddress: string;

  @Column({ type: 'varchar' })
  emailSubject: string;

  @Column({ type: 'text' })
  emailBodyTemplate: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  projectAppConfigurationId: string;

  // relations
  @ManyToOne(
    () => ProjectAppConfiguration,
    (projectAppConfiguration) =>
      projectAppConfiguration.projectConfEmailDetails,
  )
  @JoinColumn({ name: 'projectAppConfigurationId' })
  projectAppConfiguration: ProjectAppConfiguration;
}
