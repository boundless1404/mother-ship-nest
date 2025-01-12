import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Wallet_Owner from './wallet_owner.entity';
import { Wallet_Status } from '../../lib/enums';
import { Currency } from '../../project/entities/Currency.entity';
import Wallet_Transaction from './wallet_transaction.entity';
import { v4 } from 'uuid';
import { pg_time_stamp_zone } from '../../lib/projectConstants';

@Entity()
export default class Wallet {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'uuid', default: 'uuid_generate_v4()', unique: true })
  public_id: string;

  @Column({ type: 'enum', enum: Wallet_Status, default: Wallet_Status.ACTIVE })
  status: Wallet_Status;

  @Column({ type: 'numeric', default: '0' })
  balance: string;

  // foreign keys
  @Column({ type: 'bigint' })
  wallet_owner_app_user_id: string;

  @Column({ type: 'bigint' })
  currencyId: string;

  @CreateDateColumn(pg_time_stamp_zone)
  createdAt: Date;

  @UpdateDateColumn(pg_time_stamp_zone)
  updatedAt: Date;

  // relations
  @ManyToOne(() => Wallet_Owner, (wallet_owner) => wallet_owner.wallets)
  @JoinColumn({ name: 'wallet_owner_app_user_id' })
  wallet_owner: Wallet_Owner;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @OneToMany(
    () => Wallet_Transaction,
    (wallet_transaction) => wallet_transaction.destination_wallet,
  )
  destination_wallet_transactions: Wallet_Transaction[];

  @OneToMany(
    () => Wallet_Transaction,
    (source_wallet_transaction) => source_wallet_transaction.source_wallet,
  )
  source_wallet_transactions: Wallet_Transaction[];

  @BeforeInsert()
  async set_public_id() {
    const uuid = await import('uuid');
    this.public_id = uuid.v4();
  }
}
