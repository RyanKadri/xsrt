import Axios from "axios";
import { injectable } from "inversify";
import { RecordingChunk } from "../../scraper/types/types";

@injectable()
export class ChunkApiService {

    fetchChunk(chunkId: string): Promise<RecordingChunk> {
        return Axios.get(`/api/chunks/${chunkId}`)
            .then(resp => resp.data);
    }
}