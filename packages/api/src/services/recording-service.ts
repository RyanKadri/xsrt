import { inject, injectable } from "inversify";
import { Connection, In, Repository } from "typeorm";
import { DBConnectionSymbol, RecordingEntity } from "../../../common/src";
import { RecordingFilterParams } from "../endpoints/recording-endpoint-impl";

@injectable()
export class RecordingService {

  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  async fetchRecording(recordingId: string) {
    // TODO - Don't send back all chunk data
    return this.recordingRepo.findOne({ where: { uuid: recordingId }, relations: ["chunks"] })
  }

  async deleteRecording(recordingId: string): Promise<void> {
    await this.recordingRepo.delete(recordingId);
  }

  async filterRecordings({ target }: RecordingFilterParams) {
    return this.recordingRepo.createQueryBuilder("r")
      .innerJoin("r.target", "t")
      .where("t.customerId = :target", { target })
      .getMany();
  }

  async deleteRecordings(ids: number[]) {
    return await this.recordingRepo.delete({ id: In(ids) });
  }

  async createRecording(recordingData: Omit<RecordingEntity, "id">) {
    return this.recordingRepo.save(recordingData);
  }
}
