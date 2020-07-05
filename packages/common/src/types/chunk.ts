import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AssetEntity } from "./asset";
import { RecordingEntity } from "./recording";
import { RecordedMutationGroup } from "./types";

@Entity({ name: "chunk" })
export class ChunkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "uuid" })
  uuid: string;

  @Column({ name: "chunk_type"})
  chunkType: "diff" | "snapshot";

  @Column({ name: "start_time" })
  startTime: Date;

  @Column({ name: "end_time" })
  endTime: Date;

  @ManyToOne(() => RecordingEntity)
  recording: RecordingEntity;

  @Column({ name: "init_chunk" })
  initChunk: boolean;

  @Column({ name: "snapshot", type: "json" })
  snapshot?: any;

  @Column({ name: "changes", type: "json" })
  changes: RecordedMutationGroup[];

  @Column({ name: "inputs", type: "json" })
  inputs: RecordedInputChannels;

  @ManyToMany(() => AssetEntity)
  @JoinTable({ name: "asset", joinColumn: { name: "asset_id" }, inverseJoinColumn: { name: "chunk_id" } })
  assets: AssetEntity[]

}
