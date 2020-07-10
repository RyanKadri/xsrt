import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { AssetEntity } from "./asset";
import { RecordingEntity } from "./recording";
// import { RecordedMutationGroup } from "./types";
import { RecordedInputChannels } from "./event-types";

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

  @ManyToOne(() => RecordingEntity, recording => recording.chunks)
  @JoinColumn({ name: "recording" })
  recording: RecordingEntity;

  @Column({ name: "init_chunk" })
  initChunk: boolean;

  @Column({ name: "snapshot", type: "json" })
  snapshot?: any;

  @Column({ name: "changes", type: "json" })
  // changes: RecordedMutationGroup[];
  changes: any[];

  @Column({ name: "inputs", type: "json" })
  inputs: RecordedInputChannels;

  @ManyToMany(() => AssetEntity, { cascade: ["insert", "update", "remove"] })
  @JoinTable({ name: "chunk_assets", joinColumn: { name: "chunk_id" }, inverseJoinColumn: { name: "asset_id" } })
  assets: AssetEntity[]

}
