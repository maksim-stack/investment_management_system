import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('investments')
export class Investment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ nullable: false, length: 150 })
    asset: string;

    @Column({
        type: 'enum',
        enum: ['stock', 'bond', 'crypto', 'real_estate', 'etf'],
    })
    type: string;

    @Column({ type: 'numeric', nullable: false, precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
    purchasePrice: number;

    @Column({ type: 'numeric', nullable: false, precision: 10, scale: 2 , transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
    currentPrice: number;

    @Column({ type: 'numeric', nullable: false, precision: 10, scale: 4, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'timestamp' })
    purchaseDate: Date;

    @ManyToOne(() => User, (user) => user.investments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}