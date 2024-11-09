import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./Company";

@Entity("product")
export class Product {
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

  @ManyToOne(() => Company)
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ type: "int" })
  company_id?: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @BeforeInsert()
  setTimestamps() {
    const now = Date.now();
    this.created_at = now;
    this.updated_at = now;
  }
}
