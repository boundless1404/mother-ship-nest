import { Credit_Source_Type, Wallet_Transaction_Type } from '../../lib/enums';
import { pg_time_stamp_zone } from '../../lib/projectConstants';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Wallet from './wallet.entity';
import { v4 } from 'uuid';

@Entity()
export default class Wallet_Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'enum', enum: Wallet_Transaction_Type })
  type: Wallet_Transaction_Type;

  /* Details about the transaction, say 'narration'. */
  @Column({ type: 'varchar' })
  description: string;

  /**
   * The transaction reference.
   */
  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'varchar' })
  destination_wallet_reference: string;

  @Column({ type: 'varchar', nullable: true })
  source_wallet_reference: string;

  /**
   * Details about the financial institution.
   */
  @Column({ type: 'varchar', nullable: true })
  credit_source_data: string;

  @Column({ type: 'enum', enum: Credit_Source_Type })
  credit_source_type: Credit_Source_Type;

  @CreateDateColumn(pg_time_stamp_zone)
  createdAt: Date;

  @UpdateDateColumn(pg_time_stamp_zone)
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  destination_wallet_id: string;

  @Column({ type: 'bigint', nullable: true })
  source_wallet_id: string;

  // relations
  @ManyToOne(() => Wallet, (wallet) => wallet.destination_wallet_transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destination_wallet_id' })
  destination_wallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.source_wallet_transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_wallet_id' })
  source_wallet: Wallet;

  @BeforeInsert()
  generateReference() {
    this.reference = v4();
  }
}
