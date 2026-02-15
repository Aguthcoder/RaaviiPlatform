import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "int" })
  capacity: number;

  @Column({ name: "current_bookings", type: "int", default: 0 })
  reservedCount: number;

  @Column({ type: "int", default: 0 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "text", array: true, nullable: true })
  tags?: string[];
}
