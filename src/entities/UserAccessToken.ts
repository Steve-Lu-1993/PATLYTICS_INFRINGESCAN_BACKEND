import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BeforeInsert,
    JoinColumn,
    OneToOne,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity('user_access_token')
  export class UserAccessToken {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: "bigint" })
    created_at!: number;
  
    @Column({ type: "bigint" })
    updated_at!: number;
  
    @Column({ type: "bigint", nullable: true })
    deleted_at?: number;
  
    @Column({ type: "longtext", nullable: true })
    settings!: string;
  
    @OneToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;
  
    @Column({ type: "int" ,unique: true })
    user_id!: number;
  
    @Column({ type: "varchar", length: 255 })
    access_token!: string;
  
    @Column({ type: "varchar", length: 255 })
    refresh_token!: string;
  
    @Column({ type: "bigint" })
    access_token_expires_at!: number;
  
    @Column({ type: "bigint" })
    refresh_token_expires_at!: number;
  
    @BeforeInsert()
    setTimestamps() {
      const now = Date.now();
      this.created_at = now;
      this.updated_at = now;
    }
  }
  