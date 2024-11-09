import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BeforeInsert,
    JoinColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity('otp_verification')
  export class OtpVerification {
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
  
    @ManyToOne(() => User, (user) => user.otp_verifications)
    @JoinColumn({ name: "user_id" })
    user!: User;
  
    @Column({ type: "int" })
    user_id!: number;
  
    @Column({type: "varchar" })
    code!: string;
  
    @Column({type:"enum", enum:["email", "phone"]})
    type!: string;
  
    @Column({ type: "enum", enum: ["register", "login", "reset_password"] })
    action!: string;
  
    @Column({type: "boolean"})
    is_valid!: boolean;
  
    @Column({ type: "bigint", nullable: true })
    verified_at?: number;
  
    @Column({ type: "bigint" })
    expires_at!: number;
  
    @BeforeInsert()
    setTimestamps() {
      const now = Date.now();
      this.created_at = now;
      this.updated_at = now;
    }
  }
  