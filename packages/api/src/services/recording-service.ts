import { inject, injectable } from "inversify";
import { Connection, In, Repository } from "typeorm";
import { ElasticService, recordingRepo } from "../../../common-backend/src";
import { DBConnectionSymbol, RecordingEntity } from "../../../common/src";
import { RecordingFilterParams } from "../endpoints/recording-endpoint-impl";

const defaultNumRecordings = 15;

@injectable()
export class RecordingService {

  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    private elasticService: ElasticService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  async fetchRecording(recordingId: string) {
    // TODO - Don't send back all chunk data
    return this.recordingRepo.findOne(recordingId, { relations: ["chunks"] })
  }

  async deleteRecording(recordingId: string): Promise<void> {
    await this.recordingRepo.delete(recordingId);
  }

  async filterRecordings({ site }: RecordingFilterParams) {
    const client = this.elasticService.client;
    const elasticRecordings = await client.search({
      ...recordingRepo,
      body: {
        query: {
          match: {
            site
          }
        }
      }
    });

    const ids = elasticRecordings.body.hits.hits.map((hit: any) => hit._id);
    return this.recordingRepo.findByIds(ids, { take: defaultNumRecordings });
  }

  async deleteRecordings(ids: number[]) {
    return await this.recordingRepo.delete({ id: In(ids) });
  }

  async createRecording(recordingData: Omit<RecordingEntity, "id">) {
    return this.recordingRepo.save(recordingData);
  }
}
