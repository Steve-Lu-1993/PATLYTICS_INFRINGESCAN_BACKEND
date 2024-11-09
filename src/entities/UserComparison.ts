import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PatentCompanyComparison } from "./PatentCompanyComparison";
import { User } from "./User";

@Entity("user_comparison")
export class UserComparison {
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
  settings!: string;

  @Column({ type: "enum", enum: ["active","archived"], default: "active", })
  status!: string;

  @ManyToOne(() => User, (user) => user.user_comparisons)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "int" })
  user_id!: number;

  @ManyToOne(() => PatentCompanyComparison, (patentCompanyComparison) => patentCompanyComparison.user_comparisons)
  @JoinColumn({ name: "patent_company_comparison_id" })
  patentCompanyComparison!: PatentCompanyComparison;

  @Column({ type: "int" })
  patent_company_comparison_id!: number;

  @BeforeInsert()
  setTimestamps() {
    const now = Date.now();
    this.created_at = now;
    this.updated_at = now;
  }
}
