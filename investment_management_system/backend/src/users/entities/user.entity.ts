import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Investment } from '../../investments/entities/investment.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate',
    })
    riskProfile: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Investment, (investment) => investment.user)
    investments: Investment[];
}