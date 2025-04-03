import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import { Patent } from "./Patent";
import { Company } from "./Company";
import { UserComparison } from "./UserComparison";

@Entity("patent_company_comparison")
@Unique("patent_company_index", ["patent_id", "company_id"])
export class PatentCompanyComparison {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @ManyToOne(() => Patent)
  @JoinColumn({ name: "patent_id" })
  patent!: Patent;

  @Column({ type: "int" })
  patent_id!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ type: "int" })
  company_id!: number;

  @OneToMany(
    () => UserComparison,
    (userComparison) => userComparison.patentCompanyComparison
  )
  user_comparisons!: UserComparison[];

  @Column({ type: "json" })
  comparison_results!: {
    id: number;
    name: string;
    infringement_risk: "high" | "medium" | "low";
    confidence: number;
    infringing_claims: number[];
    infringement_analysis: string;
    product_to_claim_mapping: string;
  }[];

  @Column("json", { nullable: true })
  potential_infringement_product_ids!: number[];

  @BeforeInsert()
  setTimestamps() {
    const now = Date.now();
    this.created_at = now;
    this.updated_at = now;
  }
}
