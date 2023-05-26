import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import User from './User.entity';

@Entity()
export class ProjectUserPassword {
  @PrimaryColumn({ type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  // relations
  @OneToOne(() => User, (user) => user.projectUserPassword, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
