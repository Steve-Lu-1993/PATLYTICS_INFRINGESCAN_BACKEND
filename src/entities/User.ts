import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserComparison } from "./UserComparison";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "varchar", length: 36 })
  uuid!: string;

  @Column({ type: "bigint" })
  created_at!: number;

  @Column({ type: "bigint" })
  updated_at!: number;

  @Column({ type: "bigint", nullable: true })
  deleted_at?: number;

  @Column({ type: "longtext", nullable: true })
  settings!: string;;

  @OneToMany(() => UserComparison, (userComparison) => userComparison.user)
  user_comparisons!: UserComparison[];

  @Column({
    type: "enum",
    enum: ["unverified", "active", "inactive", "blocked"],
    default: "active",
  })
  status!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  first_name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  last_name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  nickname!: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  email!: string;

  @Column({ type: "varchar"})
  password!: string;

  @Column({ type: "bigint", nullable: true })
  last_login_at!: number;

  @BeforeInsert()
  setTimestamps() {
    const now = Date.now();
    this.created_at = now;
    this.updated_at = now;
    this.last_login_at = now;
  }
}
