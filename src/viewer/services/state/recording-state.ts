import { injectable } from "inversify";
import { Recording } from '../../../scraper/types/types';
import { SimpleState } from './state';

@injectable()
export class RecordingState extends SimpleState<Recording, "_id"> {
    readonly id = "_id"
}