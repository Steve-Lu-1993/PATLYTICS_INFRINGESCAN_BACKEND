import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    BeforeInsert,
  } from 'typeorm';
  
  @Entity('patent')
  @Index('publication_number', ['publication_number'])
  export class Patent {
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
  
    @Column({ type: 'varchar', length: 255 })
    publication_number!: string;
  
    @Column({ type: 'varchar', length: 255 })
    title!: string;
  
    @Column('text', { nullable: true })
    ai_summary?: string;
  
    @Column({ type: 'varchar', length: 255 })
    raw_source_url!: string;
  
    @Column('varchar', { length: 255, nullable: true })
    assignee!: string;
  
    @Column('json', { nullable: true })
    inventors!: object[];
  
    @Column({ type: 'bigint' })
    priority_date!: number;
  
    @Column({ type: 'bigint' })
    application_date!: number;
  
    @Column({ type: 'bigint' })
    grant_date!: number;

    @Column({ type: 'text',nullable:true})
    abstract!: string;

    @Column({ type: 'text',nullable:true})
    description!: string;

    @Column({ type: 'json',nullable:true})
    claims!: object[];

    @Column({ type: 'varchar',nullable:true})
    jurisdictions!: string;

    @Column({ type: 'json',nullable:true})
    classifications!: object;
  
    @Column('text', { nullable: true })
    application_events?: string;
  
    @Column('json', { nullable: true })
    citations?: object[];
  
    @Column('json', { nullable: true })
    image_urls?: string[];
  
    @Column({ type: 'text', nullable: true })
    landscapes?: string;
  
    @Column({ type: 'bigint' })
    publish_date!: number;
  
    @Column('text', { nullable: true })
    citations_non_patent?: string;
  
    @Column('varchar', { length: 255, nullable: true })
    provenance!: string;
  
    @Column('text', { nullable: true })
    attachment_urls?: string;

    @BeforeInsert()
    setTimestamps() {
      const now = Date.now();
      this.created_at = now;
      this.updated_at = now;
    }
  }
  