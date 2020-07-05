import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RecordingEntity } from "./recording";

@Entity({ name: "target" })
export class TargetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name" })
  name: string;

  @Column({ name: "customer_id" })
  customerId: string;

  @OneToMany(() => RecordingEntity, recording => recording.target)
  recordings: RecordingEntity[];
}
