import { pg_time_stamp_zone } from '../../lib/projectConstants';
import AppUser from '../../project/entities/AppUser.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Wallet from './wallet.entity';

@Entity()
export default class Wallet_Owner {
  // foreign keys
  @PrimaryColumn({ type: 'bigint' })
  app_user_id: string;

  @Column({ type: 'varchar', nullable: true })
  first_name: string;

  @Column({ type: 'varchar', nullable: true })
  last_name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @CreateDateColumn(pg_time_stamp_zone)
  createdAt: Date;

  @UpdateDateColumn(pg_time_stamp_zone)
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // relations
  @OneToOne(() => AppUser)
  @JoinColumn({ name: 'app_user_id' })
  app_user: AppUser;

  @OneToMany(() => Wallet, (wallet) => wallet.wallet_owner)
  wallets: Wallet[];
}
