import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from './Country.entity';
import { User } from 'src/auth/entities/User.entity';

@Entity()
export class PhoneCode {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  countryId: string;

  // relations
  @ManyToOne(() => Country, (country) => country.phoneCodes)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @OneToMany(() => User, (user) => user.phoneCode)
  users: User[];
}
