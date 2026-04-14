import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('investments')
export class Investment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ length: 200 })
    asset: string;

    @Column({
        type: 'enum',
        enum: ['stock', 'bond', 'crypto', 'real_estate', 'etf'],
    })
    type: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2 })
    purchasePrice: number;

    @Column('decimal', { precision: 10, scale: 2})
    currentPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'date' })
    purchaseDate: Date;

    @ManyToOne(() => User, (user) => user.investments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}