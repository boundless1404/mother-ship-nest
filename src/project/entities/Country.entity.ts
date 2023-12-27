import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PhoneCode } from './PhoneCode.entity';
import { Currency } from './Currency.entity';

@Entity()
export class Country {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  fullname: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  // relations
  @OneToMany(() => PhoneCode, (phoneCode) => phoneCode.country, {
    onDelete: 'CASCADE',
  })
  phoneCodes: PhoneCode[];

  @OneToMany(() => Currency, (currency) => currency.country, {
    onDelete: 'CASCADE',
  })
  currencies: Currency[];
}
