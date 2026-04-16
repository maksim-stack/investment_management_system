// users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Investment } from '../../investments/entities/investment.entity';
import { Exclude } from 'class-transformer';

export enum RiskProfile {
    CONSERVATIVE = 'conservative',
    MODERATE = 'moderate',
    AGGRESSIVE = 'aggressive',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate',
    })
    riskProfile: RiskProfile;
    
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Investment, (investment) => investment.user)
    investments: Investment[];
}