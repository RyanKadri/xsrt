import { Recording, Without, DBConnectionSymbol } from "@xsrt/common";
import { ElasticService, recordingRepo, RecordingEntity } from "@xsrt/common-backend";
import { injectable, inject } from "inversify";
import { RecordingFilterParams } from "../endpoints/recording-endpoint-impl";
import { Connection, Repository, In } from "typeorm";

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

  async deleteRecordings(ids: string[]) {
    return await this.recordingRepo.delete({ id: In(ids) });
  }

  async createRecording(recordingData: Without<Recording, "_id">) {
    return this.recordingRepo.save(recordingData);
  }
}
