import { BeforeInsert, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";

@Entity("company")
export class Company {
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

  @OneToMany(() => Product, (product) => product.company)
  products!: Product[];

  @Column({ type: "varchar" })
  name!: string;

  @BeforeInsert()
  setTimestamps() {
    const now = Date.now();
    this.created_at = now;
    this.updated_at = now;
  }
}
