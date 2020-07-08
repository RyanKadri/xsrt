import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { TargetEntity } from "./targets";
import { ChunkEntity } from "./chunk";
// import { UADetails } from "./types";

@Entity({ name: "recording" })
export class RecordingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "uuid" })
  uuid: string;

  @ManyToOne(() => TargetEntity)
  target: TargetEntity;

  @OneToMany(() => ChunkEntity, chunk => chunk.recording)
  chunks: ChunkEntity[];

  @Column({ name: "snapshot_path" })
  thumbnailPath: string | null;

  @Column({ name: "start_time" })
  startTime: Date;

  @Column({ name: "duration" })
  duration: number | null;

  @Column({ name: "ua_details", type: "json" })
  // uaDetails: UADetails;
  uaDetails: any;

  @Column({ name: "finalized" })
  finalized: boolean;
}
