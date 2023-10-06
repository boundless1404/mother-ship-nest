import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sms {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: false })
  sender: string;

  @Column({ type: 'varchar', nullable: false })
  to: string;
}
