import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany, JoinColumn } from "typeorm";
import { TargetEntity } from "./targets";
import { ChunkEntity } from "./chunk";
// import { UADetails } from "./types";

@Entity({ name: "recording" })
export class RecordingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "uuid" })
  uuid: string;

  @ManyToOne(() => TargetEntity, target => target.recordings)
  @JoinColumn({ name: "target" })
  target: TargetEntity;

  @OneToMany(() => ChunkEntity, chunk => chunk.recording)
  chunks: ChunkEntity[];

  @Column({ name: "thumbnail_path", type: "text", nullable: true })
  thumbnailPath: string | null;

  @Column({ name: "start_time" })
  startTime: Date;

  @Column({ name: "duration", type: "integer", nullable: true })
  duration: number | null;

  @Column({ name: "ua_details", type: "json" })
  // uaDetails: UADetails;
  uaDetails: any;

  @Column({ name: "finalized" })
  finalized: boolean;
}
